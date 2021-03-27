export function I(name: string) {
  const ss = name.split(".");
  ss.push("I" + ss.pop());
  return ss.join(".");
}
