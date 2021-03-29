import http from "http";
import { IServiceDirectory, IServiceFactory, IServiceMeta } from ".";
import { startWebSocketEndpoint } from "./server-ws";

export class Server {
  private services: IServiceDirectory = {};

  public addService(
    service: string,
    rpcs: IServiceMeta,
    factory: IServiceFactory
  ) {
    this.services[service] = { rpcs, factory };
  }

  public mountHttpServer(server: http.Server, path: string) {
    startWebSocketEndpoint(server, path, this.services);
    // TODO: maybe start http1.1 handler
  }
}
