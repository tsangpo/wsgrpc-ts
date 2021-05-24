import { IAgent, IChannel, IDeserializer, ISerializer, IStream } from "./types";
import { WebSocketAgent } from "./channel_ws";
import { GrpcWebAgent } from "./channel_web";

export class Channel implements IChannel {
  agent!: IAgent;

  constructor(
    url: string,
    private callback?: (req: any, res?: any, err?: any) => void
  ) {
    if (!url) {
      throw new Error("no url provided.");
    }
    this.reset(url);
  }

  reset(url?: string) {
    this.agent?.reset();
    if (url) {
      if (url.startsWith("http:") || url.startsWith("https:")) {
        this.agent = new GrpcWebAgent(url);
      } else if (url.startsWith("ws:") || url.startsWith("wss:")) {
        this.agent = new WebSocketAgent(url);
      } else {
        throw new Error("channel url not supported: " + url);
      }
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
      .rpcUnaryUnary(
        service,
        method,
        requestSerializer,
        responseDeserializeBinary,
        request
      )
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
      .rpcStreamUnary(
        service,
        method,
        requestSerializer,
        responseDeserializeBinary,
        request
      )
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
