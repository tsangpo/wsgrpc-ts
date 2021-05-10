import http from "http";
import { IStream, Server, Stream } from "../node";
import { routeguide } from "./protos/route_guide.proto.generated";

main();

async function main() {
  const server = new Server();
  routeguide.RouteGuide.addToServer(server, async (req) => new RouteGuide());

  const s = http.createServer();
  server.listenHttpServerUpgrade(s, "/wsgrpc");
  s.listen(2345);
  console.log("listen 2345");
}

class RouteGuide implements routeguide.IRouteGuide {
  async getFeature(request: routeguide.IPoint): Promise<routeguide.IFeature> {
    console.log("getFeature:", request);
    return { name: "fname", location: { latitude: 1, longitude: 2 } };
  }

  async listFeatures(
    request: routeguide.IRectangle
  ): Promise<IStream<routeguide.IFeature>> {
    console.log("listFeatures:", request);
    const stream = new Stream<routeguide.IFeature>((reason) => {
      console.log("on abort", reason.toString());
    });
    stream.writeFromIterator(async function* () {
      yield { name: "list 1", location: { latitude: 1, longitude: 2 } };
      await new Promise((resolve) => setTimeout(resolve, 1000));
      yield { name: "list 2", location: { latitude: 1, longitude: 2 } };
    });
    return stream;
  }

  async recordRoute(
    request: IStream<routeguide.IPoint>
  ): Promise<routeguide.IRouteSummary> {
    console.log("recordRoute:", request);
    for await (const r of request.readToItorator()) {
      console.log("request item:", r);
    }
    return { pointCount: 22, featureCount: 33 };
  }

  async routeChat(
    request: IStream<routeguide.IRouteNote>
  ): Promise<IStream<routeguide.IRouteNote>> {
    console.log("routeChat:", request);
    const stream = new Stream<routeguide.IFeature>((reason) => {
      console.log("on abort", reason.toString());
    });
    request
      .read((req) => {
        console.log("request:", req);
        stream.write(req);
      })
      .finally(() => {
        console.log("request end, stream.end");
        stream.end();
      });
    return stream;
  }
}
