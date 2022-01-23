import http from "http";
import { ICaller, IRpcServer } from "./types";
import {
  grpcWebDecodeStream,
  grpcWebEncodeStream,
  GRPC_STATUS,
  GRPC_STATUS_MESSAGE,
} from "./grpc";

export class HttpHandler {
  pathPrefix: string;
  constructor(pathPrefix: string, private caller: ICaller) {
    // important!!! don't use node lib so that can compile for browser
    if (!pathPrefix.endsWith("/")) {
      pathPrefix += "/";
    }
    this.pathPrefix = pathPrefix;
  }

  async handle(request: http.IncomingMessage, response: http.ServerResponse) {
    if (request.method == "OPTIONS") {
      this._corsOptions(request, response);
      return;
    }
    if (request.method != "POST") {
      throw new Error("http method not supported");
    }
    const [service, method] = request
      .url!.substr(this.pathPrefix.length)
      .split("/");

    try {
      const rpc = await this.caller.getRpc(request, service, method);
      if (!rpc.requestStream && !rpc.responseStream) {
        await this.rpcUnaryUnary(request, response, rpc);
      } else {
        response.statusCode = 501;
        response.end();
      }
    } catch (e: any) {
      console.log("exec error:", e);
      response.statusCode = 500;
      response.end(e.toString());
    }
  }

  _corsOptions(req: http.IncomingMessage, res: http.ServerResponse) {
    const requestOrigin = req.headers["origin"];
    if (!requestOrigin) {
      res.writeHead(400);
      res.end("no header: Origin");
      return;
    }

    if (!req.headers["access-control-request-method"]) {
      res.writeHead(400);
      res.end("no header: Access-Control-Request-Method");
      return;
    }

    let allowHeaders = req.headers["access-control-request-headers"];
    if (!allowHeaders) {
      allowHeaders = "Authentication";
    }

    res.writeHead(204, {
      "Access-Control-Allow-Origin": requestOrigin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": allowHeaders,
    });
    res.end();
  }

  _readRequestBody(request: http.IncomingMessage): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      let body: Buffer[] = [];
      request
        .on("error", (err) => {
          reject(err);
        })
        .on("data", (chunk: Buffer) => {
          body.push(chunk);
        })
        .on("end", () => {
          const result = Buffer.concat(body);
          resolve(result);
        });
    });
  }

  async rpcUnaryUnary(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    rpc: IRpcServer
  ) {
    const contentType = req.headers["content-type"];
    const buf = await this._readRequestBody(req);
    if (contentType == "application/json") {
      const request = JSON.parse(buf.toString());
      const response = await rpc.exec(request);
      res.setHeader("content-type", contentType);
      res.setHeader(GRPC_STATUS, "0");
      res.end(JSON.stringify(response));
    } else if (contentType == "application/grpc") {
      const request = rpc.requestDecode(new Uint8Array(buf));
      const response = await rpc.exec(request);
      res.setHeader("content-type", contentType);
      res.setHeader(GRPC_STATUS, "0");
      res.end(rpc.responseEncode(response));
    } else if (
      contentType == "application/grpc-web" ||
      contentType == "application/grpc-web+proto"
    ) {
      const s = grpcWebDecodeStream(buf);
      const request = s.messages[0];
      const response = await rpc.exec(request);
      res.setHeader("content-type", contentType);
      const result = grpcWebEncodeStream({
        messages: [rpc.responseEncode(response)],
        trailer: { code: 0 },
      });
      res.end(Buffer.from(result), "binary");
    } else {
      throw new Error(`content-type not supported: ${contentType}`);
    }
  }
}
