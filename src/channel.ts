export type ISerializer = (message: any) => Uint8Array;
export type IDeserializer = (bytes: Uint8Array) => any;

export interface IMessage {
  deserializeBinary(bytes: any): any;
  serializeBinary(o: any): any;
}

type IRpc = (
  service: string,
  method: string,
  requestSerializer: ISerializer,
  responseDeserializeBinary: IDeserializer,
  request: any
) => Promise<any>;

export interface IChannel {
  rpcUnaryUnary: IRpc;
  rpcUnaryStream: IRpc;
  rpcStreamStream: IRpc;
  rpcStreamUnary: IRpc;
}
