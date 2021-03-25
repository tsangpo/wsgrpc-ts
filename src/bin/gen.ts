import protobufjs from "protobufjs";
import { codeUse } from "../codec";

// function isProtobufTypeDefinition(
//   obj: ServiceDefinition | ProtobufTypeDefinition
// ): obj is ProtobufTypeDefinition {
//   return "format" in obj;
// }
loadPackageDefinition("src/proto/hrpc.proto");

function withIndent(text: string, n: number) {
  if (!n) {
    return text;
  }
  return text
    .split("\n")
    .map((l) => "  ".repeat(n + 1) + l)
    .join("\n");
}

function IMessage(t: protobufjs.Type) {
  let nn = [t.name];
  let tt = t;
  while (tt.parent instanceof protobufjs.Type) {
    tt = tt.parent;
    nn.unshift(tt.name);
  }
  return "I" + nn.join("_");
}

function I(name: string) {
  return "I" + name.replace(/\./g, "_");
}

function genNamespace(n: protobufjs.Namespace) {
  //   console.log("namespace:", n.name);

  let content = `export namespace ${n.name} {\n`;

  for (const c of n.nestedArray) {
    if (c instanceof protobufjs.Type) {
      content += genType(c);
    } else if (c instanceof protobufjs.Service) {
      content += genService(c);
    } else if (c instanceof protobufjs.Namespace) {
      content += genNamespace(c);
    }
  }

  content += "\n}\n";

  return content;
}

function genType(t: protobufjs.Type, sub = 0): string {
  let subs = [];
  for (const c of t.nestedArray) {
    if (c instanceof protobufjs.Type) {
      subs.push(genType(c, sub + 1));
    }
  }

  console.log(t.fieldsArray.map((f) => ({ name: f.name, type: f.type })));

  t.fieldsArray.map((f) => {
    `
    if (message.${f.name}) {
      writer.writeInt32(${f.id}, message.${f.name});
    }`;
  });

  t.fieldsArray.map((f) => {
    `
    case ${f.id}:
      msg.${f.name} = reader.readInt32()
      break;`;
  });

  let funcs = `
        serializeBinary(o:${IMessage(t)}): Uint8Array{
          const writer = new hrpc.BinaryWriter();
          if (message.xxx) {
            writer.writeInt32(1, message.xxx);
          }
          return writer.getResultBuffer();
        },
        deserializeBinary(bytes:Uint8Array): ${IMessage(t)}{
          const reader = new hrpc.BinaryReader(bytes);
          const msg: ${IMessage(t)} = {}
          while (reader.nextField()) {
            if (reader.isEndGroup()) {
              break;
            }
            var field = reader.getFieldNumber();
            switch (field) {
            case 1:
              var value = /** @type {number} */ ();
              msg.xxx = reader.readInt32()
              break;
            default:
              reader.skipField();
              break;
            }
          }
          return msg;
        }
  `;

  if (sub == 0) {
    return `
      export const ${t.name} = {
          ${subs.join("\n")}

          ${funcs}
      }`;
  } else {
    return withIndent(
      `
        ${t.name}: {
            ${subs.join("\n")}

            ${funcs}
        },`,
      sub
    );
  }
}

function genService(t: protobufjs.Service) {
  let rpcs = t.methodsArray.map(parseRpc);
  let meta: string[] = [];
  for (const m of rpcs) {
    meta.push(
      `${m.method}:[${m.requestSerializer}, ${m.responseDeserializer}, ${m.requestStream}, ${m.responseStream}]`
    );
  }

  return `
    export interface I${t.name} {
        ${rpcs
          .map(
            ({ method, requestType, responseType }) =>
              `async ${method}(request:${requestType}): Promise<${responseType}>;`
          )
          .join("\n")}
    }

    export class ${t.name} {
        addToServer(server:any, factory:any){
          server.addService("${t.fullName.substr(1)}", 
                            {${meta.join(", ")}},
                            factory)
        }

        constructor(private channel:hrpc.IChannel){}

        ${rpcs
          .map(
            ({
              method,
              requestType,
              responseType,
              rpcCall,
              requestSerializer,
              responseDeserializer,
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
  const method = m.name;
  const requestType = m.requestStream
    ? `Stream<${I(m.requestType)}>`
    : I(m.requestType);
  const responseType = m.responseStream
    ? `Stream<${I(m.responseType)}>`
    : I(m.responseType);
  const rpcCall = `rpc${m.requestStream ? "Stream" : "Unary"}${
    m.responseStream ? "Stream" : "Unary"
  }`;
  const requestSerializer = m.requestType + ".serializeBinary";
  const responseDeserializer = m.responseType + ".deserializeBinary";

  return {
    method,
    requestType,
    responseType,
    requestSerializer,
    responseDeserializer,
    requestStream: !!m.requestStream,
    responseStream: !!m.responseStream,
    rpcCall,
  };
}

function loadPackageDefinition(file: string) {
  const root = new protobufjs.Root();
  protobufjs.loadSync(file, root);

  const nnn = genNamespace(root.nestedArray[0] as protobuf.Namespace);
  const ttt = `
// GENERATED CODE -- DO NOT EDIT!
  
/* eslint-disable */
// @ts-nocheck
  
import hrpc from "hrpc-ts";
${codeUse()}

${nnn}
`;
  console.log(ttt);
}
