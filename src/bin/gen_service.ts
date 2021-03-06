import protobufjs from "protobufjs/minimal";
import { lcFirst } from "../utils";
import { C, I } from "./types";

export function genService(t: protobufjs.Service) {
  let rpcs = t.methodsArray.map(parseRpc);
  let meta: string[] = [];
  for (const m of rpcs) {
    meta.push(
      `${m.method}:[${m.requestDeserializer}, ${m.responseSerializer}, ${m.requestStream}, ${m.responseStream}]`
    );
  }

  return `
      ${C(t.comment)}
      export interface I${t.name} {
          ${rpcs
            .map(
              ({ comment, method, requestType, responseType }) =>
                `
                ${C(comment)}
                ${method}(request:${requestType}): Promise<${responseType}>;`
            )
            .join("\n")}
      }
  
      export class ${t.name} implements I${t.name} {
          static addToServer(server: any, factory: $IServiceFactory<I${t.name}>) {
            server.addService("${t.fullName.substr(1)}", 
                              {${meta.join(", ")}},
                              factory)
          }
  
          constructor(private channel:$IChannel){}
  
          ${rpcs
            .map(
              ({
                method,
                requestType,
                responseType,
                rpcCall,
                requestSerializer,
                responseDeserializer,
                comment,
              }) => `
          async ${method}(request:${requestType}): Promise<${responseType}> {
              return await this.channel.${rpcCall}("${t.fullName.substr(
                1
              )}", "${method}", ${requestSerializer}, ${responseDeserializer}, request);
          }`
            )
            .join("\n")}
      }`;
}

function parseRpc(m: protobufjs.Method) {
  let method = m.name;
  const requestType = m.requestStream ? `$IStream<${I(m.requestType)}>` : I(m.requestType);
  const responseType = m.responseStream ? `$IStream<${I(m.responseType)}>` : I(m.responseType);
  const rpcCall = `rpc${m.requestStream ? "Stream" : "Unary"}${
    m.responseStream ? "Stream" : "Unary"
  }`;
  const requestSerializer = m.requestType + ".encode";
  const requestDeserializer = m.requestType + ".decode";
  const responseSerializer = m.responseType + ".encode";
  const responseDeserializer = m.responseType + ".decode";

  method = lcFirst(method); // NOTE: lcFirst
  return {
    method,
    requestType,
    responseType,
    requestSerializer,
    requestDeserializer,
    responseDeserializer,
    responseSerializer,
    requestStream: !!m.requestStream,
    responseStream: !!m.responseStream,
    rpcCall,
    comment: m.comment,
  };
}
