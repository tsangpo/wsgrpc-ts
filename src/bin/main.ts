import { genPackage } from "./gen_proto";

const args = process.argv.slice(2);

if (args.length >= 1 && args.length <= 2) {
  let [srcfile, outfile] = args;
  if (!outfile) {
    outfile = srcfile + ".generated.ts";
  }
  genPackage(srcfile, outfile);
  console.log("generated file:", outfile);
} else {
  console.log(`wsgrpc - rpc using protobuf and websocket protocal
Usage: wsgrpc $src_file.proto $dist_file.proto.ts
$src_file.proto: src proto file
$dist_file.proto.ts: target ts file
`);
}
