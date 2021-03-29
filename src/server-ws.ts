import WebSocket from "ws";
import http from "http";
import { hrpc, Stream, IFrameCallback, IRpcServer, IServiceDirectory } from ".";

export function startWebSocketEndpoint(
  server: http.Server,
  path: string,
  service: IServiceDirectory
): void {
  const wss = new WebSocket.Server({ noServer: true });
  server.on("upgrade", (request, socket, upgradeHead) => {
    if (new URL(request.url!).pathname == path) {
      wss.handleUpgrade(
        request,
        socket,
        upgradeHead,
        (ws, request) => new Connection(ws, request, service)
      );
    } else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      socket.destroy();
    }
  });
}

// 独立出来，是因为可不和 ws 绑定，也许可用于其他传输层
class Caller {
  private services: { [key: string]: any } = {};
  constructor(private serviceDirectory: IServiceDirectory) {}

  async getRpc(
    request: http.IncomingMessage,
    service: string,
    method: string
  ): Promise<IRpcServer> {
    const meta = this.serviceDirectory[service];
    if (!meta) {
      throw new Error(`service not found: ${service}.${method}`);
    }
    if (!(method in meta.rpcs)) {
      throw new Error(`method not found: ${service}.${method}`);
    }

    let sp = this.services[service];
    if (!sp) {
      sp = meta.factory(request);
      if (!sp) {
        throw new Error(`create service error: ${service}.${method}`);
      }
      this.services[service] = sp;
    }
    const s = await sp;

    const rpc = s[method];
    if (!rpc) {
      throw new Error(`method not implemented: ${service}.${method}`);
    }

    const [
      requestDecode,
      responseEncode,
      requestStream,
      responseStream,
    ] = meta.rpcs[method];
    return {
      requestDecode,
      responseEncode,
      requestStream,
      responseStream,
      exec: rpc.bind(s) as (request: any) => Promise<any>,
    };
  }
}

class Connection {
  _calls = new Map<number, IFrameCallback>();

  constructor(
    private ws: WebSocket,
    request: http.IncomingMessage,
    services: IServiceDirectory
  ) {
    const caller = new Caller(services);
    ws.onmessage = async (event) => {
      let frame = hrpc.DataFrame.decode(new Uint8Array(event.data as any));
      if (!frame.callID) {
        return;
      }
      let callback = this._calls.get(frame.callID!);
      if (callback) {
        callback(frame);
      } else if (frame.header) {
        // new call
        const { service, method } = frame.header;
        try {
          const rpc = await caller.getRpc(request, service!, method!);
          if (!rpc.requestStream && !rpc.responseStream) {
            await this.rpcUnaryUnary(frame, rpc);
          } else if (!rpc.requestStream && rpc.responseStream) {
            await this.rpcUnaryStream(frame, rpc);
          } else if (rpc.requestStream && !rpc.responseStream) {
            await this.rpcStreamStream(frame, rpc);
          } else if (rpc.requestStream && rpc.responseStream) {
            await this.rpcStreamStream(frame, rpc);
          }
        } catch (e) {
          this.sendMessage({
            callID: frame.callID,
            trailer: { status: "ERROR", message: e.toString() },
          });
        }
      }
    };
    ws.onclose = () => {
      this._calls.forEach((cb) => cb(null));
      this._calls.clear();
    };
  }

  private sendMessage(message: hrpc.IDataFrame) {
    if (this.ws.readyState != WebSocket.OPEN) {
      return;
    }
    const data = hrpc.DataFrame.encode(message);
    this.ws.send(data);
  }

  private registerCall(cid: number, callback: IFrameCallback) {
    this._calls.set(cid, callback);
  }

  async rpcUnaryUnary({ callID, body }: hrpc.IDataFrame, rpc: IRpcServer) {
    const request = rpc.requestDecode(body!);
    const response = await rpc.exec(request);
    this.sendMessage({
      callID,
      body: rpc.responseEncode(response),
    });
  }

  async rpcUnaryStream({ callID, body }: hrpc.IDataFrame, rpc: IRpcServer) {
    const request = rpc.requestDecode(body!);
    const response: Stream = await rpc.exec(request);
    this.registerCall(callID!, (frame) => {
      if (!frame) {
        response.abort(new Error("lost connection"));
        return;
      }
      if (frame.trailer) {
        if (frame.trailer.status == "ABORT") {
          response.abort(new Error(frame.trailer.message));
        }
      }
    });
    response
      .read((message) => {
        this.sendMessage({
          callID,
          body: rpc.responseEncode(message),
        });
      })
      .then(() => {
        this.sendMessage({
          callID,
          trailer: { status: "OK" },
        });
      })
      .catch((e) => {
        this.sendMessage({
          callID,
          trailer: { status: "ERROR", message: e.toString() },
        });
      })
      .finally(() => {
        this._calls.delete(callID!);
      });
  }

  async rpcStreamStream({ callID }: hrpc.IDataFrame, rpc: IRpcServer) {
    const request = new Stream((e) => {
      this.sendMessage({
        callID,
        trailer: { status: "ABORT", message: e?.toString() },
      });
    });
    const response: Stream = await rpc.exec(request);
    const checkCloseCall = () => {
      if (request.closed && response.closed) {
        this._calls.delete(callID!);
      }
    };

    this.registerCall(callID!, (frame) => {
      if (!frame) {
        response.abort(new Error("lost connection"));
        return;
      }
      if (frame.body) {
        const message = rpc.requestDecode(frame.body!);
        request.write(message);
      }
      if (frame.trailer) {
        if (frame.trailer.status == "OK") {
          request.end();
        } else if (frame.trailer.status == "ERROR") {
          request.error(new Error(frame.trailer.message));
        } else if (frame.trailer.status == "ABORT") {
          response.abort(new Error(frame.trailer.message));
        }
        checkCloseCall();
      }
    });
    response
      .read((message) => {
        this.sendMessage({
          callID,
          body: rpc.responseEncode(message),
        });
      })
      .then(() => {
        this.sendMessage({
          callID,
          trailer: { status: "OK" },
        });
      })
      .catch((e) => {
        this.sendMessage({
          callID,
          trailer: { status: "ERROR", message: e.toString() },
        });
      })
      .finally(checkCloseCall);
  }

  async rpcStreamUnary({ callID }: hrpc.IDataFrame, rpc: IRpcServer) {
    const request = new Stream((e) => {
      this.sendMessage({
        callID,
        trailer: { status: "ABORT", message: e?.toString() },
      });
    });

    this.registerCall(callID!, (frame) => {
      if (!frame) {
        return;
      }
      if (frame.body) {
        const message = rpc.requestDecode(frame.body!);
        request.write(message);
      }
      if (frame.trailer) {
        if (frame.trailer.status == "OK") {
          request.end();
        } else if (frame.trailer.status == "ERROR") {
          request.error(new Error(frame.trailer.message));
        }
        this._calls.delete(callID!);
      }
    });

    const response = await rpc.exec(request);
    this.sendMessage({
      callID,
      body: rpc.responseEncode(response),
    });
  }
}
