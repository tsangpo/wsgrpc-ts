import { test } from "./protos/test.proto.generated";

main();

function main() {
  const a = test.Simple.OK.encode({});
  console.log({ a });
}
