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

export namespace test {
  export interface IW {}
  export namespace W {
    export interface IN {
      id?: number;
    }
    export namespace N {
      export function encode(message: IN, writer: $Writer): $Writer;
      export function encode(message: IN): Uint8Array;
      export function encode(message: IN, writer?: $Writer): $Writer | Uint8Array {
        const end = !writer;
        if (!writer) writer = $Writer.create();

        if (message.id != null && message.id != undefined) writer.uint32(8).int32(message.id);

        return end ? writer.finish() : writer;
      }

      export function decode(reader: Uint8Array): IN;
      export function decode(reader: $Reader, length: number): IN;
      export function decode(reader: Uint8Array | $Reader, length?: number): IN {
        if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = {} as any;

        while (reader.pos < end) {
          let tag = reader.uint32();
          switch (tag >>> 3) {
            case 1:
              message.id = reader.int32();
              break;

            default:
              reader.skipType(tag & 7);
              break;
          }
        }
        return message;
      }
    }

    export function encode(message: IW, writer: $Writer): $Writer;
    export function encode(message: IW): Uint8Array;
    export function encode(message: IW, writer?: $Writer): $Writer | Uint8Array {
      const end = !writer;
      if (!writer) writer = $Writer.create();

      return end ? writer.finish() : writer;
    }

    export function decode(reader: Uint8Array): IW;
    export function decode(reader: $Reader, length: number): IW;
    export function decode(reader: Uint8Array | $Reader, length?: number): IW {
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

  export interface IDataFrame {
    callID?: number /** stream id */;
    header?: DataFrame.IHeader;
    trailer?: DataFrame.ITrailer[];
    body?: Uint8Array;
    nnn?: number[];
    n?: W.IN;
    iii?: bigint;
    rii?: number[];
    rss?: string[];
  }
  export namespace DataFrame {
    /** request */
    export interface IHeader {
      service?: string;
      method?: string;
    }
    export namespace Header {
      export function encode(message: IHeader, writer: $Writer): $Writer;
      export function encode(message: IHeader): Uint8Array;
      export function encode(message: IHeader, writer?: $Writer): $Writer | Uint8Array {
        const end = !writer;
        if (!writer) writer = $Writer.create();

        if (message.service != null && message.service != undefined)
          writer.uint32(10).string(message.service);

        if (message.method != null && message.method != undefined)
          writer.uint32(18).string(message.method);

        return end ? writer.finish() : writer;
      }

      export function decode(reader: Uint8Array): IHeader;
      export function decode(reader: $Reader, length: number): IHeader;
      export function decode(reader: Uint8Array | $Reader, length?: number): IHeader {
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

    /** stream end or error message */
    export interface ITrailer {
      status?: string;
      message?: string;
    }
    export namespace Trailer {
      export function encode(message: ITrailer, writer: $Writer): $Writer;
      export function encode(message: ITrailer): Uint8Array;
      export function encode(message: ITrailer, writer?: $Writer): $Writer | Uint8Array {
        const end = !writer;
        if (!writer) writer = $Writer.create();

        if (message.status != null && message.status != undefined)
          writer.uint32(10).string(message.status);

        if (message.message != null && message.message != undefined)
          writer.uint32(18).string(message.message);

        return end ? writer.finish() : writer;
      }

      export function decode(reader: Uint8Array): ITrailer;
      export function decode(reader: $Reader, length: number): ITrailer;
      export function decode(reader: Uint8Array | $Reader, length?: number): ITrailer {
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
    export function encode(message: IDataFrame, writer?: $Writer): $Writer | Uint8Array {
      const end = !writer;
      if (!writer) writer = $Writer.create();

      if (message.callID != null && message.callID != undefined)
        writer.uint32(8).int32(message.callID);

      if (message.header != null && message.header != undefined)
        Header.encode(message.header, writer.uint32(18).fork()).ldelim();

      if (message.trailer != null && message.trailer.length)
        for (let i = 0; i < message.trailer.length; ++i)
          Trailer.encode(message.trailer[i], writer.uint32(26).fork()).ldelim();

      if (message.body != null && message.body != undefined) writer.uint32(34).bytes(message.body);

      if (message.nnn != null && message.nnn.length) {
        writer.uint32(42).fork();
        for (let i = 0; i < message.nnn.length; ++i) writer.int32(message.nnn[i]);
        writer.ldelim();
      }

      if (message.n != null && message.n != undefined)
        W.N.encode(message.n, writer.uint32(82).fork()).ldelim();

      if (message.iii != null && message.iii != undefined) writer.uint32(88).int64(message.iii);

      if (message.rii != null && message.rii.length) {
        writer.uint32(98).fork();
        for (let i = 0; i < message.rii.length; ++i) writer.int32(message.rii[i]);
        writer.ldelim();
      }

      if (message.rss != null && message.rss.length)
        for (let i = 0; i < message.rss.length; ++i) writer.uint32(106).string(message.rss[i]);

      return end ? writer.finish() : writer;
    }

    export function decode(reader: Uint8Array): IDataFrame;
    export function decode(reader: $Reader, length: number): IDataFrame;
    export function decode(reader: Uint8Array | $Reader, length?: number): IDataFrame {
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

          // Repeated fields
          case 3:
            if (!(message.trailer && message.trailer.length)) message.trailer = [];

            message.trailer.push(Trailer.decode(reader, reader.uint32()));

            break;

          case 4:
            message.body = reader.bytes();
            break;

          // Repeated fields
          case 5:
            if (!(message.nnn && message.nnn.length)) message.nnn = [];

            if ((tag & 7) === 2) {
              let end2 = reader.uint32() + reader.pos;
              while (reader.pos < end2) message.nnn.push(reader.int32());
            } else message.nnn.push(reader.int32());

            break;

          case 10:
            message.n = W.N.decode(reader, reader.uint32());
            break;

          case 11:
            message.iii = reader.int64();
            break;

          // Repeated fields
          case 12:
            if (!(message.rii && message.rii.length)) message.rii = [];

            if ((tag & 7) === 2) {
              let end2 = reader.uint32() + reader.pos;
              while (reader.pos < end2) message.rii.push(reader.int32());
            } else message.rii.push(reader.int32());

            break;

          // Repeated fields
          case 13:
            if (!(message.rss && message.rss.length)) message.rss = [];

            message.rss.push(reader.string());

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
    url?: string;
  }
  export namespace Endponit {
    export function encode(message: IEndponit, writer: $Writer): $Writer;
    export function encode(message: IEndponit): Uint8Array;
    export function encode(message: IEndponit, writer?: $Writer): $Writer | Uint8Array {
      const end = !writer;
      if (!writer) writer = $Writer.create();

      if (message.url != null && message.url != undefined) writer.uint32(10).string(message.url);

      return end ? writer.finish() : writer;
    }

    export function decode(reader: Uint8Array): IEndponit;
    export function decode(reader: $Reader, length: number): IEndponit;
    export function decode(reader: Uint8Array | $Reader, length?: number): IEndponit {
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

  export interface IChannel {
    url?: string;
  }
  export namespace Channel {
    export function encode(message: IChannel, writer: $Writer): $Writer;
    export function encode(message: IChannel): Uint8Array;
    export function encode(message: IChannel, writer?: $Writer): $Writer | Uint8Array {
      const end = !writer;
      if (!writer) writer = $Writer.create();

      if (message.url != null && message.url != undefined) writer.uint32(10).string(message.url);

      return end ? writer.finish() : writer;
    }

    export function decode(reader: Uint8Array): IChannel;
    export function decode(reader: $Reader, length: number): IChannel;
    export function decode(reader: Uint8Array | $Reader, length?: number): IChannel {
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

  export interface ISimple {}
  export namespace Simple {
    export interface IOK {}
    export namespace OK {
      export function encode(message: IOK, writer: $Writer): $Writer;
      export function encode(message: IOK): Uint8Array;
      export function encode(message: IOK, writer?: $Writer): $Writer | Uint8Array {
        const end = !writer;
        if (!writer) writer = $Writer.create();

        return end ? writer.finish() : writer;
      }

      export function decode(reader: Uint8Array): IOK;
      export function decode(reader: $Reader, length: number): IOK;
      export function decode(reader: Uint8Array | $Reader, length?: number): IOK {
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

    export const Status = {
      OK: 1,
      ABOORT: 2,
      ERROR: 3,
    };

    export function encode(message: ISimple, writer: $Writer): $Writer;
    export function encode(message: ISimple): Uint8Array;
    export function encode(message: ISimple, writer?: $Writer): $Writer | Uint8Array {
      const end = !writer;
      if (!writer) writer = $Writer.create();

      return end ? writer.finish() : writer;
    }

    export function decode(reader: Uint8Array): ISimple;
    export function decode(reader: $Reader, length: number): ISimple;
    export function decode(reader: Uint8Array | $Reader, length?: number): ISimple {
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

  /** test service */
  export interface IWS {
    /** return a value */
    getEndponit(request: Simple.IOK): Promise<IEndponit>;

    /** return a stream */
    pullEndponits(request: Simple.IOK): Promise<$IStream<IEndponit>>;
  }

  export class WS implements IWS {
    static addToServer(server: any, factory: $IServiceFactory<IWS>) {
      server.addService(
        "test.WS",
        {
          getEndponit: [Simple.OK.decode, Endponit.encode, false, false],
          pullEndponits: [Simple.OK.decode, Endponit.encode, false, true],
        },
        factory
      );
    }

    constructor(private channel: $IChannel) {}

    async getEndponit(request: Simple.IOK): Promise<IEndponit> {
      return await this.channel.rpcUnaryUnary(
        "test.WS",
        "getEndponit",
        Simple.OK.encode,
        Endponit.decode,
        request
      );
    }

    async pullEndponits(request: Simple.IOK): Promise<$IStream<IEndponit>> {
      return await this.channel.rpcUnaryStream(
        "test.WS",
        "pullEndponits",
        Simple.OK.encode,
        Endponit.decode,
        request
      );
    }
  }
}
