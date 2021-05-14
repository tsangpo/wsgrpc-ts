import http from "http";
import { lcFirst, Stream, StreamDelegate } from "./utils";
import { data as pb } from "./proto/data.proto.generated";
import { v1to2 } from "./v1/v1to2";

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
  exec: (request: any) => Promise<any> | Stream<any>;
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

  public listenHttpServerRequest(server: http.Server, path: string) {
    // http
    server.on(
      "request",
      (request: http.IncomingMessage, response: http.ServerResponse) => {
        if (request.url?.startsWith(path)) {
          const httpHandler = new HttpHandler(path, this.services);
          httpHandler.handle(request, response);
        } else if (this.fallbacks?.onrequest) {
          this.fallbacks.onrequest(request, response);
        } else {
          response.statusCode = 404;
          response.end();
        }
      }
    );
  }

  public listenHttpServerUpgrade(server: http.Server, path: string) {
    // websocket
    //@ts-ignore
    const wss = new WebSocket.Server({ noServer: true });
    server.on(
      "upgrade",
      (request: http.IncomingMessage, socket, upgradeHead) => {
        const url = new URL(request.url!, `http://${request.headers.host}`);
        if (url.pathname == path) {
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
    method: string
  ): Promise<IRpcServer> {
    const meta = this.serviceDirectory[service];
    if (!meta) {
      throw new Error(`service not found: ${service}.${method}`);
    }
    method = lcFirst(method); // NOTE: lcFirst
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

    const [requestDecode, responseEncode, requestStream, responseStream] =
      meta.rpcs[method];
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
    if (request.method == "OPTIONS") {
      this._corsOptions(request, response);
      return;
    }
    if (request.method != "POST") {
      throw new Error("http method not supported");
    }
    const [service, method] = request
      .url!.substr(this.pathPrefix.length)
      .split("/");

    try {
      const rpc = await this.caller.getRpc(request, service, method);
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

  _corsOptions(req: http.IncomingMessage, res: http.ServerResponse) {
    const requestOrigin = req.headers["origin"];
    if (!requestOrigin) {
      res.writeHead(400);
      res.end("no header: Origin");
      return;
    }

    if (!req.headers["access-control-request-method"]) {
      res.writeHead(400);
      res.end("no header: Access-Control-Request-Method");
      return;
    }

    let allowHeaders = req.headers["access-control-request-headers"];
    if (!allowHeaders) {
      allowHeaders = "Authentication";
    }

    res.writeHead(204, {
      "Access-Control-Allow-Origin": requestOrigin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": allowHeaders,
    });
    res.end();
  }

  _readRequestText(request: http.IncomingMessage): Promise<string> {
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
    const request = JSON.parse(await this._readRequestText(req));
    const response = await rpc.exec(request);
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify(response));
  }
}

type IFrameCallback = (frame: pb.IDataFrame | null) => void;

class WebSocketConnection {
  _calls = new Map<number, IFrameCallback>();
  _v = "";

  constructor(
    private ws: WebSocket,
    request: http.IncomingMessage,
    services: IServiceDirectory
  ) {
    const caller = new Caller(services);
    ws.onmessage = async (event) => {
      let frame = pb.DataFrame.decode(new Uint8Array(event.data));
      if (!frame.callID) {
        return;
      }

      // console.log("frame", frame);
      if (!frame.header && !frame.trailer && !frame.body) {
        // try v1
        frame = v1to2.tryDecodeDataFrame(new Uint8Array(event.data))!;
        // console.log("v1 frame:", frame);
        if (frame) {
          this._v = "v1";
          if (frame.header) {
            // 发起，特殊处理
            const callID = frame.callID!;
            const { service, method } = frame.header;
            // console.log("s m", { service, method });
            this.ws.send(v1to2.encodeRequestOKResponse(callID));
            // console.log("encodeRequestOKResponse, set", { callID });
            // wait next data frame
            this._calls.set(callID, async (frame: pb.IDataFrame | null) => {
              // console.log("cb", { frame });
              if (!frame || !frame.body) {
                return;
              }

              try {
                const rpc = await caller.getRpc(request, service!, method!);
                // console.log("rpc", { rpc });
                if (rpc.requestStream || rpc.responseStream) {
                  // 只兼容 rpcUnaryUnary
                  throw new Error(
                    "stream not implemented for v1 compatibility"
                  );
                }
                await this.rpcUnaryUnary(frame, rpc);
                this.sendMessage({
                  callID,
                  trailer: {
                    status: pb.DataFrame.Trailer.Status.OK,
                  },
                });
              } catch (e) {
                // console.warn("v1 rpc error:", e.stack);
                this.sendMessage({
                  callID: frame.callID,
                  trailer: {
                    status: pb.DataFrame.Trailer.Status.ERROR,
                    message: e.toString(),
                  },
                });
              } finally {
                this._calls.delete(callID);
              }
            });
            return;
          }
          // pass to handle callback
        } else {
          return;
        }
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
            await this.rpcStreamUnary(frame, rpc);
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
      } else {
        console.log("frame without header and callback:", frame);
        console.log("this is a bug of client stream request");
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

    // for v1
    if (this._v == "v1") {
      const ff = v1to2.encodeDataFrame(message);
      for (const f of ff) {
        this.ws.send(f);
      }
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
      trailer: { status: pb.DataFrame.Trailer.Status.OK },
    });
  }

  async rpcUnaryStream({ callID, body }: pb.IDataFrame, rpc: IRpcServer) {
    const request = rpc.requestDecode(body!);
    const streamDelegate = new StreamDelegate();
    this.registerCall(callID!, (frame) => {
      // console.debug("rpcUnaryStream.onframe:", { callID, frame });
      if (!frame) {
        streamDelegate.abort(new Error("lost connection"));
        return;
      }
      if (frame.trailer) {
        if (frame.trailer.status == pb.DataFrame.Trailer.Status.ABORT) {
          streamDelegate.abort(new Error(frame.trailer.message));
        }
      }
    });
    const response: Stream = await rpc.exec(request);
    streamDelegate.bind(response);
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

    const streamDelegate = new StreamDelegate();
    const checkCloseCall = () => {
      if (request.closed && streamDelegate.closed) {
        this._calls.delete(callID!);
      }
    };

    this.registerCall(callID!, (frame) => {
      // console.log("rpcStreamStream read frame:", frame);
      if (!frame) {
        streamDelegate.abort(new Error("lost connection"));
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
          streamDelegate.abort(new Error(frame.trailer.message));
        }
        checkCloseCall();
      }
    });

    const response: Stream = await rpc.exec(request);
    streamDelegate.bind(response);
    response
      .read((message) => {
        // console.log("rpcStreamStream send message:", message);
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

    // console.log("rpcStreamUnary:", callID);
    this.registerCall(callID!, (frame) => {
      console.log("request:", frame);
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
      trailer: { status: pb.DataFrame.Trailer.Status.OK },
    });
  }
}
