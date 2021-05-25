import { greet } from "./protos/greet.proto.generated";
import { Channel } from "../node";

async function main() {
  const channel = new Channel("http://localhost:5000", {
    authorizationToken: "aaa",
  });
  const stubHttp = new greet.Greeter(channel);

  const res1 = await stubHttp.sayHello({ name: "world~wowowow" });
  console.log("http sayHello:", res1);
}
main();
