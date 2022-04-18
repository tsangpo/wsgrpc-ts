import http from "http";
import { ICaller, IRpcServer, IServiceDirectory, IServiceFactory, IServiceMeta } from "./types";
import { lcFirst } from "./utils";
import { HttpHandler } from "./server_h1";
import { WebSocketConnection } from "./server_ws";
import { HttpError, HttpStatusCodes } from "./errors";

export class Server {
  private services: IServiceDirectory = {};

  public addService(service: string, rpcs: IServiceMeta, factory: IServiceFactory) {
    this.services[service] = { rpcs, factory };
  }

  middlewares = (req: http.IncomingMessage, res: http.ServerResponse) => {
    const httpHandler = new HttpHandler(new Caller(this.services));
    httpHandler.handle(req, res);
  };

  public listenHttpServerRequest(
    server: http.Server,
    path: string,
    fallback?: (request: http.IncomingMessage, response: http.ServerResponse) => void
  ) {
    // http
    server.on("request", (request: http.IncomingMessage, response: http.ServerResponse) => {
      if (request.url?.startsWith(path)) {
        const httpHandler = new HttpHandler(new Caller(this.services));
        httpHandler.handle(request, response);
      } else if (fallback) {
        fallback(request, response);
      } else {
        response.statusCode = 404;
        response.end();
      }
    });
  }

  public listenHttpServerUpgrade(
    server: http.Server,
    path: string,
    fallback?: (request: http.IncomingMessage, socket: any, upgradeHead: any) => void
  ) {
    // websocket
    //@ts-ignore
    const wss = new WebSocket.Server({ noServer: true });
    server.on("upgrade", (request: http.IncomingMessage, socket, upgradeHead) => {
      const url = new URL(request.url!, `http://${request.headers.host}`);
      if (url.pathname == path) {
        wss.handleUpgrade(
          request,
          socket,
          upgradeHead,
          (ws: WebSocket, request: http.IncomingMessage) =>
            new WebSocketConnection(ws, request, new Caller(this.services))
        );
      } else if (fallback) {
        fallback(request, socket, upgradeHead);
      } else {
        socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
        socket.destroy();
      }
    });
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
    response: http.ServerResponse,
    service: string,
    method: string
  ): Promise<IRpcServer> {
    const meta = this.serviceDirectory[service];
    if (!meta) {
      throw HttpError(
        HttpStatusCodes.NotFound.statusCode,
        `service not found: ${service}.${method}`
      );
    }
    method = lcFirst(method); // NOTE: lcFirst
    if (!(method in meta.rpcs)) {
      throw HttpError(
        HttpStatusCodes.NotFound.statusCode,
        `method not found: ${service}.${method}`
      );
    }

    let sp = this.services[service];
    if (!sp) {
      sp = meta.factory(request, response);
      if (!sp) {
        throw new Error(`create service error: ${service}.${method}`);
      }
      this.services[service] = sp;
    }
    const s = await sp;

    const rpc = s[method];
    if (!rpc) {
      throw HttpError(
        HttpStatusCodes.NotImplemented.statusCode,
        `method not implemented: ${service}.${method}`
      );
    }

    const [requestDecode, responseEncode, requestStream, responseStream] = meta.rpcs[method];
    return {
      requestDecode,
      responseEncode,
      requestStream,
      responseStream,
      exec: rpc.bind(s) as (request: any) => Promise<any>,
    };
  }
}
