
build:
	rm -rf lib dist
	npx tsc
	npx webpack -c config/bin.webpack.js
	npx webpack -c config/lib.webpack.js
	# npx webpack -c config/lib_node.webpack.js
	npx api-extractor run --local --verbose
	# ts-node src/dev/node-api.ts

test:
	# ts-node src/bin/main.ts src/proto/data.proto
	# ts-node src/bin/main.ts src/v1/proto/data.proto
	# npx pbjs -t static-module -o test/test.pbjs.js -w es6 --es6 test/test.proto
	# ts-node src/bin/main.ts test/test.proto
	node dist/bin.js test/protos/test.proto
	node dist/bin.js test/protos/route_guide.proto
	ts-node test/test.ts
	node --inspect -r ts-node/register test/test.ts
	ts-node test/route_guide_server.ts
	ts-node test/route_guide_client.ts

publish: build
	#npm adduser
	#npm login
	npm publish

bundle:
	tsc --moduleResolution node --target es2018 --esModuleInterop --skipLibCheck --declaration -m amd --outFile dist/node-tsc.js src/node.ts
