import { Channel, Stream } from "../node";
import { routeguide } from "./protos/route_guide.proto.generated";

main();

async function main() {
  const channel = new Channel("ws://127.0.0.1:2345/wsgrpc");
  const stub = new routeguide.RouteGuide(channel);
  const res1 = await stub.getFeature({});
  console.log("getFeature:", res1);

  const res2 = await stub.listFeatures({
    lo: { latitude: 1, longitude: 2 },
    hi: { latitude: 3, longitude: 4 },
  });
  for await (const r2 of res2.readToItorator()) {
    console.log("listFeatures: ", r2);
  }

  const req3 = new Stream<routeguide.IPoint>();
  req3.writeFromIterator(async function* () {
    await new Promise((resolve) => setTimeout(resolve, 200));
    yield { latitude: 1, longitude: 2 };
    yield { latitude: 3, longitude: 4 };
  });
  const res3 = await stub.recordRoute(req3);
  console.log("recordRoute: ", res3);

  const req4 = new Stream<routeguide.IRouteNote>();
  const res4 = await stub.routeChat(req4);
  req4.writeFromIterator(async function* () {
    await new Promise((resolve) => setTimeout(resolve, 200));
    yield { message: "r1", location: { longitude: 1, latitude: 2 } };
    yield { message: "r2", location: { longitude: 3, latitude: 4 } };
  });
  for await (const r4 of res4.readToItorator()) {
    console.log("routeChat: ", r4);
  }

  channel.reset();
  console.log("end");
}
