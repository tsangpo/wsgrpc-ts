export function I(name: string) {
  const ss = name.split(".");
  ss.push("I" + ss.pop());
  return ss.join(".");
}

export function C(c: string | null) {
  if (c) {
    return "/** " + c + " */";
  } else {
    return "";
  }
}
