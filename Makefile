
build:
	rm -rf lib dist

	### cli
	pnpx esbuild src/bin/main.ts --bundle --minify --format=cjs --banner:js='#!/usr/bin/env node' --platform=node --target=node12 --outfile=dist/bin.cjs

	### lib
	pnpx esbuild --bundle --minify --platform=neutral --format=esm ./src/index.ts --outfile=dist/lib.mjs
	pnpx esbuild --bundle --minify --platform=neutral --format=cjs ./src/index.ts --outfile=dist/lib.cjs

	### types
	./node_modules/.bin/tsc
	./node_modules/.bin/api-extractor run --local --verbose

build-tsup:
	# not work
	rm -rf lib dist
	### cli
	pnpx tsup src/bin/main.ts --format iife
	### lib
	pnpx tsup src/index.ts --format cjs,esm --dts
	### lib-node
	pnpx tsup node.ts --format cjs,esm --dts

test:
	# ts-node src/bin/main.ts src/proto/data.proto
	# ts-node src/bin/main.ts src/v1/proto/data.proto
	# npx pbjs -t static-module -o test/test.pbjs.js -w es6 --es6 test/test.proto
	# ts-node src/bin/main.ts test/test.proto
	node dist/bin.js test/protos/test.proto
	node dist/bin.js test/protos/route_guide.proto
	node dist/bin.js test/protos/greet.proto
	ts-node test/test.ts
	node --inspect --loader ts-node/esm test/test.ts
	ts-node test/route_guide_server.ts
	ts-node test/route_guide_client.ts

publish: build
	#npm adduser
	#npm login
	npm publish
