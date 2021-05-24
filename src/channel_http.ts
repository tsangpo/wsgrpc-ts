import { IAgent, IDeserializer, ISerializer, IStream } from "./types";

//////////// http /////////////

/**
 * Not gGRP-Web protocol, just support rpcUnaryUnary
 */

export class HttpAgent implements IAgent {
  // https://github.com/grpc/grpc/blob/master/doc/PROTOCOL-WEB.md
  // https://github.com/grpc/grpc-web/blob/master/doc/browser-features.md

  url: string;
  constructor(url: string) {
    this.url = url + (url.endsWith("/") ? "" : "/");
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
    // Content-Type: application/grpc
    // Content-Type: application/json
    // Accept: application/grpc
    // Accept: application/json

    const url = this.url + service + "/" + method;
    const res = await fetch(url, {
      method: "post",
      body: JSON.stringify(request),
      headers: { "Content-Type": "application/json" },
    });
    return await res.json();
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
