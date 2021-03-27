/**
 * index file for browser web
 */

//@ts-ignore
if (typeof window != "undefined" && !window.protobuf) {
  //@ts-ignore
  window.protobuf = require("protobufjs/minimal");
}
