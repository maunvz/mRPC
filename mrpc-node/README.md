# mrpc-node
A basic RPC wrapper around [protobuf](https://developers.google.com/protocol-buffers)
and [websockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
to facilitate writing web services and apps.

Features include:
- Uses [proto3](https://developers.google.com/protocol-buffers/docs/proto3)
  to define services/messages
- Uses websockets for transport
- Friendly interfaces to define services/clients

This library is meant to be used in a nodejs runtime. To write clients that run in a
browser, see ```mprc-web```.

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
```mrpc-node``` library and:

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

See https://github.com/maunvz/mRPC/tree/main/samples for a full example of a server/client nodejs command line.
