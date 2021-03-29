export { Writer, Reader } from "protobufjs/minimal";
export { Future, Stream } from "./utils";
export { hrpc } from "./proto/hrpc.proto.generated";

import { IncomingMessage } from "http";
import { Future, Stream } from "./utils";
import { hrpc } from "./proto/hrpc.proto.generated";

///////////////// message /////////////////////

export type ISerializer = (message: any) => Uint8Array;
export type IDeserializer = (bytes: Uint8Array) => any;

export interface IMessage {
  decode: IDeserializer;
  encode: ISerializer;
}

export type IFrameCallback = (frame: hrpc.IDataFrame | null) => void;

///////////////// client /////////////////////

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

///////////////// server /////////////////////

interface ICall {
  request: Future | Stream;
  response: Future | Stream;
}

export type IRpcCaller = (service: string, method: string) => ICall | null;

//requestDecode, responseEncode, requestStream, responseStream

export type IServiceMeta = {
  [key: string]: [IDeserializer, ISerializer, boolean, boolean];
};

export type IServiceFactory = (request: IncomingMessage) => Promise<any>;

export type IServiceDirectory = {
  [key: string]: {
    rpcs: IServiceMeta;
    factory: IServiceFactory;
  };
};

export interface IRpcServer {
  requestDecode: IDeserializer;
  responseEncode: ISerializer;
  requestStream: boolean;
  responseStream: boolean;
  exec: (request: any) => Promise<any>;
}
