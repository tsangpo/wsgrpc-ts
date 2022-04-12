"use strict";
import WebSocket from "ws";
import fetch from "node-fetch";
global.WebSocket = WebSocket;
global.fetch = fetch;
export * from "./dist/lib.esm.js";
