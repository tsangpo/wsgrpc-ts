import { Future, Stream } from "./utils";
import { data as pb } from "./proto/data.proto.generated";

///////////////// message /////////////////////

export type ISerializer = (message: any) => Uint8Array;
export type IDeserializer = (bytes: Uint8Array) => any;

///////////////// client /////////////////////

type IRpc<T> = (
  service: string,
  method: string,
  requestSerializer: ISerializer,
  responseDeserialize: IDeserializer,
  request: any
) => T | Promise<T>;

export interface IChannel {
  rpcUnaryUnary: IRpc<Promise<any>>;
  rpcUnaryStream: IRpc<Stream<any>>;
  rpcStreamStream: IRpc<Stream<any>>;
  rpcStreamUnary: IRpc<Promise<any>>;
}

interface IAgent {
  reset(): void;
  getConnection(): Promise<IChannel> | IChannel;
}

export class Channel implements IChannel {
  agent!: IAgent;

  constructor(
    url: string,
    private callback?: (req: any, res?: any, err?: any) => void
  ) {
    if (!url) {
      throw new Error("no url provided.");
    }
    this.reset(url);
  }

  reset(url?: string) {
    this.agent?.reset();
    if (url) {
      if (url.startsWith("http:") || url.startsWith("https:")) {
        this.agent = new HttpAgent(url);
      } else if (url.startsWith("ws:") || url.startsWith("wss:")) {
        this.agent = new WebSocketAgent(url);
      } else {
        throw new Error("channel url not supported: " + url);
      }
    }
  }

  async rpcUnaryUnary(
    service: string,
    method: string,
    requestSerializer: ISerializer,
    responseDeserializeBinary: IDeserializer,
    request: any
  ) {
    const c = await this.agent.getConnection();
    return c
      .rpcUnaryUnary(
        service,
        method,
        requestSerializer,
        responseDeserializeBinary,
        request
      )
      .then(
        (res: any) => {
          this.callback && this.callback(request, res);
          return res;
        },
        (err: any) => {
          this.callback && this.callback(request, null, err);
          throw err;
        }
      );
  }

  async rpcUnaryStream(
    service: string,
    method: string,
    requestSerializer: ISerializer,
    responseDeserializeBinary: IDeserializer,
    request: any
  ) {
    const c = await this.agent.getConnection();
    return c.rpcUnaryStream(
      service,
      method,
      requestSerializer,
      responseDeserializeBinary,
      request
    );
  }

  async rpcStreamStream(
    service: string,
    method: string,
    requestSerializer: ISerializer,
    responseDeserializeBinary: IDeserializer,
    request: any
  ) {
    const c = await this.agent.getConnection();
    return c.rpcStreamStream(
      service,
      method,
      requestSerializer,
      responseDeserializeBinary,
      request
    );
  }

  async rpcStreamUnary(
    service: string,
    method: string,
    requestSerializer: ISerializer,
    responseDeserializeBinary: IDeserializer,
    request: any
  ) {
    const c = await this.agent.getConnection();
    return c
      .rpcStreamUnary(
        service,
        method,
        requestSerializer,
        responseDeserializeBinary,
        request
      )
      .then(
        (res: any) => {
          this.callback && this.callback(request, res);
          return res;
        },
        (err: any) => {
          this.callback && this.callback(request, null, err);
          throw err;
        }
      );
  }
}

//////////// http /////////////

class HttpAgent implements IAgent {
  url: string;
  constructor(url: string) {
    this.url = url + (url.endsWith("/") ? "" : "/");
  }

  getConnection() {
    return this;
  }

  reset() {}

  async rpcUnaryUnary(
    service: string,
    method: string,
    requestSerializer: ISerializer,
    responseDeserializeBinary: IDeserializer,
    request: any
  ) {
    const url = this.url + service + "/" + method;
    const res = await fetch(url, {
      method: "post",
      body: JSON.stringify(request),
      headers: { "Content-Type": "application/json" },
    });
    return await res.json();
  }

  rpcUnaryStream(
    service: string,
    method: string,
    requestSerializer: ISerializer,
    responseDeserializeBinary: IDeserializer,
    request: any
  ): Stream<any> {
    throw new Error("method not supported");
  }

  rpcStreamStream(
    service: string,
    method: string,
    requestSerializer: ISerializer,
    responseDeserializeBinary: IDeserializer,
    request: any
  ): Stream<any> {
    throw new Error("method not supported");
  }

  rpcStreamUnary(
    service: string,
    method: string,
    requestSerializer: ISerializer,
    responseDeserializeBinary: IDeserializer,
    request: any
  ): Promise<any> {
    throw new Error("method not supported");
  }
}

//////////// WebSocket /////////////

const WebSocket_OPEN = 1;

class WebSocketAgent implements IAgent {
  connectionFuture: Future<WebSocketConnection> | null;

  constructor(private url: string) {
    this.connectionFuture = null;
  }

  public async getConnection() {
    if (this.connectionFuture?.resolved) {
      if (this.connectionFuture.result) {
        if (this.connectionFuture.result.ws.readyState != WebSocket_OPEN) {
          this.connectionFuture = null;
        }
      } else {
        // error
        this.connectionFuture = null;
      }
    }
    if (!this.connectionFuture) {
      const future = new Future<WebSocketConnection>();
      const ws = new WebSocket(this.url);
      ws.binaryType = "arraybuffer";
      ws.onopen = () => {
        future.resolve(new WebSocketConnection(ws));
      };
      ws.onclose = (e) => {
        future.reject(e);
      };
      this.connectionFuture = future;
    }
    return await this.connectionFuture.promise;
  }

  reset() {
    if (this.connectionFuture?.result) {
      if (this.connectionFuture.result.ws.readyState == WebSocket_OPEN) {
        this.connectionFuture.result.ws.close();
      }
    }
    this.connectionFuture = null;
  }
}

type IFrameCallback = (frame: pb.IDataFrame | null) => void;

class WebSocketConnection {
  _nextCallID = 1;
  _calls = new Map<number, IFrameCallback>();

  constructor(public ws: WebSocket) {
    ws.onmessage = (event) => {
      let frame = pb.DataFrame.decode(new Uint8Array(event.data));
      let callback = this._calls.get(frame.callID!);
      if (callback) {
        callback(frame);
      }
    };
    ws.onclose = () => {
      ws.onopen = null;
      ws.onmessage = null;
      ws.onerror = null;
      ws.onclose = null;
      this._calls.forEach((cb) => cb(null));
      this._calls.clear();
    };
  }

  private registerCall(callback: IFrameCallback) {
    const cid = this._nextCallID;
    this._calls.set(cid, callback);
    this._nextCallID += 2;
    return cid;
  }

  private sendMessage(message: pb.IDataFrame) {
    if (this.ws.readyState != WebSocket_OPEN) {
      return;
    }
    const data = pb.DataFrame.encode(message);

    if (typeof window != "undefined" && (window as any).wx) {
      // weixin mini game
      this.ws.send(
        data.buffer.slice(data.byteOffset, data.byteOffset + data.length)
      );
    } else {
      this.ws.send(data);
    }
  }

  rpcUnaryUnary(
    service: string,
    method: string,
    requestSerializer: ISerializer,
    responseDeserializeBinary: IDeserializer,
    request: any
  ) {
    const future = new Future();
    const callID = this.registerCall((frame) => {
      if (!frame) {
        future.reject(new Error("lost connection"));
        return;
      }
      this._calls.delete(callID);
      if (frame.body) {
        const message = responseDeserializeBinary(frame.body);
        future.resolve(message);
        return;
      }
      if (frame.trailer) {
        if (frame.trailer.status == pb.DataFrame.Trailer.Status.ERROR) {
          future.reject(new Error(frame.trailer.message));
        }
      }
    });
    const body = requestSerializer(request);
    this.sendMessage({
      callID,
      header: { service, method },
      body,
    });
    return future.promise;
  }

  rpcUnaryStream(
    service: string,
    method: string,
    requestSerializer: ISerializer,
    responseDeserializeBinary: IDeserializer,
    request: any
  ) {
    const response = new Stream((reason: any) => {
      // console.debug("rpcUnaryStream.sendframe:", { callID, reason });
      this.sendMessage({
        callID,
        trailer: {
          status: pb.DataFrame.Trailer.Status.ABORT,
          message: reason?.toString(),
        },
      });
    });
    const callID = this.registerCall((frame) => {
      if (!frame) {
        response.error(new Error("lost connection"));
        return;
      }
      if (frame.body) {
        const message = responseDeserializeBinary(frame.body!);
        response.write(message);
      }
      if (frame.trailer) {
        this._calls.delete(callID);
        if (frame.trailer.status == pb.DataFrame.Trailer.Status.OK) {
          response.end();
        } else if (frame.trailer.status == pb.DataFrame.Trailer.Status.ERROR) {
          response.error(new Error(frame.trailer.message));
        }
      }
    });

    const body = requestSerializer(request);
    this.sendMessage({
      callID,
      header: { service, method },
      body,
    });

    return response;
  }

  rpcStreamStream(
    service: string,
    method: string,
    requestSerializer: ISerializer,
    responseDeserializeBinary: IDeserializer,
    request: Stream<any>
  ) {
    const stream = new Stream((reason: any) => {
      this.sendMessage({
        callID,
        trailer: {
          status: pb.DataFrame.Trailer.Status.ABORT,
          message: reason?.toString(),
        },
      });
    });
    const checkCloseCall = () => {
      if (stream.closed && request.closed) {
        this._calls.delete(callID);
      }
    };
    const callID = this.registerCall((frame) => {
      if (!frame) {
        stream.error(new Error("lost connection"));
        request.abort(new Error("lost connection"));
        return;
      }
      if (frame.body) {
        const message = responseDeserializeBinary(frame.body!);
        stream.write(message);
      }
      if (frame.trailer) {
        if (frame.trailer.status == pb.DataFrame.Trailer.Status.OK) {
          stream.end();
        } else if (frame.trailer.status == pb.DataFrame.Trailer.Status.ABORT) {
          request.abort(new Error(frame.trailer.message));
        } else if (frame.trailer.status == pb.DataFrame.Trailer.Status.ERROR) {
          stream.error(new Error(frame.trailer.message));
        }
        checkCloseCall();
      }
    });
    this.sendMessage({
      callID,
      header: { service, method },
    });
    request
      .read((msg) => {
        const body = requestSerializer(msg);
        this.sendMessage({
          callID,
          body,
        });
      })
      .then(() => {
        this.sendMessage({
          callID,
          trailer: { status: pb.DataFrame.Trailer.Status.OK },
        });
      })
      .catch((err) => {
        this.sendMessage({
          callID,
          trailer: {
            status: pb.DataFrame.Trailer.Status.ERROR,
            message: err.toString(),
          },
        });
      })
      .finally(checkCloseCall);

    return stream;
  }

  rpcStreamUnary(
    service: string,
    method: string,
    requestSerializer: ISerializer,
    responseDeserializeBinary: IDeserializer,
    request: Stream<any>
  ) {
    const future = new Future();
    const checkCloseCall = () => {
      if (future.resolved && request.closed) {
        this._calls.delete(callID);
      }
    };
    const callID = this.registerCall((frame) => {
      if (!frame) {
        future.reject(new Error("lost connection"));
        request.abort(new Error("lost connection"));
        return;
      }
      if (frame.body) {
        const message = responseDeserializeBinary(frame.body);
        future.resolve(message);
      }
      if (frame.trailer) {
        if (frame.trailer.status == pb.DataFrame.Trailer.Status.ABORT) {
          request.abort(new Error(frame.trailer.message));
        } else if (frame.trailer.status == pb.DataFrame.Trailer.Status.ERROR) {
          future.reject(new Error(frame.trailer.message));
        }
      }
      checkCloseCall();
    });
    this.sendMessage({
      callID,
      header: { service, method },
    });
    request
      .read((msg) => {
        const body = requestSerializer(msg);
        this.sendMessage({
          callID,
          body,
        });
      })
      .then(() => {
        this.sendMessage({
          callID,
          trailer: { status: pb.DataFrame.Trailer.Status.OK },
        });
      })
      .catch((err) => {
        this.sendMessage({
          callID,
          trailer: {
            status: pb.DataFrame.Trailer.Status.ERROR,
            message: err.toString(),
          },
        });
      })
      .finally(checkCloseCall);

    return future.promise;
  }
}
