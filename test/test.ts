import { test } from "./protos/test.proto.generated.js";
import { Channel, Server, IStream, Stream } from "../node.js";
import http from "http";

const bytes = test.DataFrame.encode({
  callID: 1,
  header: { service: "b", method: "a" },
  trailer: [{ status: "end" }, { message: "error" }],
  nnn: [3, 4, 5],
  n: {},
  iii: 345784748293,
});

const f = test.DataFrame.decode(bytes);

console.log(bytes, JSON.stringify(f));

class MyWS implements test.IWS {
  async getEndponit(request: test.Simple.IOK): Promise<test.IEndponit> {
    return { url: "wss:asdfasdfas" };
  }

  async pullEndponits(
    request: test.Simple.IOK
  ): Promise<Stream<test.IEndponit>> {
    console.log("pull:", request);
    const stream = new Stream<test.IEndponit>((reason) => {
      console.log("on abort", reason.toString());
    });
    stream.writeFromIterator(async function* () {
      yield { url: "a" };
      await new Promise((resolve) => setTimeout(resolve, 1000));
      yield { url: "b" };
    });
    return stream;
  }
}

async function main() {
  const server = new Server();
  test.WS.addToServer(server, async (req) => new MyWS());

  const s = http.createServer();
  server.listenHttpServerRequest(s, "/wsgrpc");
  server.listenHttpServerUpgrade(s, "/wsgrpc");
  server.fallback((request, response) => {
    response.end("hello");
  });
  s.listen(2345);

  const stubHttp = new test.WS(
    new Channel("http://127.0.0.1:2345/wsgrpc", { contentType: "grpc" })
  );
  const res1 = await stubHttp.getEndponit({});
  console.log("http GetEndponit:", res1);

  const stub = new test.WS(new Channel("ws://127.0.0.1:2345/wsgrpc"));

  for (let i = 0; i < 10; i++) {
    const stream = await stub.pullEndponits({});
    stream.read((e: any) => {
      // console.log("sync" + i, e);
    });
    for await (const e of stream.readToItorator()) {
      // console.log("async" + i, e);
      // stream.abort("no need");
    }
    console.log("rpc end " + i);
  }
}
main();
