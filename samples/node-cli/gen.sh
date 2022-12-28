rm -rf ./src/gen
mkdir -p ./src/gen

protoc \
  --plugin=protoc-gen-ts_proto=./node_modules/.bin/protoc-gen-ts_proto \
  --ts_proto_out=./src/gen \
  --ts_proto_opt=outputServices=generic-definitions,outputServices=default \
  --proto_path=../proto \
  ../proto/*.proto
