//@ts-ignore
import protobufjsMinimal from "protobufjs/src/util/minimal";
protobufjsMinimal.Long = true;
const LongBits = protobufjsMinimal.LongBits;

const TWO_TO_32 = 4294967296;
const BIGINT_32 = BigInt(32);

/**
 * Constructs new long bits from a bigint.
 * @param {bigint} value Value
 * @returns {LongBits} Instance
 */
LongBits.from = function (value: bigint | number | string) {
  const result = fromBitInt(BigInt(value));
  // console.log("fromBitInt:", { value, lb: result });
  return result;
};

/**
 * Converts this long bits to a JavaScript bigint.
 * @returns {bigint}
 */
LongBits.prototype.toLong = function (unsigned: boolean) {
  const result = toBigInt(unsigned, this.lo, this.hi);
  // console.log("toBigInt:", { result, lb: this });
  return result;
};

////////////////

function fromBitInt(value: bigint) {
  if (value === BigInt(0)) return new LongBits(0, 0);

  var negative = value < 0;
  if (negative) {
    value = -value;
  }
  var hi = Number(value >> BIGINT_32) | 0;
  var lo = Number(value - (BigInt(hi) << BIGINT_32)) | 0;

  if (negative) {
    hi = ~hi >>> 0;
    lo = ~lo >>> 0;
    if (++lo > TWO_TO_32) {
      lo = 0;
      if (++hi > TWO_TO_32) hi = 0;
    }
  }

  return new LongBits(lo, hi);
}

function toBigInt(unsigned: boolean, lo: number, hi: number) {
  if (unsigned) {
    const result = BigInt(lo >>> 0) + (BigInt(hi >>> 0) << BIGINT_32);
    return result;
  }

  if (hi >>> 31) {
    let lo2 = (~lo + 1) >>> 0,
      hi2 = ~hi >>> 0;
    if (!lo2) hi2 = (hi2 + 1) >>> 0;
    return -(BigInt(lo2) + (BigInt(hi2) << BIGINT_32));
  }

  return BigInt(lo >>> 0) + (BigInt(hi >>> 0) << BIGINT_32);
}
