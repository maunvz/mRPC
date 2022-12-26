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

### Why not gRPC?
[gRPC](https://grpc.io/) is probably a better framework in every way possible in almost
all cases. However, I couldn't use it in my projects for a few reasons:
- gRPC servers require their own port
- [grpc-web](https://github.com/grpc/grpc-web) requires a proxy for web frontends
- Google App Engine doesn't officially support gRPC

mRPC provides a similar interface to [nice-grpc](https://github.com/deeplay-io/nice-grpc)
but allows a much simpler cloud infra setup: you can have a single server process with
[express.js](https://expressjs.com/) to host the web server and mRPC to host services,
all on the same port within a Google App Engine (free tier) instance.

## Usage
TODO: Will add sample code and instructions later.