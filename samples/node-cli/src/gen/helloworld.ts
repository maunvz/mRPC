/* eslint-disable */
import * as _m0 from "protobufjs/minimal";

export const protobufPackage = "com.example.proto";

export interface HelloRequest {
  name: string;
}

export interface HelloReply {
  message: string;
}

function createBaseHelloRequest(): HelloRequest {
  return { name: "" };
}

export const HelloRequest = {
  encode(message: HelloRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): HelloRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseHelloRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): HelloRequest {
    return { name: isSet(object.name) ? String(object.name) : "" };
  },

  toJSON(message: HelloRequest): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<HelloRequest>, I>>(object: I): HelloRequest {
    const message = createBaseHelloRequest();
    message.name = object.name ?? "";
    return message;
  },
};

function createBaseHelloReply(): HelloReply {
  return { message: "" };
}

export const HelloReply = {
  encode(message: HelloReply, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.message !== "") {
      writer.uint32(10).string(message.message);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): HelloReply {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseHelloReply();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.message = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): HelloReply {
    return { message: isSet(object.message) ? String(object.message) : "" };
  },

  toJSON(message: HelloReply): unknown {
    const obj: any = {};
    message.message !== undefined && (obj.message = message.message);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<HelloReply>, I>>(object: I): HelloReply {
    const message = createBaseHelloReply();
    message.message = object.message ?? "";
    return message;
  },
};

export interface ClientGreeter {
  SayHello(request: HelloRequest): Promise<HelloReply>;
}

export class ClientGreeterClientImpl implements ClientGreeter {
  private readonly rpc: Rpc;
  private readonly service: string;
  constructor(rpc: Rpc, opts?: { service?: string }) {
    this.service = opts?.service || "com.example.proto.ClientGreeter";
    this.rpc = rpc;
    this.SayHello = this.SayHello.bind(this);
  }
  SayHello(request: HelloRequest): Promise<HelloReply> {
    const data = HelloRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "SayHello", data);
    return promise.then((data) => HelloReply.decode(new _m0.Reader(data)));
  }
}

export type ClientGreeterDefinition = typeof ClientGreeterDefinition;
export const ClientGreeterDefinition = {
  name: "ClientGreeter",
  fullName: "com.example.proto.ClientGreeter",
  methods: {
    sayHello: {
      name: "SayHello",
      requestType: HelloRequest,
      requestStream: false,
      responseType: HelloReply,
      responseStream: false,
      options: {},
    },
  },
} as const;

export interface Greeter {
  SayHello(request: HelloRequest): Promise<HelloReply>;
}

export class GreeterClientImpl implements Greeter {
  private readonly rpc: Rpc;
  private readonly service: string;
  constructor(rpc: Rpc, opts?: { service?: string }) {
    this.service = opts?.service || "com.example.proto.Greeter";
    this.rpc = rpc;
    this.SayHello = this.SayHello.bind(this);
  }
  SayHello(request: HelloRequest): Promise<HelloReply> {
    const data = HelloRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "SayHello", data);
    return promise.then((data) => HelloReply.decode(new _m0.Reader(data)));
  }
}

export type GreeterDefinition = typeof GreeterDefinition;
export const GreeterDefinition = {
  name: "Greeter",
  fullName: "com.example.proto.Greeter",
  methods: {
    sayHello: {
      name: "SayHello",
      requestType: HelloRequest,
      requestStream: false,
      responseType: HelloReply,
      responseStream: false,
      options: {},
    },
  },
} as const;

interface Rpc {
  request(service: string, method: string, data: Uint8Array): Promise<Uint8Array>;
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
