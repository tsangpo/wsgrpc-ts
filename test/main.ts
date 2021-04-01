import { test } from "./test.proto.generated";

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

import { Channel, Server, IStream, Stream } from "../node";
import http from "http";
class MyWS implements test.IWS {
  async GetChannel(
    request: IStream<test.IEndponit>
  ): Promise<IStream<test.IChannel>> {
    const stream = new Stream<test.IChannel>();

    // redis.on('message', ()=>{
    //   stream.write({});
    // })

    return stream;
  }
  async pullEvents(request: test.Simple.IOK): Promise<Stream<test.IEndponit>> {
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
  server.mountHttpServer(s, "/wsgrpc");
  s.listen(2345);

  const stub = new test.WS(new Channel("ws://127.0.0.1:2345/wsgrpc"));

  for (let i = 0; i < 1000; i++) {
    const stream = await stub.pullEvents({});
    stream.read((e) => {
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