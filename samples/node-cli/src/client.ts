import {
  ClientGreeter,
  ClientGreeterDefinition,
  GreeterClientImpl,
  HelloReply,
  HelloRequest,
} from "./gen/helloworld";

import { RpcClientChannel, wrapSocket } from "mrpc-node";

const channel = new RpcClientChannel({host: 'http://localhost:8080'});
const client = new GreeterClientImpl(channel);

// Register a service of our own that the server can now call RPCs on
class ClientGreeterServiceImpl implements ClientGreeter {
  async SayHello(request: HelloRequest): Promise<HelloReply> {
    return {
      message: "Hello " + request.name + " from Node-CLI Client",
    }
  }
}
wrapSocket<ClientGreeter>(
  new ClientGreeterServiceImpl(),
  channel.getSocket(),
  ClientGreeterDefinition);

// Make a call to the server
(async () => {
  const res = await client.SayHello({
    name: "Node-CLI Client",
  });
  console.log("Got reply: ", res);
})();
