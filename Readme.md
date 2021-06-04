# wsgrpc

A RPC code generator and runtime. Codes of client side and server side are generated from a grpc proto file.

- When the h1 transport protocal is used, stream request and response are not supported, and content type can be one of ["grpc" | "grpc-web" | "grpc-web+proto" | "json"].
- When websocket is used, rpc with request stream and response stream is allowed.

## Usage

### generate stub from proto file

```bash
npm i wsgrpc
npx wsgrpc $src_file.proto $dist_file.proto.generated.ts
```

$src_file.proto: src proto file
$dist_file.proto.generated.ts: target ts file

### use stub file

see example file: "test/test.ts"

## futures

protobuf suport:

- [Y] repeated
- [Y] enum
- [N] map

# TODO

- call callback for log.

# known issues

- client stream message not process in time。

## Notes

- compile generated ts file to js and d.ts files
