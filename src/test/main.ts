import { test } from "./test.proto.generated";

const bytes = test.DataFrame.encode({
  callID: 1,
  header: { service: "b", method: "a" },
  trailer: [{ status: "end" }, { message: "error" }],
  nnn: [3, 4, 5],
  n: {},
});

const f = test.DataFrame.decode(bytes);

console.log(bytes, JSON.stringify(f));
