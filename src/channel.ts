export type ISerializer = (message: any) => Uint8Array;
export type IDeserializer = (bytes: Uint8Array) => any;

export interface IMessage {
  decode: IDeserializer;
  encode: ISerializer;
}

type IRpc = (
  service: string,
  method: string,
  requestSerializer: ISerializer,
  responseDeserialize: IDeserializer,
  request: any
) => Promise<any>;

export interface IChannel {
  rpcUnaryUnary: IRpc;
  rpcUnaryStream: IRpc;
  rpcStreamStream: IRpc;
  rpcStreamUnary: IRpc;
}

class Channel {
  constructor(private url: string) {}

  reset(url?: string) {
    //
  }
}
