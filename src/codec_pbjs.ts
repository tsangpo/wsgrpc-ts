import protobuf from "protobufjs/minimal";

export const pbjs = {
  $Reader: protobuf.Reader,
  $Writer: protobuf.Writer,
  $util: protobuf.util,
};

function pbjsDecodeTypeField(f: protobuf.Field) {
  return `
    case ${f.id}:
        message.${f.name} = reader.${f.type}();
        break;
    `;
}

export function pbjsDecodeType(t: protobuf.Type, bytes: Uint8Array) {
  const reader = pbjs.$Reader.create(bytes);
  let end = reader.len;
  const message = {} as any;

  while (reader.pos < end) {
    let tag = reader.uint32();
    switch (tag >>> 3) {
      case 1:
        message.callID = reader.int32();
        break;
      case 2:
        message.header = $root.hrpc.DataFrame.Header.decode(
          reader,
          reader.uint32()
        );
        break;
      case 3:
        message.trailer = $root.hrpc.DataFrame.Trailer.decode(
          reader,
          reader.uint32()
        );
        break;
      case 4:
        message.body = reader.bytes();
        break;
      default:
        reader.skipType(tag & 7);
        break;
    }
  }
  return message;
}
