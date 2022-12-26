import { Socket as ClientSocket } from "socket.io-client";

// Debug options"
// - Set DBG_VERBOSE_RPC to 1 to print all RPC requests and replies
const verbose = parseInt(process.env.DBG_VERBOSE_RPC || "") === 1;

// - Set both DBG_FUZZ_RPC_[MIN|MAX] to a millisecond value to insert a random delay when handling
//   any RPC (helps check for race conditions) and DBG_FUZZ_RPC_VERBOSE to 1 to print the timings
const fuzzRpcMin = parseInt(process.env.DBG_FUZZ_RPC_MIN || "");
const fuzzRpcMax = parseInt(process.env.DBG_FUZZ_RPC_MAX || "");
const verboseFuzz = parseInt(process.env.DBG_FUZZ_RPC_VERBOSE || "") === 1;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function maybeDelay(): Promise<number> {
  // If we specified a random delay min/max, execute that first
  if (!isNaN(fuzzRpcMin) && !isNaN(fuzzRpcMax)) {
    const range = fuzzRpcMax - fuzzRpcMin;
    const delay = Math.floor(Math.random() * range + fuzzRpcMin);
    await sleep(delay);
    return delay;
  }
  return NaN;
}

export function genSocketPromise(socket: ClientSocket, name: string, data: Uint8Array): Promise<Uint8Array> {
  return new Promise(async (res, rej) => {
    const delay = await maybeDelay();
    if (isNaN(delay) && verboseFuzz) console.log(`Delay ${name} by ${delay}ms`);
    if (verbose) console.log(`Emit ${name} with size ${data.length} to socket ${socket.id}`);
    if (isNaN(delay) && verboseFuzz) console.log(`Execute ${name} (after ${delay}ms)`);
    socket.emit(name, data, (retConvert: ArrayBuffer) => {
      const ret = new Uint8Array(retConvert);
      if (verbose) console.log(`Got reply ${name} with size ${ret.length} from socket ${socket.id}`);
      if (isNaN(delay) && verboseFuzz) console.log(`Done with ${name}`);
      res(ret);
    });
  });
}

export function regSocketCb<Type, Ret>(
    socket: ClientSocket,
    name: string,
    decodeRequest: (data: Uint8Array) => Type,
    encodeResponse: (ret: Ret) => Uint8Array,
    func: (data: Type) => Promise<Ret>) {
  socket.on(name, async (dataConvert: ArrayBuffer, cb: (ret: Uint8Array) => void) => {
    const delay = await maybeDelay();
    if (isNaN(delay) && verboseFuzz) console.log(`Delay ${name} by ${delay}ms`);
    if (isNaN(delay) && verboseFuzz) console.log(`Executing ${name} (after ${delay}ms)!`);
    // Decode the Request type
    const data = new Uint8Array(dataConvert);
    let ret = await func(decodeRequest(data));
    if (isNaN(delay) && verboseFuzz) console.log(`Done with ${name}!`);
    if (verbose) console.log(`Replying to ${name} with size ${JSON.stringify(ret).length} for socket ${socket.id}`);
    cb(encodeResponse(ret));
  });
}
