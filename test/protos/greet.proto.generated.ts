// GENERATED CODE -- DO NOT EDIT!

/* eslint-disable */
// @ts-nocheck

import {
  IChannel as $IChannel,
  IServiceFactory as $IServiceFactory,
  IStream as $IStream,
  Reader as $Reader,
  Writer as $Writer,
} from "../../src";

export namespace greet {
  export interface IGreeter {
    sayHello(request: IHelloRequest): Promise<IHelloReply>;
  }

  export class Greeter implements IGreeter {
    static addToServer(server: any, factory: $IServiceFactory<IGreeter>) {
      server.addService(
        "greet.Greeter",
        { sayHello: [HelloRequest.decode, HelloReply.encode, false, false] },
        factory
      );
    }

    constructor(private channel: $IChannel) {}

    async sayHello(request: IHelloRequest): Promise<IHelloReply> {
      return await this.channel.rpcUnaryUnary(
        "greet.Greeter",
        "sayHello",
        HelloRequest.encode,
        HelloReply.decode,
        request
      );
    }
  }

  export interface IHelloRequest {
    name?: string;
  }
  export namespace HelloRequest {
    export function encode(message: IHelloRequest, writer: $Writer): $Writer;
    export function encode(message: IHelloRequest): Uint8Array;
    export function encode(message: IHelloRequest, writer?: $Writer): $Writer | Uint8Array {
      const end = !writer;
      if (!writer) writer = $Writer.create();

      if (message.name != null && message.name != undefined) writer.uint32(10).string(message.name);

      return end ? writer.finish() : writer;
    }

    export function decode(reader: Uint8Array): IHelloRequest;
    export function decode(reader: $Reader, length: number): IHelloRequest;
    export function decode(reader: Uint8Array | $Reader, length?: number): IHelloRequest {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length;
      const message = {} as any;

      while (reader.pos < end) {
        let tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.name = reader.string();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      return message;
    }
  }

  export interface IHelloReply {
    message?: string;
  }
  export namespace HelloReply {
    export function encode(message: IHelloReply, writer: $Writer): $Writer;
    export function encode(message: IHelloReply): Uint8Array;
    export function encode(message: IHelloReply, writer?: $Writer): $Writer | Uint8Array {
      const end = !writer;
      if (!writer) writer = $Writer.create();

      if (message.message != null && message.message != undefined)
        writer.uint32(10).string(message.message);

      return end ? writer.finish() : writer;
    }

    export function decode(reader: Uint8Array): IHelloReply;
    export function decode(reader: $Reader, length: number): IHelloReply;
    export function decode(reader: Uint8Array | $Reader, length?: number): IHelloReply {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length;
      const message = {} as any;

      while (reader.pos < end) {
        let tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.message = reader.string();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      return message;
    }
  }
}
