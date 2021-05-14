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

see example file: "test/test.ts"

## futures

protobuf suport:

- [Y] repeated
- [Y] enum
- [N] map

# TODO

- use json codec and http post protocal
- call callback for log.

# known issues

- client stream message not process in time。

## Notes

- compile generated ts file to js and d.ts files
