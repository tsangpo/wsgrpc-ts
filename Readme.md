# wsgrpc

rpc using protobuf and websocket protocal

## Usage

### generate stub from proto file

```bash
npm i wsgrpc
npx wsgrpc $src_file.proto $dist_file.proto.generated.ts
```

$src_file.proto: src proto file
$dist_file.proto.generated.ts: target ts file

### use stub file

see example file: "test/main.ts"

## futures

protobuf suport:

- [Y] repeated
- [N] map
- [N] enum
