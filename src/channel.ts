import { IAgent, IChannel, IDeserializer, IMetadata, ISerializer, IStream } from "./types";
import { WebSocketAgent } from "./channel_ws";
import { HttpAgent } from "./channel_h1";

interface IOptions {
  contentType?: "grpc" | "grpc-web" | "grpc-web+proto" | "json";
  authorizationToken?: string;
}

function optionsMetadata({ contentType, authorizationToken }: IOptions): IMetadata {
  let metadata: IMetadata = {};
  if (contentType) {
    metadata["Content-Type"] = `application/${contentType}`;
  }
  if (authorizationToken) {
    metadata["Authorization"] = `Bearer ${authorizationToken}`;
  }
  return metadata;
}

export class Channel implements IChannel {
  agent!: IAgent;
  callback?: (req: any, res?: any, err?: any) => void;

  constructor(url: string, options?: IOptions) {
    this.reset(url, options);
  }

  onCall(callback: (req: any, res?: any, err?: any) => void) {
    this.callback = callback;
  }

  reset(url: string, options?: IOptions) {
    this.agent?.reset();
    if (url.startsWith("/") || url.startsWith("http:") || url.startsWith("https:")) {
      const metadata = optionsMetadata(options || {});
      this.agent = new HttpAgent(url, metadata);
    } else if (url.startsWith("ws:") || url.startsWith("wss:")) {
      this.agent = new WebSocketAgent(url);
    } else {
      throw new Error("channel url not supported: " + url);
    }
  }

  async rpcUnaryUnary(
    service: string,
    method: string,
    requestSerializer: ISerializer,
    responseDeserializeBinary: IDeserializer,
    request: any
  ) {
    const c = await this.agent.getConnection();
    return await c
      .rpcUnaryUnary(service, method, requestSerializer, responseDeserializeBinary, request)
      .then(
        (res: any) => {
          this.callback && this.callback(request, res);
          return res;
        },
        (err: any) => {
          this.callback && this.callback(request, null, err);
          throw err;
        }
      );
  }

  async rpcUnaryStream(
    service: string,
    method: string,
    requestSerializer: ISerializer,
    responseDeserializeBinary: IDeserializer,
    request: any
  ): Promise<IStream<any>> {
    const c = await this.agent.getConnection();
    return await c.rpcUnaryStream(
      service,
      method,
      requestSerializer,
      responseDeserializeBinary,
      request
    );
  }

  async rpcStreamStream(
    service: string,
    method: string,
    requestSerializer: ISerializer,
    responseDeserializeBinary: IDeserializer,
    request: any
  ): Promise<IStream<any>> {
    const c = await this.agent.getConnection();
    return await c.rpcStreamStream(
      service,
      method,
      requestSerializer,
      responseDeserializeBinary,
      request
    );
  }

  async rpcStreamUnary(
    service: string,
    method: string,
    requestSerializer: ISerializer,
    responseDeserializeBinary: IDeserializer,
    request: any
  ) {
    const c = await this.agent.getConnection();
    return await c
      .rpcStreamUnary(service, method, requestSerializer, responseDeserializeBinary, request)
      .then(
        (res: any) => {
          this.callback && this.callback(request, res);
          return res;
        },
        (err: any) => {
          this.callback && this.callback(request, null, err);
          throw err;
        }
      );
  }
}
