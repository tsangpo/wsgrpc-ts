namespace pkg {
  export namespace Mt {
    export namespace SubMt {
      export function encode() {
        return "sss";
      }
      export function decode() {}
    }
    export function encode() {
      return SubMt.encode();
    }
    export function decode() {}
  }
}

const cb = pkg.Mt.encode;

console.log(cb());
