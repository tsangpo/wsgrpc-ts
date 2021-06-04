import http from "http";
import {
  ICaller,
  IRpcServer,
  IServiceDirectory,
  IServiceFactory,
  IServiceMeta,
} from "./types";
import { lcFirst } from "./utils";
import { HttpHandler } from "./server_h1";
import { WebSocketConnection } from "./server_ws";

export class Server {
  private services: IServiceDirectory = {};
  private fallbacks: {
    onrequest?: (
      request: http.IncomingMessage,
      response: http.ServerResponse
    ) => void;
    onupgrade?: (
      request: http.IncomingMessage,
      socket: any,
      upgradeHead: any
    ) => void;
  } = {};

  public addService(
    service: string,
    rpcs: IServiceMeta,
    factory: IServiceFactory
  ) {
    this.services[service] = { rpcs, factory };
  }

  public listenHttpServerRequest(server: http.Server, path: string) {
    // http
    server.on(
      "request",
      (request: http.IncomingMessage, response: http.ServerResponse) => {
        if (request.url?.startsWith(path)) {
          const httpHandler = new HttpHandler(path, new Caller(this.services));
          httpHandler.handle(request, response);
        } else if (this.fallbacks?.onrequest) {
          this.fallbacks.onrequest(request, response);
        } else {
          response.statusCode = 404;
          response.end();
        }
      }
    );
  }

  public listenHttpServerUpgrade(server: http.Server, path: string) {
    // websocket
    //@ts-ignore
    const wss = new WebSocket.Server({ noServer: true });
    server.on(
      "upgrade",
      (request: http.IncomingMessage, socket, upgradeHead) => {
        const url = new URL(request.url!, `http://${request.headers.host}`);
        if (url.pathname == path) {
          wss.handleUpgrade(
            request,
            socket,
            upgradeHead,
            (ws: WebSocket, request: http.IncomingMessage) =>
              new WebSocketConnection(ws, request, new Caller(this.services))
          );
        } else if (this.fallbacks?.onupgrade) {
          this.fallbacks.onupgrade(request, socket, upgradeHead);
        } else {
          socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
          socket.destroy();
        }
      }
    );
  }

  public fallback(
    onrequest?: (
      request: http.IncomingMessage,
      response: http.ServerResponse
    ) => void,
    onupgrade?: (
      request: http.IncomingMessage,
      socket: any,
      upgradeHead: any
    ) => void
  ) {
    this.fallbacks = { onrequest, onupgrade };
  }
}

/**
 * service methods finder
 */
class Caller implements ICaller {
  private services: { [key: string]: Promise<any> } = {};
  constructor(private serviceDirectory: IServiceDirectory) {}

  async getRpc(
    request: http.IncomingMessage,
    service: string,
    method: string
  ): Promise<IRpcServer> {
    const meta = this.serviceDirectory[service];
    if (!meta) {
      throw new Error(`service not found: ${service}.${method}`);
    }
    method = lcFirst(method); // NOTE: lcFirst
    if (!(method in meta.rpcs)) {
      throw new Error(`method not found: ${service}.${method}`);
    }

    let sp = this.services[service];
    if (!sp) {
      sp = meta.factory(request);
      if (!sp) {
        throw new Error(`create service error: ${service}.${method}`);
      }
      this.services[service] = sp;
    }
    const s = await sp;

    const rpc = s[method];
    if (!rpc) {
      throw new Error(`method not implemented: ${service}.${method}`);
    }

    const [requestDecode, responseEncode, requestStream, responseStream] =
      meta.rpcs[method];
    return {
      requestDecode,
      responseEncode,
      requestStream,
      responseStream,
      exec: rpc.bind(s) as (request: any) => Promise<any>,
    };
  }
}
