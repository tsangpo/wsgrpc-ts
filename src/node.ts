if (typeof global != "undefined") {
  global.WebSocket = require("ws");
}
export * from ".";
export { Server } from "./server";
