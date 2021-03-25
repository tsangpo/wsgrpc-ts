import { pbjs } from "./codec_pbjs";

export const codec = pbjs;

export function codeUse() {
  return `const {${Object.keys(pbjs).join(", ")}} = hrpc.codec`;
}

export function codeTypeDecoder(t: protobuf.Type) {
  //
}
