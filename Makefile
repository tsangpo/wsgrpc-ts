
build:
	rm -rf lib dist
	npx tsc
	npx webpack -c config/bin.webpack.js
	npx webpack -c config/lib.webpack.js
	# npx webpack -c config/lib_node.webpack.js
	npx api-extractor run --local --verbose
	# ts-node src/dev/node-api.ts

test:
	# ts-node src/bin/main.ts src/proto/hrpc.proto
	# ts-node src/bin/main.ts src/test/test.proto
	node dist/bin.js test/test.proto
	ts-node test/main.ts
	node --inspect -r ts-node/register test/main.ts

publish: build
	#npm adduser
	#npm login
	npm publish

bundle:
	tsc --moduleResolution node --target es2018 --esModuleInterop --skipLibCheck --declaration -m amd --outFile dist/node-tsc.js src/node.ts
