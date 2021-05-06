declare global {
  namespace NodeJS {
    interface Global {
      WebSocket: any;
      fetch: any;
    }
  }
}
global.WebSocket = require("ws");
global.fetch = require("node-fetch");
export * from "./src/index";
