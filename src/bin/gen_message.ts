import protobufjs, { types } from "protobufjs/minimal";
import { I } from "./types";

export function genMessage(t: protobufjs.Type, sub = 0): string {
  let subs = [];
  for (const c of t.nestedArray) {
    if (c instanceof protobufjs.Type) {
      subs.push(genMessage(c, sub + 1));
    }
  }

  console.log(
    t.fieldsArray.map((f) => ({
      name: f.name,
      type: f.type,
      a: f.resolve().resolvedType,
    }))
  );

  return `
      ${t.comment ? "/// " + t.comment : ""}
      ${pbjsInterfaceType(t)}
      export namespace ${t.name} {
          ${subs.join("\n")}

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
  const notBasic = (types.basic as any)[f.type] === undefined;
  const isGroup = t && (t as any).group;
  const isPacked = (types.packed as any)[f.type] !== undefined;

  if (f.repeated) {
    return `
    // Repeated fields
    case ${f.id}:
      if (!(message.${f.name} && message.${f.name}.length))
        message.${f.name} = [];
      ${
        isPacked
          ? `
            if ((tag & 7) === 2) {
              let end2 = reader.uint32() + reader.pos;
              while (reader.pos < end2)
                  message.${f.name}.push(reader.${type}());
            } else
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
          notBasic
            ? isGroup
              ? `message.${f.name} = ${f.type}.decode(reader);`
              : `message.${f.name} = ${f.type}.decode(reader, reader.uint32());`
            : `message.${f.name} = reader.${f.type}();`
        }
        break;
    `;
}

export function pbjsDecodeType(t: protobuf.Type) {
  return `
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
  const notBasic = (types.basic as any)[f.type] === undefined;
  const isGroup = t && (t as any).group;
  const isPackedType = (types.packed as any)[f.type] !== undefined;
  const wireType = (types.basic as any)[type];

  if (f.repeated) {
    if (f.packed && isPackedType) {
      return `
        if (message.${f.name} != null && message.${f.name}.length) {
          writer.uint32(${((f.id << 3) | 2) >>> 0}).fork();
          for (let i = 0; i < message.${f.name}.length; ++i)
              writer.${f.type}(message.${f.name}[i]);
          writer.ldelim();
        }`;
    } else if (wireType === undefined) {
      const tag2 = ((f.id << 3) | 2) >>> 0;
      const tag3 = ((f.id << 3) | 3) >>> 0;
      const tag4 = ((f.id << 3) | 4) >>> 0;
      return `
        if (message.${f.name} != null && message.${f.name}.length)
          for (let i = 0; i < message.${f.name}.length; ++i)
            ${
              isGroup
                ? `${f.type}.encode(message.${f.name}[i], writer.uint32(${tag3})).uint32(${tag4});`
                : `${f.type}.encode(message.${f.name}[i], writer.uint32(${tag2}).fork()).ldelim();`
            }`;
    } else {
      //("w.uint32(%i).%s(%s[i])", (field.id << 3 | wireType) >>> 0, type, ref);
      const tag = ((f.id << 3) | wireType) >>> 0;
      return `
        if (message.${f.name} != null && message.${f.name}.length)
          for (let i = 0; i < message.${f.name}.length; ++i)
            writer.uint32(${tag}).${type}(message.${f.name}[i]);
        `;
    }
  }

  if (wireType === undefined) {
    const tag2 = ((f.id << 3) | 2) >>> 0;
    const tag3 = ((f.id << 3) | 3) >>> 0;
    const tag4 = ((f.id << 3) | 4) >>> 0;
    return `
        if (message.${f.name} != null && message.${f.name} != undefined)
          ${
            isGroup
              ? `${f.type}.encode(message.${f.name}, writer.uint32(${tag3})).uint32(${tag4});`
              : `${f.type}.encode(message.${f.name}, writer.uint32(${tag2}).fork()).ldelim();`
          }`;
  } else {
    const tag = ((f.id << 3) | wireType) >>> 0;
    return `
        if (message.${f.name} != null && message.${f.name} != undefined)
          writer.uint32(${tag}).${f.type}(message.${f.name});
        `;
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
  export interface I${t.name} {
    ${t.fieldsArray.map((f) => `${f.name}: ${toTsType(f)}`).join("\n    ")}
  }`;
}

function toTsTypeInterface(field: protobuf.Field) {
  const type = field.resolve().resolvedType;
  if (!type) {
    return "*"; // should not happen
  }
  const ref = type.fullName;
  const base = field.parent!.fullName;

  // 子结构
  if (ref.startsWith(base)) {
    return field.parent!.name + ".I" + type.name;
  }

  // 其他
  let i = 0;
  for (; i < ref.length; ++i) {
    if (ref[i] != base[i]) {
      break;
    }
  }
  return I(ref.substr(i));
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
      type = toTsTypeInterface(field);
      break;
  }
  if (field.map) return "{[key:string]:" + type + "}";
  if (field.repeated) return type + "[]";
  return type;
}
