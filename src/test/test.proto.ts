// GENERATED CODE -- DO NOT EDIT!

/* eslint-disable */
// @ts-nocheck

import {
  Stream as $Stream,
  IChannel as $IChannel,
  Reader as $Reader,
  Writer as $Writer,
} from "hrpc";

export namespace test {
  export interface IW {}
  export namespace W {
    export interface IN {
      id: number;
    }
    export namespace N {
      export function encode(message: IN, writer: $Writer): $Writer;
      export function encode(message: IN): Uint8Array;
      export function encode(
        message: IN,
        writer?: $Writer
      ): $Writer | Uint8Array {
        const end = !writer;
        if (!writer) writer = $Writer.create();

        if (message.id != null && message.id != undefined)
          writer.uint32(8).int32(message.id);

        return end ? writer.finish() : writer;
      }

      export function decode(
        reader: Uint8Array | $Reader,
        length?: number
      ): IN {
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
    export function encode(
      message: IW,
      writer?: $Writer
    ): $Writer | Uint8Array {
      const end = !writer;
      if (!writer) writer = $Writer.create();

      return end ? writer.finish() : writer;
    }

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
    callID: number;
    header: DataFrame.IHeader;
    trailer: DataFrame.ITrailer[];
    body: Uint8Array;
    nnn: number[];
    n: W.IN;
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

      if (message.trailer != null && message.trailer.length)
        for (let i = 0; i < message.trailer.length; ++i)
          Trailer.encode(message.trailer[i], writer.uint32(26).fork()).ldelim();

      if (message.body != null && message.body != undefined)
        writer.uint32(34).bytes(message.body);

      if (message.nnn != null && message.nnn.length) {
        writer.uint32(42).fork();
        for (let i = 0; i < message.nnn.length; ++i)
          writer.int32(message.nnn[i]);
        writer.ldelim();
      }

      if (message.n != null && message.n != undefined)
        W.N.encode(message.n, writer.uint32(82).fork()).ldelim();
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

          // Repeated fields
          case 3:
            if (!(message.trailer && message.trailer.length))
              message.trailer = [];

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

          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      return message;
    }
  }
}
