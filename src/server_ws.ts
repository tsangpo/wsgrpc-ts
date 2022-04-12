import http from "http";
import { Stream, StreamDelegate } from "./utils";
import { data as pb } from "./proto/data.proto.generated";
import { ICaller, IRpcServer } from "./types";

type IFrameCallback = (frame: pb.IDataFrame | null) => void;

export class WebSocketConnection {
  _calls = new Map<number, IFrameCallback>();

  constructor(
    private ws: WebSocket,
    request: http.IncomingMessage,
    caller: ICaller
  ) {
    ws.onmessage = async (event) => {
      let frame = pb.DataFrame.decode(new Uint8Array(event.data));
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
          const rpc = await caller.getRpc(
            request,
            undefined,
            service!,
            method!
          );
          if (!rpc.requestStream && !rpc.responseStream) {
            await this.rpcUnaryUnary(frame, rpc);
          } else if (!rpc.requestStream && rpc.responseStream) {
            await this.rpcUnaryStream(frame, rpc);
          } else if (rpc.requestStream && !rpc.responseStream) {
            await this.rpcStreamUnary(frame, rpc);
          } else if (rpc.requestStream && rpc.responseStream) {
            await this.rpcStreamStream(frame, rpc);
          }
        } catch (e: any) {
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
