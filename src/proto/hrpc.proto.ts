// GENERATED CODE -- DO NOT EDIT!

import {
  Stream as $Stream,
  IChannel as $IChannel,
  Reader as $Reader,
  Writer as $Writer,
} from "..";

export namespace hrpc {
  export interface IDataFrame {
    callID: number;
    header: DataFrame.IHeader;
    trailer: DataFrame.ITrailer;
    body: Uint8Array;
  }
  export namespace DataFrame {
    export interface IHeader {
      service: string;
      method: string;
    }
    export namespace Header {
      export function encode(message: IHeader, writer: $Writer): $Writer;
      export function encode(message: IHeader): Uint8Array;
      export function encode(
        message: IHeader,
        writer?: $Writer
      ): $Writer | Uint8Array {
        const end = !writer;
        if (!writer) writer = $Writer.create();

        if (message.service != null && message.service != undefined)
          writer.uint32(10).string(message.service);

        if (message.method != null && message.method != undefined)
          writer.uint32(18).string(message.method);

        return end ? writer.finish() : writer;
      }

      export function decode(
        reader: Uint8Array | $Reader,
        length?: number
      ): IHeader {
        if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = {} as any;

        while (reader.pos < end) {
          let tag = reader.uint32();
          switch (tag >>> 3) {
            case 1:
              message.service = reader.string();
              break;

            case 2:
              message.method = reader.string();
              break;

            default:
              reader.skipType(tag & 7);
              break;
          }
        }
        return message;
      }
    }

    export interface ITrailer {
      status: string;
      message: string;
    }
    export namespace Trailer {
      export function encode(message: ITrailer, writer: $Writer): $Writer;
      export function encode(message: ITrailer): Uint8Array;
      export function encode(
        message: ITrailer,
        writer?: $Writer
      ): $Writer | Uint8Array {
        const end = !writer;
        if (!writer) writer = $Writer.create();

        if (message.status != null && message.status != undefined)
          writer.uint32(10).string(message.status);

        if (message.message != null && message.message != undefined)
          writer.uint32(18).string(message.message);

        return end ? writer.finish() : writer;
      }

      export function decode(
        reader: Uint8Array | $Reader,
        length?: number
      ): ITrailer {
        if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = {} as any;

        while (reader.pos < end) {
          let tag = reader.uint32();
          switch (tag >>> 3) {
            case 1:
              message.status = reader.string();
              break;

            case 2:
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

    export function encode(message: IDataFrame, writer: $Writer): $Writer;
    export function encode(message: IDataFrame): Uint8Array;
    export function encode(
      message: IDataFrame,
      writer?: $Writer
    ): $Writer | Uint8Array {
      const end = !writer;
      if (!writer) writer = $Writer.create();

      if (message.callID != null && message.callID != undefined)
        writer.uint32(8).int32(message.callID);

      if (message.header != null && message.header != undefined)
        Header.encode(message.header, writer.uint32(18).fork()).ldelim();

      if (message.trailer != null && message.trailer != undefined)
        Trailer.encode(message.trailer, writer.uint32(26).fork()).ldelim();

      if (message.body != null && message.body != undefined)
        writer.uint32(34).bytes(message.body);

      return end ? writer.finish() : writer;
    }

    export function decode(
      reader: Uint8Array | $Reader,
      length?: number
    ): IDataFrame {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length;
      const message = {} as any;

      while (reader.pos < end) {
        let tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.callID = reader.int32();
            break;

          case 2:
            message.header = Header.decode(reader, reader.uint32());
            break;

          case 3:
            message.trailer = Trailer.decode(reader, reader.uint32());
            break;

          case 4:
            message.body = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      return message;
    }
  }

  export interface IEndponit {
    url: string;
  }
  export namespace Endponit {
    export function encode(message: IEndponit, writer: $Writer): $Writer;
    export function encode(message: IEndponit): Uint8Array;
    export function encode(
      message: IEndponit,
      writer?: $Writer
    ): $Writer | Uint8Array {
      const end = !writer;
      if (!writer) writer = $Writer.create();

      if (message.url != null && message.url != undefined)
        writer.uint32(10).string(message.url);

      return end ? writer.finish() : writer;
    }

    export function decode(
      reader: Uint8Array | $Reader,
      length?: number
    ): IEndponit {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length;
      const message = {} as any;

      while (reader.pos < end) {
        let tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.url = reader.string();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      return message;
    }
  }

  export interface IChannel {}
  export namespace Channel {
    export function encode(message: IChannel, writer: $Writer): $Writer;
    export function encode(message: IChannel): Uint8Array;
    export function encode(
      message: IChannel,
      writer?: $Writer
    ): $Writer | Uint8Array {
      const end = !writer;
      if (!writer) writer = $Writer.create();

      return end ? writer.finish() : writer;
    }

    export function decode(
      reader: Uint8Array | $Reader,
      length?: number
    ): IChannel {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length;
      const message = {} as any;

      while (reader.pos < end) {
        let tag = reader.uint32();
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      return message;
    }
  }

  export interface ISimple {}
  export namespace Simple {
    export interface IOK {}
    export namespace OK {
      export function encode(message: IOK, writer: $Writer): $Writer;
      export function encode(message: IOK): Uint8Array;
      export function encode(
        message: IOK,
        writer?: $Writer
      ): $Writer | Uint8Array {
        const end = !writer;
        if (!writer) writer = $Writer.create();

        return end ? writer.finish() : writer;
      }

      export function decode(
        reader: Uint8Array | $Reader,
        length?: number
      ): IOK {
        if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = {} as any;

        while (reader.pos < end) {
          let tag = reader.uint32();
          switch (tag >>> 3) {
            default:
              reader.skipType(tag & 7);
              break;
          }
        }
        return message;
      }
    }

    export function encode(message: ISimple, writer: $Writer): $Writer;
    export function encode(message: ISimple): Uint8Array;
    export function encode(
      message: ISimple,
      writer?: $Writer
    ): $Writer | Uint8Array {
      const end = !writer;
      if (!writer) writer = $Writer.create();

      return end ? writer.finish() : writer;
    }

    export function decode(
      reader: Uint8Array | $Reader,
      length?: number
    ): ISimple {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length;
      const message = {} as any;

      while (reader.pos < end) {
        let tag = reader.uint32();
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      return message;
    }
  }
  export interface IWS {
    GetChannel(request: $Stream<IEndponit>): Promise<$Stream<IChannel>>;
    pullEvents(request: Simple.IOK): Promise<$Stream<IEndponit>>;
  }

  export class WS {
    addToServer(server: any, factory: any) {
      server.addService(
        "hrpc.WS",
        {
          GetChannel: [Endponit.encode, Channel.decode, true, true],
          pullEvents: [Simple.OK.encode, Endponit.decode, false, true],
        },
        factory
      );
    }

    constructor(private channel: $IChannel) {}

    async GetChannel(request: $Stream<IEndponit>): Promise<$Stream<IChannel>> {
      return await this.channel.rpcStreamStream(
        "hrpc.WS",
        "GetChannel",
        Endponit.encode,
        Channel.decode,
        request
      );
    }

    async pullEvents(request: Simple.IOK): Promise<$Stream<IEndponit>> {
      return await this.channel.rpcUnaryStream(
        "hrpc.WS",
        "pullEvents",
        Simple.OK.encode,
        Endponit.decode,
        request
      );
    }
  }
}
