import {
  IAgent,
  IDeserializer,
  IMetadata,
  ISerializer,
  IStream,
} from "./types";
import {
  grpcWebDecodeStream,
  grpcWebEncodeStream,
  GRPC_STATUS,
  GRPC_STATUS_MESSAGE,
} from "./grpc";

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
      reqBody = grpcWebEncodeStream({ messages: [requestSerializer(request)] });
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
    if (res.status != 200) {
      const error = res.statusText + ": " + (await res.text());
      throw new Error(error);
    }

    const code = Number(res.headers.get(GRPC_STATUS));
    const message = decodeURIComponent(
      res.headers.get(GRPC_STATUS_MESSAGE) || ""
    );
    if (code != 0) {
      throw { code, message };
    }

    const resContentType = res.headers.get("Content-Type");
    if (
      resContentType === "application/grpc-web+proto" ||
      resContentType === "application/grpc-web"
    ) {
      const resBody = await res.arrayBuffer();
      const result = grpcWebDecodeStream(resBody);
      // const code = result.trailer?.code;
      // const message = result.trailer?.message;
      // if (code != 0) {
      //   throw { code, message };
      // }
      return responseDeserializeBinary(result.messages[0]);
    } else if (resContentType === "application/grpc") {
      const resBody = await res.arrayBuffer();
      return responseDeserializeBinary(new Uint8Array(resBody));
    } else if (resContentType === "application/json") {
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
