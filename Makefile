
build:
	rm -rf lib dist
	npx tsc
	npx webpack -c config/bin.webpack.js
	npx webpack -c config/lib.webpack.js
	npx webpack -c config/lib_node.webpack.js
	npx api-extractor run --local --verbose
	ts-node src/bin/node-api.ts

test:
	# ts-node src/bin/main.ts src/proto/hrpc.proto
	# ts-node src/bin/main.ts src/test/test.proto
	node dist/bin.js src/test/test.proto

publish: build
	#npm adduser
	#npm login
	npm publish
