import { createServer } from "http";
import { RpcClientChannel, RpcServer, getSocketId } from "mrpc-node";
import {
  ClientGreeterClientImpl,
  Greeter,
  GreeterDefinition,
  HelloReply,
  HelloRequest
} from "./gen/helloworld"

// Env can specify origin and port in prod, by default use debug options that enable
// easy local development. Origin is used by CORS
const ORIGIN = process.env.ORIGIN || 'http://localhost:1234';
const PORT = parseInt(process.env.PORT || "8080") || 8080;

class GreeterServiceImpl implements Greeter {
  async SayHello(request: HelloRequest): Promise<HelloReply> {
    console.log("Called from socket id: ", getSocketId(request));
    return {
      message: "Hello " + request.name,
    }
  }
}

const httpServer = createServer();
const rpcServer = new RpcServer({
  namespace: "",
  origin: ORIGIN,
  server: httpServer
});
rpcServer.addService<Greeter>(new GreeterServiceImpl(), GreeterDefinition,
    async (socket) => {
      const channel = new RpcClientChannel({socket});
      const client = new ClientGreeterClientImpl(channel);
      const res = await client.SayHello({
        name: "Bob"
      });
      console.log("Got reply:", res);
    });

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
