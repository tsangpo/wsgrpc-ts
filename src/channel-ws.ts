import { IDeserializer, ISerializer } from "./channel";
import { hrpc } from "./proto/hrpc.proto";
import { Future, Stream } from "./utils";

const WebSocket_OPEN = 1;

export class WebSocketChannel {
  connectionFuture: Future<WebSocketConnection> | null;

  constructor(private url: string) {
    this.connectionFuture = null;
  }

  private async _getConnection() {
    if (this.connectionFuture?.result) {
      if (this.connectionFuture.result.ws.readyState != WebSocket_OPEN) {
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
    if (!this.connectionFuture.result) {
      await this.connectionFuture.promise;
    }
    return this.connectionFuture.result!;
  }

  reset() {
    if (this.connectionFuture?.result) {
      if (this.connectionFuture.result.ws.readyState == WebSocket_OPEN) {
        this.connectionFuture.result.ws.close();
      }
    }
    this.connectionFuture = null;
  }

  async rpcUnaryUnary(
    service: string,
    method: string,
    requestSerializer: ISerializer,
    responseDeserializeBinary: IDeserializer,
    request: any
  ) {
    const c = await this._getConnection();
    return c.rpcUnaryUnary(
      service,
      method,
      requestSerializer,
      responseDeserializeBinary,
      request
    );
  }

  async rpcUnaryStream(
    service: string,
    method: string,
    requestSerializer: ISerializer,
    responseDeserializeBinary: IDeserializer,
    request: any
  ) {
    const c = await this._getConnection();
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
    const c = await this._getConnection();
    return c.rpcStreamStream(
      service,
      method,
      requestSerializer,
      responseDeserializeBinary,
      request
    );
  }

  async rpcStreamUnray(
    service: string,
    method: string,
    requestSerializer: ISerializer,
    responseDeserializeBinary: IDeserializer,
    request: any
  ) {
    const c = await this._getConnection();
    return c.rpcStreamUnray(
      service,
      method,
      requestSerializer,
      responseDeserializeBinary,
      request
    );
  }
}

type ICallback = (frame: hrpc.IDataFrame | null) => void;

class WebSocketConnection {
  _nextCallID = 1;
  _calls = new Map<number, ICallback>();

  constructor(public ws: WebSocket) {
    ws.onmessage = (event) => {
      let frame = hrpc.DataFrame.deserializeBinary(new Uint8Array(event.data));
      let callback = this._calls.get(frame.callID);
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

  private registerCall(callback: ICallback) {
    const cid = this._nextCallID;
    this._calls.set(cid, callback);
    this._nextCallID += 2;
    return cid;
  }

  private sendMessage(message: hrpc.IDataFrame) {
    if (this.ws.readyState != WebSocket_OPEN) {
      return;
    }
    const data = hrpc.DataFrame.serializeBinary(message);

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
        this._calls.delete(callID);
        future.reject(new Error("lost connection"));
        return;
      }
      if (frame.body) {
        this._calls.delete(callID);
        const message = responseDeserializeBinary(frame.body);
        future.resolve(message);
        return;
      }
      if (frame.trailer) {
        if (frame.trailer.status == "ERROR") {
          this._calls.delete(callID);
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
    const stream = new Stream((reason: any) => {
      this.sendMessage({
        callID,
        trailer: { status: "ABORT", message: reason?.toString() },
      });
    });
    const callID = this.registerCall((frame) => {
      if (!frame) {
        this._calls.delete(callID);
        stream.error(new Error("lost connection"));
        return;
      }
      if (frame.body) {
        const message = responseDeserializeBinary(frame.body!);
        stream.write(message);
      }
      if (frame.trailer) {
        if (frame.trailer.status == "OK") {
          this._calls.delete(callID);
          stream.end();
        } else if (frame.trailer.status == "ERROR") {
          this._calls.delete(callID);
          stream.error(new Error(frame.trailer.message));
        }
      }
    });

    const body = requestSerializer(request);
    this.sendMessage({
      callID,
      header: { service, method },
      body,
    });

    return stream;
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
        trailer: { status: "ABORT", message: reason?.toString() },
      });
    });
    const callID = this.registerCall((frame) => {
      if (!frame) {
        this._calls.delete(callID);
        stream.error(new Error("lost connection"));
        return;
      }
      if (frame.body) {
        const message = responseDeserializeBinary(frame.body!);
        stream.write(message);
      }
      if (frame.trailer) {
        if (frame.trailer.status == "OK") {
          this._calls.delete(callID);
          stream.end();
        } else if (frame.trailer.status == "ABORT") {
          request.abort(new Error(frame.trailer.message));
        } else if (frame.trailer.status == "ERROR") {
          this._calls.delete(callID);
          stream.error(new Error(frame.trailer.message));
        }
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
          trailer: { status: "OK" },
        });
      })
      .catch((err) => {
        this.sendMessage({
          callID,
          trailer: { status: "ERROR", message: err.toString() },
        });
      });

    return stream;
  }

  rpcStreamUnray(
    service: string,
    method: string,
    requestSerializer: ISerializer,
    responseDeserializeBinary: IDeserializer,
    request: Stream<any>
  ) {
    const future = new Future();
    const callID = this.registerCall((frame) => {
      if (!frame) {
        this._calls.delete(callID);
        future.reject(new Error("lost connection"));
        return;
      }
      if (frame.body) {
        this._calls.delete(callID);
        const message = responseDeserializeBinary(frame.body);
        future.resolve(message);
        return;
      }
      if (frame.trailer) {
        if (frame.trailer.status == "ABORT") {
          request.abort(new Error(frame.trailer.message));
        } else if (frame.trailer.status == "ERROR") {
          this._calls.delete(callID);
          future.reject(new Error(frame.trailer.message));
        }
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
          trailer: { status: "OK" },
        });
      })
      .catch((err) => {
        this.sendMessage({
          callID,
          trailer: { status: "ERROR", message: err.toString() },
        });
      });

    return future.promise;
  }
}
