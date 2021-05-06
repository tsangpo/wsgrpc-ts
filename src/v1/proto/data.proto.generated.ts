import { Reader as $Reader, Writer as $Writer } from "protobufjs/minimal";

export namespace data {
  export interface IDataFrame {
    streamId?: number;
    endStream?: boolean;
    type?: number;
    headers?: DataFrame.IHeaders;
    trailers?: DataFrame.ITrailers;
    message?: Uint8Array;
  }
  export namespace DataFrame {
    export interface IHeaders {
      path?: string;
      status?: string;
      rpcStatus?: string;
      rpcMessage?: string;
    }
    export namespace Headers {
      export function encode(message: IHeaders, writer: $Writer): $Writer;
      export function encode(message: IHeaders): Uint8Array;
      export function encode(
        message: IHeaders,
        writer?: $Writer
      ): $Writer | Uint8Array {
        const end = !writer;
        if (!writer) writer = $Writer.create();

        if (message.path != null && message.path != undefined)
          writer.uint32(10).string(message.path);

        if (message.status != null && message.status != undefined)
          writer.uint32(18).string(message.status);

        if (message.rpcStatus != null && message.rpcStatus != undefined)
          writer.uint32(26).string(message.rpcStatus);

        if (message.rpcMessage != null && message.rpcMessage != undefined)
          writer.uint32(34).string(message.rpcMessage);

        return end ? writer.finish() : writer;
      }

      export function decode(reader: Uint8Array): IHeaders;
      export function decode(reader: $Reader, length: number): IHeaders;
      export function decode(
        reader: Uint8Array | $Reader,
        length?: number
      ): IHeaders {
        if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = {} as any;

        while (reader.pos < end) {
          let tag = reader.uint32();
          switch (tag >>> 3) {
            case 1:
              message.path = reader.string();
              break;

            case 2:
              message.status = reader.string();
              break;

            case 3:
              message.rpcStatus = reader.string();
              break;

            case 4:
              message.rpcMessage = reader.string();
              break;

            default:
              reader.skipType(tag & 7);
              break;
          }
        }
        return message;
      }
    }

    export interface ITrailers {
      path?: string;
      status?: string;
      rpcStatus?: string;
      rpcMessage?: string;
    }
    export namespace Trailers {
      export function encode(message: ITrailers, writer: $Writer): $Writer;
      export function encode(message: ITrailers): Uint8Array;
      export function encode(
        message: ITrailers,
        writer?: $Writer
      ): $Writer | Uint8Array {
        const end = !writer;
        if (!writer) writer = $Writer.create();

        if (message.path != null && message.path != undefined)
          writer.uint32(10).string(message.path);

        if (message.status != null && message.status != undefined)
          writer.uint32(18).string(message.status);

        if (message.rpcStatus != null && message.rpcStatus != undefined)
          writer.uint32(26).string(message.rpcStatus);

        if (message.rpcMessage != null && message.rpcMessage != undefined)
          writer.uint32(34).string(message.rpcMessage);

        return end ? writer.finish() : writer;
      }

      export function decode(reader: Uint8Array): ITrailers;
      export function decode(reader: $Reader, length: number): ITrailers;
      export function decode(
        reader: Uint8Array | $Reader,
        length?: number
      ): ITrailers {
        if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = {} as any;

        while (reader.pos < end) {
          let tag = reader.uint32();
          switch (tag >>> 3) {
            case 1:
              message.path = reader.string();
              break;

            case 2:
              message.status = reader.string();
              break;

            case 3:
              message.rpcStatus = reader.string();
              break;

            case 4:
              message.rpcMessage = reader.string();
              break;

            default:
              reader.skipType(tag & 7);
              break;
          }
        }
        return message;
      }
    }

    export const Types = {
      HEADERS: 1,
      TRAILERS: 2,
      MESSAGE: 3,
    };

    export function encode(message: IDataFrame, writer: $Writer): $Writer;
    export function encode(message: IDataFrame): Uint8Array;
    export function encode(
      message: IDataFrame,
      writer?: $Writer
    ): $Writer | Uint8Array {
      const end = !writer;
      if (!writer) writer = $Writer.create();

      if (message.streamId != null && message.streamId != undefined)
        writer.uint32(8).int32(message.streamId);

      if (message.endStream != null && message.endStream != undefined)
        writer.uint32(16).bool(message.endStream);

      if (message.type != null && message.type != undefined)
        writer.uint32(24).int32(message.type);

      if (message.headers != null && message.headers != undefined)
        Headers.encode(message.headers, writer.uint32(34).fork()).ldelim();

      if (message.trailers != null && message.trailers != undefined)
        Trailers.encode(message.trailers, writer.uint32(42).fork()).ldelim();

      if (message.message != null && message.message != undefined)
        writer.uint32(50).bytes(message.message);

      return end ? writer.finish() : writer;
    }

    export function decode(reader: Uint8Array): IDataFrame;
    export function decode(reader: $Reader, length: number): IDataFrame;
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
            message.streamId = reader.int32();
            break;

          case 2:
            message.endStream = reader.bool();
            break;

          case 3:
            message.type = reader.int32();
            break;

          case 4:
            message.headers = Headers.decode(reader, reader.uint32());
            break;

          case 5:
            message.trailers = Trailers.decode(reader, reader.uint32());
            break;

          case 6:
            message.message = reader.bytes();
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
