import protobufjs, { types } from "protobufjs/minimal";
import { genNested } from "./gen_nested";
import { C, I } from "./types";

export function genMessage(t: protobufjs.Type): string {
  return `
      ${pbjsInterfaceType(t)}
      export namespace ${t.name} {
          ${t.nestedArray.map(genNested).join("\n")}

          ${pbjsEncodeType(t)}
          ${pbjsDecodeType(t)}
      }`;
}

////////////////////////////////////
// decode
////////////////////////////////////

function pbjsDecodeTypeField(f: protobufjs.Field) {
  const t = f.resolve().resolvedType;
  const type = t instanceof protobufjs.Enum ? "int32" : f.type;
  const isGroup = t && (t as any).group;
  const isPackedType = (types.packed as any)[type] !== undefined;
  const wireType = (types.basic as any)[type];
  const isBasic = wireType !== undefined;

  if (f.repeated) {
    return `
    // Repeated fields
    case ${f.id}:
      if (!(message.${f.name} && message.${f.name}.length))
        message.${f.name} = [];
      ${
        isPackedType
          ? `
            if ((tag & 7) === 2) {
              let end2 = reader.uint32() + reader.pos;
              while (reader.pos < end2)
                  message.${f.name}.push(reader.${type}());
            } else
                message.${f.name}.push(reader.${type}());
            `
          : isBasic
          ? `
          message.${f.name}.push(reader.${type}());
          `
          : isGroup
          ? `
            message.${f.name}.push(${type}.decode(reader));
            `
          : `
            message.${f.name}.push(${type}.decode(reader, reader.uint32()));
            `
      }
      break;
    `;
  }

  return `
    case ${f.id}:
        ${
          isBasic
            ? `message.${f.name} = reader.${type}();`
            : isGroup
            ? `message.${f.name} = ${type}.decode(reader);`
            : `message.${f.name} = ${type}.decode(reader, reader.uint32());`
        }
        break;
    `;
}

export function pbjsDecodeType(t: protobuf.Type) {
  return `
  export function decode(reader:Uint8Array): I${t.name};
  export function decode(reader:$Reader, length:number): I${t.name};
  export function decode(reader:Uint8Array|$Reader, length?:number): I${t.name}{
    if (!(reader instanceof $Reader))
      reader = $Reader.create(reader);
    let end = length === undefined ? reader.len : reader.pos + length
    const message = {} as any;

    while (reader.pos < end) {
      let tag = reader.uint32();
      switch (tag >>> 3) {
        ${t.fieldsArray.map(pbjsDecodeTypeField).join("\n")}
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  }`;
}

////////////////////////////////////
// encode
////////////////////////////////////

function pbjsEncodeTypeField(f: protobuf.Field) {
  const t = f.resolve().resolvedType;
  const type = t instanceof protobufjs.Enum ? "int32" : f.type;
  const isGroup = t && (t as any).group;
  const isPackedType = (types.packed as any)[type] !== undefined;
  const wireType = (types.basic as any)[type];
  const isBasic = wireType !== undefined;

  if (f.repeated) {
    if (f.packed && isPackedType) {
      return `
        if (message.${f.name} != null && message.${f.name}.length) {
          writer.uint32(${((f.id << 3) | 2) >>> 0}).fork();
          for (let i = 0; i < message.${f.name}.length; ++i)
              writer.${type}(message.${f.name}[i]);
          writer.ldelim();
        }`;
    } else if (isBasic) {
      //("w.uint32(%i).%s(%s[i])", (field.id << 3 | wireType) >>> 0, type, ref);
      const tag = ((f.id << 3) | wireType) >>> 0;
      return `
        if (message.${f.name} != null && message.${f.name}.length)
          for (let i = 0; i < message.${f.name}.length; ++i)
            writer.uint32(${tag}).${type}(message.${f.name}[i]);
        `;
    } else {
      const tag2 = ((f.id << 3) | 2) >>> 0;
      const tag3 = ((f.id << 3) | 3) >>> 0;
      const tag4 = ((f.id << 3) | 4) >>> 0;
      return `
        if (message.${f.name} != null && message.${f.name}.length)
          for (let i = 0; i < message.${f.name}.length; ++i)
            ${
              isGroup
                ? `${type}.encode(message.${f.name}[i], writer.uint32(${tag3})).uint32(${tag4});`
                : `${type}.encode(message.${f.name}[i], writer.uint32(${tag2}).fork()).ldelim();`
            }`;
    }
  }

  if (isBasic) {
    const tag = ((f.id << 3) | wireType) >>> 0;
    return `
        if (message.${f.name} != null && message.${f.name} != undefined)
          writer.uint32(${tag}).${type}(message.${f.name});
        `;
  } else {
    const tag2 = ((f.id << 3) | 2) >>> 0;
    const tag3 = ((f.id << 3) | 3) >>> 0;
    const tag4 = ((f.id << 3) | 4) >>> 0;
    return `
        if (message.${f.name} != null && message.${f.name} != undefined)
          ${
            isGroup
              ? `${type}.encode(message.${f.name}, writer.uint32(${tag3})).uint32(${tag4});`
              : `${type}.encode(message.${f.name}, writer.uint32(${tag2}).fork()).ldelim();`
          }`;
  }
}

export function pbjsEncodeType(t: protobuf.Type) {
  return `
  export function encode(message:I${t.name}, writer:$Writer): $Writer;
  export function encode(message:I${t.name}): Uint8Array;
  export function encode(message:I${
    t.name
  }, writer?:$Writer): $Writer|Uint8Array {
    const end = !writer
    if (!writer)
      writer = $Writer.create();
    ${t.fieldsArray.map(pbjsEncodeTypeField).join("\n")}
    return end ? writer.finish(): writer;
  }`;
}

export function pbjsInterfaceType(t: protobuf.Type) {
  return `
  ${C(t.comment)}
  export interface I${t.name} {
    ${t.fieldsArray
      .map((f) => `${f.name}?: ${toTsType(f)} ${C(f.comment)}`)
      .join("\n    ")}
  }`;
}

function toTsTypeInterface(field: protobuf.Field) {
  const type = field.resolve().resolvedType;
  if (!type) {
    return "*"; // should not happen
  }
  const ref = type.fullName;
  const base = field.parent!.fullName;

  // internal message type
  if (ref.startsWith(base + ".")) {
    return field.parent!.name + ".I" + type.name;
  }

  // external message type
  const refCC = ref.split(".");
  const baseCC = base.split(".");
  while (refCC.length > 0 && baseCC.length > 0) {
    if (refCC[0] == baseCC[0]) {
      refCC.shift();
      baseCC.shift();
    } else {
      break;
    }
  }
  return I(refCC.join("."));
}

function toTsType(field: protobuf.Field) {
  var type;

  switch (field.type) {
    case "double":
    case "float":
    case "int32":
    case "uint32":
    case "sint32":
    case "fixed32":
    case "sfixed32":
      type = "number";
      break;
    case "int64":
    case "uint64":
    case "sint64":
    case "fixed64":
    case "sfixed64":
      type = "number";
      break;
    case "bool":
      type = "boolean";
      break;
    case "string":
      type = "string";
      break;
    case "bytes":
      type = "Uint8Array";
      break;
    default:
      const t = field.resolve().resolvedType;
      if (t instanceof protobufjs.Enum) {
        type = "number";
      } else {
        type = toTsTypeInterface(field);
      }
      break;
  }
  if (field.map) return "{[key:string]:" + type + "}";
  if (field.repeated) return type + "[]";
  return type;
}
