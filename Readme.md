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
- [Y] enum
- [N] map

# TODO

- use json codec and http post protocal
- stream data writen before read should can be read.
- call callback for log.

## Notes

- compile generated ts file to js and d.ts files
