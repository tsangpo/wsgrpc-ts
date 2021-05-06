import { data as v2 } from "../proto/data.proto.generated";
import { data as v1 } from "./proto/data.proto.generated";

function tryDecodeDataFrame(data: Uint8Array): v2.IDataFrame | null {
  const f = v1.DataFrame.decode(data);

  if (f.type == v1.DataFrame.Types.HEADERS && f.headers) {
    if (f.endStream) {
      // trailer
      return {
        callID: f.streamId,
        body: f.message,
        trailer: {
          status:
            f.headers.rpcStatus == "0"
              ? v2.DataFrame.Trailer.Status.OK
              : v2.DataFrame.Trailer.Status.ERROR,
          message: f.headers.rpcMessage,
        },
      };
    } else {
      // header
      const [service, method] = f.headers.path?.substr(1).split("/")!;
      return {
        callID: f.streamId,
        body: f.message,
        header: {
          service,
          method,
        },
      };
    }
  } else if (f.type == v1.DataFrame.Types.TRAILERS) {
    // v1 do not use TRAILERS actually
    return null;
  } else if (f.type == v1.DataFrame.Types.MESSAGE && f.message) {
    return {
      callID: f.streamId,
      body: f.message,
    };
  } else {
    return null;
  }
}

function encodeDataFrame(message: v2.IDataFrame): Uint8Array[] {
  const ff: v1.IDataFrame[] = [];

  if (message.header) {
    ff.push({
      streamId: message.callID,
      type: v1.DataFrame.Types.HEADERS,
      endStream: false,
      headers: {
        path: `.${message.header.service}/${message.header.method}`,
      },
    });
  }

  if (message.body) {
    ff.push({
      streamId: message.callID,
      type: v1.DataFrame.Types.MESSAGE,
      endStream: false,
      message: message.body,
    });
  }

  if (message.trailer) {
    if (message.trailer.status == v2.DataFrame.Trailer.Status.OK) {
      ff.push({
        streamId: message.callID,
        type: v1.DataFrame.Types.HEADERS,
        endStream: true,
        headers: {
          status: "200",
          rpcStatus: "0",
          rpcMessage: "Finish",
        },
      });
    } else {
      ff.push({
        streamId: message.callID,
        type: v1.DataFrame.Types.HEADERS,
        endStream: true,
        headers: {
          status: "400",
          rpcStatus: message.trailer.status?.toString(),
          rpcMessage: message.trailer.message,
        },
      });
    }
  }

  return ff.map((f) => v1.DataFrame.encode(f));
}

function encodeRequestOKResponse(callID: number) {
  return v1.DataFrame.encode({
    streamId: callID,
    type: v1.DataFrame.Types.HEADERS,
    endStream: false,
    headers: {
      status: "200",
    },
  });
}

export const v1to2 = {
  tryDecodeDataFrame,
  encodeDataFrame,
  encodeRequestOKResponse,
};
