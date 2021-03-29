

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
	# npx pbjs -t static-module -o src/proto/hrpc.pbjs.js -w es6 --es6 src/proto/hrpc.proto
	npx pbjs -t static-module -o src/proto/test.pbjs.js -w es6 --es6 src/proto/test.proto

test-gen:
	ts-node src/bin/main.ts src/test/test.proto
	ts-node src/bin/main.ts src/proto/hrpc.proto

build-web:
	# tsc --moduleResolution node --target es2018 --declaration -m amd --outFile dist/hrpc.web.js src/index.ts
	# npx rollup src/index.js --format cjs --file dist/bundle.js