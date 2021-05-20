import {
  action,
  createMachine,
  state as final,
  guard,
  immediate,
  interpret,
  invoke,
  reduce,
  state,
  transition,
} from 'robot3';

const USB_BUFFER_SIZE = 64;

// ██╗      ██████╗  █████╗ ██████╗     ██████╗  █████╗ ████████╗ ██████╗██╗  ██╗
// ██║     ██╔═══██╗██╔══██╗██╔══██╗    ██╔══██╗██╔══██╗╚══██╔══╝██╔════╝██║  ██║
// ██║     ██║   ██║███████║██║  ██║    ██████╔╝███████║   ██║   ██║     ███████║
// ██║     ██║   ██║██╔══██║██║  ██║    ██╔═══╝ ██╔══██║   ██║   ██║     ██╔══██║
// ███████╗╚██████╔╝██║  ██║██████╔╝    ██║     ██║  ██║   ██║   ╚██████╗██║  ██║
// ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝     ╚═╝     ╚═╝  ╚═╝   ╚═╝    ╚═════╝╚═╝  ╚═╝
//
//
// How the load patch machine works:
//
// 1. The main state machine transitions into the loadPatch state, which starts
//    this state machine. 
// 2. Data is sent to plinky requesting a patch (sendLoadRequest)
// 3. Plinky starts sending over a bunch of data in sequence
// 4. WebUSBPlinky intercepts those and invokes this machine with the 'data'
//    transition.
// 5. When the first data event happens, it is evaluated (hasHeader) and
//    processed (processHeader) to set the number of bytes we're expecting
//    in the patch.
// 6. With each subsequent 'data' transition, Plinky keeps advancing this
//    machine's 'read' state, which invokes the readBytes function. It takes
//    the payload from the data event & saves it in the state machine context.
// 7. When there's no more data to load, the state machine is finished, and the
//    parent machine calling it gets the final result payload.
//

/**
 * Process the header from data event from WebUSBPlinky
 * @param {*} ctx - State machine context
 * @param {*} ev - Data event from WebUSBPlinky
 * @returns {*} - New state machine context
 */
function processHeader(ctx, ev) {
  const data = new Uint8Array(ev.data);
  // Set the header
  ctx.header = data;
  // Slot (patch number) to load from is in 5th index
  ctx.slot = data[5];
  // We're going to be counting how many bytes we have read to know when to stop
  ctx.processedBytes = 0;
  // Bytes 8 and 9 in the header contains how many bytes are going to be sent as an uint16
  ctx.bytesToProcess = data[8]+data[9]*256;
  // Keep all results in an array until the end, when we can concat them all into a single ArrayBuffer
  ctx.result = [];
  console.log(`Loading from slot: ${ctx.slot} - Expecting ${ctx.bytesToProcess} bytes (header: ${ctx.header})`);
  return ctx;
}

/**
 * Check if an event has a header for loading a patch.
 * @param {*} ctx - State machine context
 * @param {*} ev - Data event from WebUSBPlinky
 * @returns {Boolean} - True if correct header is present in event data
 */
function hasHeader(ctx, ev) {
  const data = new Uint8Array(ev.data);
  if(!data) return false;
  if(data.byteLength !== 10) return false;
  if (data[0]!==0xf3) return false;
  if (data[1]!==0x0f) return false;
  if (data[2]!==0xab) return false;
  if (data[3]!==0xca) return false;
  if (data[4]!==1) return false;
  if (data[6]!==0) return false;
  if (data[7]!==0) return false;
  return true;
}

/**
 * Read incoming bytes and add them to the result
 * @param {*} ctx - State machine context
 * @param {*} ev - Data event from WebUSBPlinky
 * @returns {*} - State machine context with data added to result
 */
function readBytes(ctx, ev) {
  // Incoming patch data is in the event
  const data = new Uint8Array(ev.data);
  ctx.result.push(data);
  ctx.processedBytes += data.byteLength;
  return ctx;
}

/**
 * Check if state machine should continue to process bytes
 * @param {*} ctx - State machine context
 * @returns {Boolean} - True if all bytes have been processed
 */
function hasNoMoreData(ctx) {
  return ctx.processedBytes >= ctx.bytesToProcess;
}

/**
 * Send a packet asking to load a patch from Plinky
 * @param {*} ctx - State machine context
 * @returns {Boolean} - True when sent
 */
async function sendLoadRequest(ctx) {
  console.log('sendLoadRequest', ctx.port, 'patchNumber', ctx.patchNumber);
  // [0xf3,0x0f,0xab,0xca,  0,   32,             0,0,0,0 ]
  //  header                get  current preset  padding ]
  const patchIndex = ctx.patchNumber - 1 // 1-indexed to 0-indexed
  const buf = new Uint8Array([0xf3,0x0f,0xab,0xca,0,patchIndex,0,0,0,0]);
  ctx.port.send(buf);
  return true;
}

/**
 * Loading state machine
 */
export const PatchLoadMachine = createMachine({
  idle: state(
    immediate('getHeader', action(sendLoadRequest)), // upon entering this machine, immediately send the patch load request
  ),
  getHeader: state(
    transition('data', 'header', guard(hasHeader)), // the next state guards that there is a header in the first data event coming from WebUSBPlinky
  ),
  header: state(
    immediate('read', reduce(processHeader)) // this reads the header and sets the parameters for the patch loading (how many bytes we need to read)
  ),
  read: state(
    immediate('finished', guard(hasNoMoreData)), // check if we have any more data, if not then go to the finished state
    transition('data', 'read', reduce(readBytes)), // otherwise transition back to the read state when receiving another data event from WebUSBPlinky
  ),
  finished: final()
}, (ctx) => ({ ...ctx }));

// ███████╗ █████╗ ██╗   ██╗███████╗    ██████╗  █████╗ ████████╗ ██████╗██╗  ██╗
// ██╔════╝██╔══██╗██║   ██║██╔════╝    ██╔══██╗██╔══██╗╚══██╔══╝██╔════╝██║  ██║
// ███████╗███████║██║   ██║█████╗      ██████╔╝███████║   ██║   ██║     ███████║
// ╚════██║██╔══██║╚██╗ ██╔╝██╔══╝      ██╔═══╝ ██╔══██║   ██║   ██║     ██╔══██║
// ███████║██║  ██║ ╚████╔╝ ███████╗    ██║     ██║  ██║   ██║   ╚██████╗██║  ██║
// ╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝    ╚═╝     ╚═╝  ╚═╝   ╚═╝    ╚═════╝╚═╝  ╚═╝
//
// The save patch machine is basically the same as the load machine, but
// in reverse. The first event is the write request (sendWriteRequest), after
// which we just send the necessary data over to Plinky.
//
// The machine loops over the necessary bytes like the load machine does, then
// transitions out.
//

/**
 * Send a header asking to write a patch to Plinky
 * @param {*} ctx - State machine context
 * @returns {Boolean} - True when sent
 */
async function sendWriteRequest(ctx) {
  console.log('sendWriteRequest', ctx.port, 'patchNumber', ctx.patchNumber);
  // [0xf3,0x0f,0xab,0xca,  1,   32,             0,0,0,0 ]
  //  header                set  current preset  padding ]
  //(header: 243,15,171,202,1,9,0,0,16,6)
  let arr = new ArrayBuffer(4); // an Int32 takes 4 bytes in Javascript. The ctx.bytesToProcess is an Int32.
  let view = new DataView(arr);
  view.setUint32(0, ctx.bytesToProcess, true);
  const len = new Uint8Array(arr);
  const patchIndex = ctx.patchNumber - 1 // 1-indexed to 0-indexed
  const buf = new Uint8Array([0xf3,0x0f,0xab,0xca,1,patchIndex,0,0,len[0],len[1]]);
  console.log('sending buffer', buf, "ctx.bytesToProcess", ctx.bytesToProcess, "len.byteLength", len.byteLength, "len", len);
  ctx.port.send(buf);
  return true;
}

/**
 * Send bytes to Plinky
 * @param {*} ctx - State machine context
 * @returns {*} - New state machine context
 */
async function sendBytes(ctx) {
  const start = ctx.currentIteration * USB_BUFFER_SIZE;
  const end = start + USB_BUFFER_SIZE;
  const data = ctx.data.slice(start, end);
  ctx.port.send(data);
  ctx.currentIteration++;
  ctx.processedBytes += data.byteLength;
  return ctx;
}

/**
 * Saving state machine
 */
export const PatchSaveMachine = createMachine({
  idle: state(
    immediate('setHeader', reduce(ctx => {
      const data = new Uint8Array(ctx.patch.buffer);
      const currentIteration = 0;
      return { ...ctx, processedBytes: 0, bytesToProcess: data.byteLength, data, currentIteration } 
    })),
  ),
  setHeader: state(
    immediate('write', action(sendWriteRequest))
  ),
  getDataFromPatch: state(
    immediate('write', reduce((ctx) => {
      return { ...ctx };
    }))
  ),
  write: state(
    immediate('finished', guard(hasNoMoreData)),
    immediate('getDataFromPatch', action(sendBytes)),
  ),
  finished: final()
}, (ctx) => ({ ...ctx }));

// ██╗      ██████╗  █████╗ ██████╗     ██████╗  █████╗ ███╗   ██╗██╗  ██╗
// ██║     ██╔═══██╗██╔══██╗██╔══██╗    ██╔══██╗██╔══██╗████╗  ██║██║ ██╔╝
// ██║     ██║   ██║███████║██║  ██║    ██████╔╝███████║██╔██╗ ██║█████╔╝ 
// ██║     ██║   ██║██╔══██║██║  ██║    ██╔══██╗██╔══██║██║╚██╗██║██╔═██╗ 
// ███████╗╚██████╔╝██║  ██║██████╔╝    ██████╔╝██║  ██║██║ ╚████║██║  ██╗
// ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝     ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝
//
// The raw approach: just invoke loadMachine 32 times.
// TODO: This needs fleshing out.
//

/**
 * Bank loading machine
 */
export const BankLoadMachine = createMachine({
  // 1. Initial state
  // Set the patch number to 0 and create an empty bank in this context.
  idle: state(
    immediate('sendHeader', reduce((ctx) => {
      ctx.patchNumber = 0;
      ctx.bank = [];
      return { ...ctx };
    })),
  ),
  // 2. Load state
  // Use the PatchLoadMachine to 
  sendHeader: state(
    immediate('getHeader', action(sendLoadRequest)),
  ),
  getHeader: state(
    transition('data', 'header', guard(hasHeader)),
  ),
  header: state(
    immediate('read', reduce(processHeader))
  ),
  read: state(
    immediate('finished', guard(hasNoMoreData)),
    transition('data', 'read', reduce(readBytes)),
  ),
  nextPatch: state(
    //immediate('finished', guard(hasNoMorePatches)),
    immediate('sendHeader', reduce((ctx) => {
      ctx.patchNumber = ctx.patchNumber + 1;
      return { ...ctx };
    })),
  ),
  finished: final()
}, (ctx) => ({ ...ctx }));
