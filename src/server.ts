import http from "http";
import { Stream } from "./utils";
import { data as pb } from "./proto/data.proto.generated";

///////////////// message /////////////////////

export type ISerializer = (message: any) => Uint8Array;
export type IDeserializer = (bytes: Uint8Array) => any;

///////////////// server /////////////////////

type IServiceMeta = {
  //requestDecode, responseEncode, requestStream, responseStream
  [key: string]: [IDeserializer, ISerializer, boolean, boolean];
};

type IServiceFactory = (request: http.IncomingMessage) => Promise<any>;

type IServiceDirectory = {
  [key: string]: {
    rpcs: IServiceMeta;
    factory: IServiceFactory;
  };
};

interface IRpcServer {
  requestDecode: IDeserializer;
  responseEncode: ISerializer;
  requestStream: boolean;
  responseStream: boolean;
  exec: (request: any) => Promise<any>;
}

export class Server {
  private services: IServiceDirectory = {};
  private fallbacks: {
    onrequest?: (
      request: http.IncomingMessage,
      response: http.ServerResponse
    ) => void;
    onupgrade?: (
      request: http.IncomingMessage,
      socket: any,
      upgradeHead: any
    ) => void;
  } = {};

  public addService(
    service: string,
    rpcs: IServiceMeta,
    factory: IServiceFactory
  ) {
    this.services[service] = { rpcs, factory };
  }

  public mountHttpServer(server: http.Server, path: string) {
    // http
    const httpHandler = new HttpHandler(path, this.services);
    server.on(
      "request",
      (request: http.IncomingMessage, response: http.ServerResponse) => {
        if (request.url?.startsWith(path)) {
          httpHandler.handle(request, response);
        } else if (this.fallbacks?.onrequest) {
          this.fallbacks.onrequest(request, response);
        } else {
          response.statusCode = 404;
          response.end();
        }
      }
    );

    // websocket
    //@ts-ignore
    const wss = new WebSocket.Server({ noServer: true });
    server.on(
      "upgrade",
      (request: http.IncomingMessage, socket, upgradeHead) => {
        if (request.url == path) {
          wss.handleUpgrade(
            request,
            socket,
            upgradeHead,
            (ws: WebSocket, request: http.IncomingMessage) =>
              new WebSocketConnection(ws, request, this.services)
          );
        } else if (this.fallbacks?.onupgrade) {
          this.fallbacks.onupgrade(request, socket, upgradeHead);
        } else {
          socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
          socket.destroy();
        }
      }
    );
  }

  public fallback(
    onrequest?: (
      request: http.IncomingMessage,
      response: http.ServerResponse
    ) => void,
    onupgrade?: (
      request: http.IncomingMessage,
      socket: any,
      upgradeHead: any
    ) => void
  ) {
    this.fallbacks = { onrequest, onupgrade };
  }
}

// 独立出来，是因为可不和 ws 绑定，也许可用于其他传输层
class Caller {
  private services: { [key: string]: Promise<any> } = {};
  constructor(private serviceDirectory: IServiceDirectory) {}

  async getRpc(
    request: http.IncomingMessage,
    service: string,
    method: string,
    isolated = false
  ): Promise<IRpcServer> {
    const meta = this.serviceDirectory[service];
    if (!meta) {
      throw new Error(`service not found: ${service}.${method}`);
    }
    if (!(method in meta.rpcs)) {
      throw new Error(`method not found: ${service}.${method}`);
    }

    let sp: Promise<any>;
    if (isolated) {
      sp = meta.factory(request);
      if (!sp) {
        throw new Error(`create service error: ${service}.${method}`);
      }
    } else {
      sp = this.services[service];
      if (!sp) {
        sp = meta.factory(request);
        if (!sp) {
          throw new Error(`create service error: ${service}.${method}`);
        }
        this.services[service] = sp;
      }
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

class HttpHandler {
  caller: Caller;
  pathPrefix: string;
  constructor(pathPrefix: string, services: IServiceDirectory) {
    // important!!! don't use node lib so that can compile for browser
    if (!pathPrefix.endsWith("/")) {
      pathPrefix += "/";
    }
    this.pathPrefix = pathPrefix;
    this.caller = new Caller(services);
  }

  async handle(request: http.IncomingMessage, response: http.ServerResponse) {
    if (request.method != "POST") {
      throw new Error("http method not supported");
    }
    const [service, method] = request
      .url!.substr(this.pathPrefix.length)
      .split("/");

    try {
      const rpc = await this.caller.getRpc(request, service, method, true);
      if (!rpc.requestStream && !rpc.responseStream) {
        await this.rpcUnaryUnary(request, response, rpc);
      } else {
        response.statusCode = 501;
        response.end();
      }
    } catch (e) {
      response.statusCode = 500;
      response.end(e.toString());
    }
  }

  readRequestText(request: http.IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
      let body: any[] = [];
      request
        .on("error", (err) => {
          reject(err);
        })
        .on("data", (chunk) => {
          body.push(chunk);
        })
        .on("end", () => {
          const result = Buffer.concat(body).toString();
          resolve(result);
        });
    });
  }

  async rpcUnaryUnary(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    rpc: IRpcServer
  ) {
    if (req.headers["content-type"] != "application/json") {
      throw new Error("codec not supported");
    }
    const request = JSON.parse(await this.readRequestText(req));
    const response = await rpc.exec(request);
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify(response));
  }
}

type IFrameCallback = (frame: pb.IDataFrame | null) => void;

class WebSocketConnection {
  _calls = new Map<number, IFrameCallback>();

  constructor(
    private ws: WebSocket,
    request: http.IncomingMessage,
    services: IServiceDirectory
  ) {
    const caller = new Caller(services);
    ws.onmessage = async (event) => {
      let frame = pb.DataFrame.decode(new Uint8Array(event.data as any));
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
            trailer: {
              status: pb.DataFrame.Trailer.Status.ERROR,
              message: e.toString(),
            },
          });
        }
      }
    };
    ws.onclose = () => {
      this._calls.forEach((cb) => cb(null));
      this._calls.clear();
    };
  }

  private sendMessage(message: pb.IDataFrame) {
    if (this.ws.readyState != WebSocket.OPEN) {
      return;
    }
    const data = pb.DataFrame.encode(message);
    this.ws.send(data);
  }

  private registerCall(cid: number, callback: IFrameCallback) {
    this._calls.set(cid, callback);
  }

  async rpcUnaryUnary({ callID, body }: pb.IDataFrame, rpc: IRpcServer) {
    const request = rpc.requestDecode(body!);
    const response = await rpc.exec(request);
    this.sendMessage({
      callID,
      body: rpc.responseEncode(response),
    });
  }

  async rpcUnaryStream({ callID, body }: pb.IDataFrame, rpc: IRpcServer) {
    const request = rpc.requestDecode(body!);
    const response: Stream = await rpc.exec(request);
    this.registerCall(callID!, (frame) => {
      // console.debug("rpcUnaryStream.onframe:", { callID, frame });
      if (!frame) {
        response.abort(new Error("lost connection"));
        return;
      }
      if (frame.trailer) {
        if (frame.trailer.status == pb.DataFrame.Trailer.Status.ABORT) {
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
          trailer: { status: pb.DataFrame.Trailer.Status.OK },
        });
      })
      .catch((e) => {
        this.sendMessage({
          callID,
          trailer: {
            status: pb.DataFrame.Trailer.Status.ERROR,
            message: e.toString(),
          },
        });
      })
      .finally(() => {
        this._calls.delete(callID!);
      });
  }

  async rpcStreamStream({ callID }: pb.IDataFrame, rpc: IRpcServer) {
    const request = new Stream((e) => {
      this.sendMessage({
        callID,
        trailer: {
          status: pb.DataFrame.Trailer.Status.ABORT,
          message: e?.toString(),
        },
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
        if (frame.trailer.status == pb.DataFrame.Trailer.Status.OK) {
          request.end();
        } else if (frame.trailer.status == pb.DataFrame.Trailer.Status.ERROR) {
          request.error(new Error(frame.trailer.message));
        } else if (frame.trailer.status == pb.DataFrame.Trailer.Status.ABORT) {
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
          trailer: { status: pb.DataFrame.Trailer.Status.OK },
        });
      })
      .catch((e) => {
        this.sendMessage({
          callID,
          trailer: {
            status: pb.DataFrame.Trailer.Status.ERROR,
            message: e.toString(),
          },
        });
      })
      .finally(checkCloseCall);
  }

  async rpcStreamUnary({ callID }: pb.IDataFrame, rpc: IRpcServer) {
    const request = new Stream((e) => {
      this.sendMessage({
        callID,
        trailer: {
          status: pb.DataFrame.Trailer.Status.ABORT,
          message: e?.toString(),
        },
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
        if (frame.trailer.status == pb.DataFrame.Trailer.Status.OK) {
          request.end();
        } else if (frame.trailer.status == pb.DataFrame.Trailer.Status.ERROR) {
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
