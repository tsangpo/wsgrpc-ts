import protobufjs from "protobufjs";
import { genMessage } from "./gen_message";
import { genService } from "./gen_service";
import fs from "fs";

function genNamespace(n: protobufjs.Namespace | any) {
  return `
  export namespace ${n.name} {
    ${n.nestedArray.map(genNested).join("\n")}
  }`;
}

function genNested(c: any) {
  if (c instanceof protobufjs.Type) {
    return genMessage(c);
  } else if (c instanceof protobufjs.Service) {
    return genService(c);
  } else if (c instanceof protobufjs.Namespace) {
    return genNamespace(c);
  }
  return "";
}

export function genPackageDefinition(srcfile: string, outfile: string) {
  const root = new protobufjs.Root();
  protobufjs.loadSync(srcfile, root);

  const content = `
// GENERATED CODE -- DO NOT EDIT!
  
/* eslint-disable */
// @ts-nocheck
  
import { IStream as $IStream, IChannel as $IChannel, Reader as $Reader, Writer as  $Writer } from "wsgrpc";

${root.nestedArray.map(genNested).join("\n")}
`;

  fs.writeFileSync(outfile, content, "utf8");
}
