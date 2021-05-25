import {
  IAgent,
  IDeserializer,
  IMetadata,
  ISerializer,
  IStream,
} from "./types";

//////////// gRPC-Web /////////////

/**
 * A simple gGRP-Web protocol implement. support only rpcUnaryUnary
 */
export class HttpAgent implements IAgent {
  // https://github.com/grpc/grpc/blob/master/doc/PROTOCOL-WEB.md
  // https://github.com/grpc/grpc-web/blob/master/doc/browser-features.md
  // https://github.com/grpc/grpc-web/blob/master/javascript/net/grpc/web/statuscode.js

  url: string;
  metadata: IMetadata;

  constructor(url: string, metadata?: IMetadata) {
    this.url = url + (url.endsWith("/") ? "" : "/");

    if (!metadata) {
      metadata = {};
    }
    if (!metadata["Content-Type"]) {
      metadata["Content-Type"] = "application/grpc-web";
    }
    this.metadata = metadata;
  }

  getConnection() {
    return this;
  }

  reset() {}

  async rpcUnaryUnary(
    service: string,
    method: string,
    requestSerializer: ISerializer,
    responseDeserializeBinary: IDeserializer,
    request: any
  ) {
    const contentType = this.metadata["Content-Type"];

    let reqBody: Uint8Array | string;
    if (
      contentType == "application/grpc-web" ||
      contentType == "application/grpc-web+proto"
    ) {
      reqBody = encodeRequestToBody(requestSerializer(request));
    } else if (contentType == "application/grpc") {
      reqBody = requestSerializer(request);
    } else if (contentType == "application/json") {
      reqBody = JSON.stringify(request);
    } else {
      throw new Error(`Unknown Content-type to use. ${contentType}`);
    }

    const url = this.url + service + "/" + method;
    const res = await fetch(url, {
      method: "POST",
      body: reqBody,
      headers: this.metadata,
    });
    const resContentType = res.headers.get("Content-Type");

    if (
      resContentType === "application/grpc-web+proto" ||
      resContentType === "application/grpc-web"
    ) {
      const resBody = await res.arrayBuffer();
      const result = decodeResponseBody(resBody);
      const code = result.trailer?.code;
      const message = result.trailer?.metadata;
      if (code != 0) {
        throw new Error(message);
      }
      return responseDeserializeBinary(result.messages[0]);
    } else if (resContentType === "application/grpc") {
      const resBody = await res.arrayBuffer();
      const code = Number(res.headers.get(GRPC_STATUS));
      const message = res.headers.get(GRPC_STATUS_MESSAGE);
      if (code != 0) {
        throw new Error(message!);
      }
      return responseDeserializeBinary(new Uint8Array(resBody));
    } else if (resContentType === "application/json") {
      const code = Number(res.headers.get(GRPC_STATUS));
      const message = res.headers.get(GRPC_STATUS_MESSAGE);
      if (code != 0) {
        throw new Error(message!);
      }
      return await res.json();
    } else {
      throw new Error(`Unknown Content-type received. ${resContentType}`);
    }
  }

  rpcUnaryStream(
    service: string,
    method: string,
    requestSerializer: ISerializer,
    responseDeserializeBinary: IDeserializer,
    request: any
  ): Promise<IStream<any>> {
    throw new Error("method not supported");
  }

  rpcStreamStream(
    service: string,
    method: string,
    requestSerializer: ISerializer,
    responseDeserializeBinary: IDeserializer,
    request: any
  ): Promise<IStream<any>> {
    throw new Error("method not supported");
  }

  rpcStreamUnary(
    service: string,
    method: string,
    requestSerializer: ISerializer,
    responseDeserializeBinary: IDeserializer,
    request: any
  ): Promise<any> {
    throw new Error("method not supported");
  }
}

const GRPC_STATUS = "grpc-status";
const GRPC_STATUS_MESSAGE = "grpc-message";
const FrameType = {
  DATA: 0x00, // expecting a data frame
  TRAILER: 0x80, // expecting a trailer frame
};

interface IResponseResult {
  messages: Uint8Array[];
  trailer: ITrailer | null;
}
interface ITrailer {
  code: number;
  message: string;
  metadata: any;
}

function encodeRequestToBody(request: Uint8Array): Uint8Array {
  var len = request.length;
  var bytesArray = [0, 0, 0, 0];
  var payload = new Uint8Array(5 + len);
  for (var i = 3; i >= 0; i--) {
    bytesArray[i] = len % 256;
    len = len >>> 8;
  }
  payload.set(new Uint8Array(bytesArray), 1);
  payload.set(request, 5);
  return payload;
}

function decodeResponseBody(data: ArrayBuffer): IResponseResult {
  const result: IResponseResult = {
    messages: [],
    trailer: null,
  };

  let b = new Uint8Array(data);
  while (b.length) {
    const type = b[0];
    const length = (b[1] << 24) | (b[2] << 16) | (b[3] << 8) | b[4];
    const data = b.slice(5, 5 + length);
    b = b.subarray(5 + length);

    if (type == FrameType.DATA) {
      result.messages.push(data);
    } else if (type == FrameType.TRAILER) {
      const trailer: ITrailer = { code: 0, message: "", metadata: {} };
      new TextDecoder("utf-8")
        .decode(data)
        .trim()
        .split("\r\n")
        .map((line) => line.split(": ", 2))
        .map(([key, value]) => [key.toLowerCase(), value])
        .forEach(([key, value]) => {
          if (key == GRPC_STATUS) {
            trailer.code = Number(value);
          } else if (key == GRPC_STATUS_MESSAGE) {
            trailer.message = value;
          } else {
            trailer.metadata[key] = value;
          }
        });
      result.trailer = trailer;
    }
  }

  return result;
}
