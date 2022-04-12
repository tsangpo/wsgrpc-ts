import protobufjs from "protobufjs/minimal";
import { genMessage } from "./gen_message";
import { genService } from "./gen_service";

function genNamespace(n: protobufjs.Namespace): string {
  return `
export namespace ${n.name} {
  ${n.nestedArray.map(genNested).join("\n")}
}`;
}

function genEnum(n: protobufjs.Enum) {
  return `
  export const ${n.name} = {
    ${Object.entries(n.values)
      .map(([name, id]) => `${name}: ${id}`)
      .join(",\n    ")}
  }`;
}

export function genNested(c: any) {
  if (c instanceof protobufjs.Type) {
    return genMessage(c);
  } else if (c instanceof protobufjs.Service) {
    return genService(c);
  } else if (c instanceof protobufjs.Namespace) {
    return genNamespace(c);
  } else if (c instanceof protobufjs.Enum) {
    return genEnum(c);
  } else {
    return "";
  }
}
