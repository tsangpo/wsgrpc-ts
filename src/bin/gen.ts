import protobufjs from "protobufjs";
import { genMessage } from "./gen_message";
import { genService } from "./gen_service";
import fs from "fs";

function genNamespace(n: protobufjs.Namespace | any) {
  let content = `export namespace ${n.name} {\n`;

  for (const c of n.nestedArray) {
    if (c instanceof protobufjs.Type) {
      content += genMessage(c);
    } else if (c instanceof protobufjs.Service) {
      content += genService(c);
    } else if (c instanceof protobufjs.Namespace) {
      content += genNamespace(c);
    }
  }

  content += "\n}\n";

  return content;
}

export function genPackageDefinition(srcfile: string, outfile: string) {
  const root = new protobufjs.Root();
  protobufjs.loadSync(srcfile, root);

  const content = `
// GENERATED CODE -- DO NOT EDIT!
  
/* eslint-disable */
// @ts-nocheck
  
import { Stream as $Stream, IChannel as $IChannel, Reader as $Reader, Writer as  $Writer } from "hrpc";

${root.nestedArray.map(genNamespace).join("\n")}
`;

  fs.writeFileSync(outfile, content, "utf8");
}
