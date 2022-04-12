import { writeFileSync } from "fs";
import protobufjs from "protobufjs";
import { genNested } from "./gen_nested";

export function genPackage(srcfile: string, outfile: string) {
  const root = new protobufjs.Root();
  protobufjs.loadSync(srcfile, root);

  const content = `
// GENERATED CODE -- DO NOT EDIT!
  
/* eslint-disable */
// @ts-nocheck
  
import {
  IChannel as $IChannel,
  IServiceFactory as $IServiceFactory,
  IStream as $IStream,
  Reader as $Reader,
  Writer as $Writer,
} from 'wsgrpc';

${root.nestedArray.map(genNested).join("\n")}
`;

  writeFileSync(outfile, content, "utf8");
}
