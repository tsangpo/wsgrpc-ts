

build:
	npx tsc

publish: build
	#npm adduser
	#npm login
	npm publish


test-jspb:
	protoc -I=$DIR echo.proto \
		--js_out=import_style=commonjs:$OUT_DIR \
		--grpc-web_out=import_style=typescript,mode=grpcweb:$OUT_DIR

test-pbjs:
	npx pbjs -t static-module -o src/proto/hrpc.pbjs.js -w es6 --es6 src/proto/hrpc.proto
