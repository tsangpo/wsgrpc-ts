//@ts-ignore
if (typeof global != "undefined") {
  // @ts-ignore
  global.WebSocket = require("ws");
  // @ts-ignore
  global.fetch = require("node-fetch");
  // @ts-ignore
  global.protobuf = require("protobufjs/minimal");
}
