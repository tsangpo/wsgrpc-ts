declare global {
  namespace NodeJS {
    interface Global {
      WebSocket: any;
      fetch: any;
    }
  }
}
export * from "./dist/lib";
