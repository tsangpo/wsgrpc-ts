
build:
	rm -rf lib dist

	### cli
	pnpx esbuild src/bin/main.ts --bundle --minify --banner:js='#!/usr/bin/env node' --platform=node --target=node10.4 --external:ws,node-fetch --outfile=dist/bin.js

	### lib
	pnpx esbuild --bundle --minify --platform=neutral --format=esm ./src/index.ts --outfile=dist/lib.esm.js
	pnpx esbuild --bundle --minify --platform=neutral --format=cjs ./src/index.ts --outfile=dist/lib.cjs.js

	### types
	pnpx tsc
	pnpx api-extractor run --local --verbose

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
