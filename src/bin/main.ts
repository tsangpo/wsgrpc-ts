#!/usr/bin/env node
import { genPackageDefinition } from "./gen";

const args = process.argv.slice(2);

if (args.length >= 1) {
  let [srcfile, outfile] = args;
  if (!outfile) {
    outfile = srcfile + ".ts";
  }
  genPackageDefinition(srcfile, outfile);
} else {
  console.log(`hrpc-ts - rpc using protobuf and http protocal
Usage: hrpc-ts $src_file.proto $dist_file.proto.ts
$src_file.proto: src proto file
$dist_file.proto.ts: target ts file
`);
}
