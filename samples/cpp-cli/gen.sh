rm -rf ./src/gen
mkdir -p ./src/gen

protoc \
  --cpp_out=./src/gen \
  --proto_path=../proto \
  ../proto/*.proto
