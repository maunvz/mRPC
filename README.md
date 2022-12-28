# mRPC
A basic RPC wrapper around [protobuf](https://developers.google.com/protocol-buffers)
and [websockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
to facilitate writing web services and apps.

Features include:
- Uses [proto3](https://developers.google.com/protocol-buffers/docs/proto3)
  to define services/messages
- Uses websockets for transport
- Friendly interfaces to define services/clients

This project was adapted from an RPC framework I initially wrote for
[Dashnote](https://dashnote.app/), which used a custom interface format
and code generation.

Switching to a standard like protobuf makes it easier to use exisiting libraries
and tooling. For now this project is all Typescript, but in the future it will
support Kotlin and Rust so I can write Android apps and CLIs that interact with
[Dashnote](https://dashnote.app/) and other projects.

## Why not gRPC?
[gRPC](https://grpc.io/) is probably a better framework in every way possible in almost
all cases. However, I couldn't use it in my projects for a few reasons:
- gRPC servers require their own port
- [grpc-web](https://github.com/grpc/grpc-web) requires a proxy for web frontends
- Google App Engine doesn't officially support gRPC

mRPC provides a similar interface to [nice-grpc](https://github.com/deeplay-io/nice-grpc)
but allows a much simpler cloud infra setup: you can have a single server process with
[express.js](https://expressjs.com/) to host the web server and mRPC to host services,
all on the same port within a Google App Engine (free tier) instance.

# Usage
## Code Generation

mRPC's typescript integration is built around [ts-proto](https://github.com/stephenh/ts-proto)
generated interfaces and types.

First, add that to your project:
```
yarn add --dev ts-proto
```
and install the [protobuf compiler](https://github.com/protocolbuffers/protobuf#protocol-compiler-installation)
so you have the protoc command. Then, you can use these to generate typescript bindings for
use with mRPC:
```shell
protoc \
  --plugin=protoc-gen-ts_proto=./node_modules/.bin/protoc-gen-ts_proto \
  --ts_proto_out=./src/gen \
  --ts_proto_opt=outputServices=generic-definitions,outputServices=default \
  --proto_path=../proto \
  ../proto/*.proto
```
Put that in a bash script for convenience to quickly update the typescript whenever you
change the .proto files.

## Writing Servers and Clients
Once you have the generated ts-proto types, you can simply import them, import the
```mrpc-node``` library (or ```mrpc-web``` if running in a browser), and:

Define a service implementation, and add it to an RpcServer:
```typescript
import { createServer } from "http";
import { RpcClientChannel, RpcServer } from "netrpc-node";
import {
  ClientGreeterClientImpl,
  Greeter,
  GreeterDefinition,
  HelloReply,
  HelloRequest
} from "./gen/helloworld"

...

class GreeterServiceImpl implements Greeter {
  async SayHello(request: HelloRequest): Promise<HelloReply> {
    return {
      message: "Hello " + request.name,
    }
  }
}

...

const httpServer = createServer();
const rpcServer = new RpcServer(httpServer, ORIGIN);
rpcServer.addService<Greeter>(new GreeterServiceImpl(), GreeterDefinition);
```
Alternatively, you can just use ```wrapSocket(impl, socket, definition)``` if you got a client socket some other way.

To create a client, create an ```RpcClientChannel``` around a hostname or a Socket object, and pass that into
a ___ClientImpl's constructor:
```typescript
// Import stuff

const channel = new RpcClientChannel({host: 'http://localhost:8080'});
const client = new GreeterClientImpl(channel);
...
const result = await client.SayHello({name: "Alice"});
```

See samples/node-cli for a full example of a server/client nodejs command line.
