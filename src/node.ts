import WebSocket from "ws";
if (typeof global != "undefined") {
  global.WebSocket = WebSocket as any;
}
export * from ".";
export { Server } from "./server";
