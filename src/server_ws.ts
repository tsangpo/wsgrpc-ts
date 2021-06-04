import http from "http";
import { Stream, StreamDelegate } from "./utils";
import { data as pb } from "./proto/data.proto.generated";
import { v1to2 } from "./v1/v1to2";
import { ICaller, IRpcServer } from "./types";

type IFrameCallback = (frame: pb.IDataFrame | null) => void;

export class WebSocketConnection {
  _calls = new Map<number, IFrameCallback>();
  _v = "";

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
