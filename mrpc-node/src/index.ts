import * as _m0 from "protobufjs/minimal";

import { Server as HttpServer } from "http";
import { Socket as ServerSocket, Server as SocketServer } from "socket.io";
import { io, Socket as ClientSocket } from "socket.io-client";
import { SOCKET_ID_KEY, genSocketPromise, regSocketCb } from "./RpcUtils";

// Example "Definition" output from ts-proto:
// export const GreeterDefinition = {
//   name: "Greeter",
//   fullName: "helloworld.Greeter",
//   methods: {
//     sayHello: {
//       name: "SayHello",
//       requestType: HelloRequest,
//       requestStream: false,
//       responseType: HelloReply,
//       responseStream: false,
//       options: {},
//     },
//   },
// } as const;

type Encodable = {
  encode: (msg: any, writer: _m0.Writer) => _m0.Writer,
  decode: (input: _m0.Reader | Uint8Array, length?: number) => any,
}

export type ServiceDefinition = {
  name: string,
  fullName: string,
  methods: {
    [key: string]: {
      name: string,
      requestType: Encodable,
      responseType: Encodable
    }
  }
}

// Copied from ts-proto: this is what a ClientImpl expects to receive in ctor
// to back the actual communications
interface Rpc {
  request(service: string, method: string, data: Uint8Array): Promise<Uint8Array>;
}

export class RpcClientChannel implements Rpc {
  private socket: ClientSocket | ServerSocket;
  private onConnect?: () => Promise<void>;

  // Specify a socket or a host, with an optional namespace. Clients may pass
  // an onConnect in case on-demand re-connection requires some init step.
  constructor(options: {
    socket?: ClientSocket | ServerSocket,
    host?: string,
    namespace?: string,
    onConnect?: () => Promise<void>,
  }) {
    if (options.socket) {
      this.socket = options.socket;
    } else {
      const url = options.host + (options.namespace || "");
      this.socket = io(url);
      this.socket.connect();
    }
    this.request = this.request.bind(this);
    this.onConnect = options.onConnect;
  }

  async request(service: string, method: string, data: Uint8Array): Promise<Uint8Array> {
    if (!this.socket.connected) {
      if (this.socket instanceof ClientSocket) {
        (this.socket as ClientSocket).connect();
        if (this.onConnect) {
          await this.onConnect();
        }
      } else {
        throw new Error("Client not connected!");
      }
    }
    return genSocketPromise(this.socket, `${service}+${method}`, data);
  }

  getSocket(): ClientSocket | ServerSocket {
    return this.socket;
  }
}

export type RpcServerOptions = {
  server: SocketServer | HttpServer;
  origin: string;
  namespace: string;
}

export class RpcServer {
  socketServer: SocketServer;
  namespace: string;

  constructor(options: RpcServerOptions) {
    if (options.server instanceof SocketServer) {
      this.socketServer = options.server;
    } else {
      this.socketServer = new SocketServer(options.server, {
        cors: {
          origin: options.origin,
          methods: ["GET", "POST"]
        },
        allowEIO3: true,
      });
    }

    this.namespace = options.namespace ? options.namespace : "";
  }

  addService<TService>(impl: TService, definition: ServiceDefinition, onConnection: (socket: ServerSocket) => void) {
    if (this.namespace !== "") {
      this.socketServer.of(this.namespace).on("connection", socket => {
        wrapSocket<TService>(impl, socket, definition);
        onConnection(socket);
      });
    } else {
      this.socketServer.on("connection", socket => {
        wrapSocket<TService>(impl, socket, definition);
        onConnection(socket);
      });
    }
  }
}

export function wrapSocket<TDefinition>(
    impl: TDefinition,
    socket: ClientSocket | ServerSocket,
    definition: ServiceDefinition) {
  for (const key in definition.methods) {
    const method = definition.methods[key];
    regSocketCb(
      socket,
      `${definition.fullName}+${method.name}`,
      (data) => method.requestType.decode(data),
      (res) => method.responseType.encode(res, _m0.Writer.create()).finish(),
      ((impl as any)[method.name] as any).bind(impl));
  }
}

export function getSocketId<Type>(arg: Type) {
  return (arg as any)[SOCKET_ID_KEY];
}
