import { Future, Stream } from "./utils";
import { IAgent, IDeserializer, ISerializer } from "./types";
import { data as pb } from "./proto/data.proto.generated";

//////////// WebSocket /////////////

const WebSocket_OPEN = 1;

export class WebSocketAgent implements IAgent {
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
      console.log("calls:", this._calls);
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

  async rpcUnaryStream(
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

  async rpcStreamStream(
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
      // console.log("rpcStreamStream read frame:", frame);
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
        // console.log("rpcStreamStream send message:", msg);
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
