export const GRPC_STATUS = "grpc-status";
export const GRPC_STATUS_MESSAGE = "grpc-message";

const FrameType = {
  DATA: 0x00, // expecting a data frame
  TRAILER: 0x80, // expecting a trailer frame
};

interface IStream {
  messages: Uint8Array[];
  trailer?: ITrailer | null;
}
interface ITrailer {
  code: number;
  message?: string;
  metadata?: any;
}

function _grpcWebEncodeFrame(type: number, data: Uint8Array): Uint8Array {
  let len = data.length;
  const bytesArray = [0, 0, 0, 0];
  for (var i = 3; i >= 0; i--) {
    bytesArray[i] = len % 256;
    len = len >>> 8;
  }
  const payload = new Uint8Array(5 + data.length);
  payload.set([type], 0);
  payload.set(bytesArray, 1);
  payload.set(data, 5);
  return payload;
}
export function grpcWebEncodeStream(s: IStream): Uint8Array {
  const frames = s.messages.map((m) => _grpcWebEncodeFrame(FrameType.DATA, m));
  if (s.trailer) {
    const metadata = s.trailer.metadata || {};
    metadata[GRPC_STATUS] = s.trailer.code;
    if (s.trailer.message) {
      metadata[GRPC_STATUS_MESSAGE] = s.trailer.message;
    }

    const t = Object.entries(metadata)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\r\n");
    frames.push(
      _grpcWebEncodeFrame(FrameType.TRAILER, new TextEncoder().encode(t))
    );
  }

  const totalLength = frames.reduce((o, i) => o + i.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const f of frames) {
    result.set(f, offset);
    offset += f.length;
  }
  return result;
}

// export function grpcWebEncodeRequest(request: Uint8Array): Uint8Array {
//   return _grpcWebEncodeStream({ messages: [request] });
// }

// export function grpcWebEncodeResponse(response: Uint8Array): Uint8Array {
//   return _grpcWebEncodeStream({ messages: [response], trailer: { code: 0 } });
// }

export function grpcWebDecodeStream(data: ArrayBuffer): IStream {
  const result: IStream = {
    messages: [],
    trailer: null,
  };

  let b = new Uint8Array(data);
  while (b.length) {
    const type = b[0];
    const length = (b[1] << 24) | (b[2] << 16) | (b[3] << 8) | b[4];
    const data = b.slice(5, 5 + length);
    b = b.subarray(5 + length);

    if (type == FrameType.DATA) {
      result.messages.push(data);
    } else if (type == FrameType.TRAILER) {
      const trailer: ITrailer = { code: 0, message: "", metadata: {} };
      new TextDecoder("utf-8")
        .decode(data)
        .trim()
        .split("\r\n")
        .map((line) => line.split(": ", 2))
        .map(([key, value]) => [key.toLowerCase(), value])
        .forEach(([key, value]) => {
          if (key == GRPC_STATUS) {
            trailer.code = Number(value);
          } else if (key == GRPC_STATUS_MESSAGE) {
            trailer.message = value;
          } else {
            trailer.metadata[key] = value;
          }
        });
      result.trailer = trailer;
    }
  }

  return result;
}
