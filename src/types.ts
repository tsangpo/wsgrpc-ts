///////////// stream //////////////

export interface IStream<T = any> {
  abort(reason: any): void;
  read(onMessage: (o: T) => void): Promise<void>;
  readToItorator(): AsyncIterableIterator<T>;
}

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
) => Promise<T>;

export interface IChannel {
  rpcUnaryUnary: IRpc<any>;
  rpcUnaryStream: IRpc<IStream<any>>;
  rpcStreamStream: IRpc<IStream<any>>;
  rpcStreamUnary: IRpc<any>;
}

export interface IAgent {
  reset(): void;
  getConnection(): Promise<IChannel> | IChannel;
}

export type IMetadata = { [key: string]: string };
