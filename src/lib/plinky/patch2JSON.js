import { EParams, PlinkyParams } from './params';

function getParam(id) {
  return PlinkyParams.find(param => {
    return param.id === id;
  });
}

class Param {

  constructor(params) {
    Object.assign(this, params);
    this.mods = {
      get env() {
        return params.arr[1];
      },
      set env(val) {
        params.arr[1] = val;
      },
      get pressure() {
        return params.arr[2];
      },
      set pressure(val) {
        params.arr[2] = val;
      },
      get a() {
        return params.arr[3];
      },
      set a(val) {
        params.arr[3] = val;
      },
      get b() {
        return params.arr[4];
      },
      set b(val) {
        params.arr[4] = val;
      },
      get x() {
        return params.arr[5];
      },
      set x(val) {
        params.arr[5] = val;
      },
      get y() {
        return params.arr[6];
      },
      set y(val) {
        params.arr[6] = val;
      },
      get random() {
        return params.arr[7];
      },
      set random(val) {
        params.arr[7] = val;
      },
    };
  }

  // @TODO — these could apply scale etc according to min, max, etc from 
  //         PlinkyParam
  get value() {
    return this.arr[0]
  }
  set value(val) {
    this.arr[0] = val
  }

}


class Patch {

  constructor(patch) {
    this.buffer = patch;
    this.params = [];
    this.name = '';
    this.category = '';

    // each parameter has 16 bytes;
    // first 2 bytes are the value, then the 7 mod matrix amounts
    EParams.forEach((param, index) => {
      // We have 16 bytes that we're looking at
      const len = 16;
      // Index to start slicing at
      const idx = index * len;
      // We have 16 bytes in the ArrayBuffer that we want — create an Int16Array
      // over those bytes
      const arr = new Int16Array(patch, idx, len)
      const plinkyParam = getParam(param) || { name: param, id: param };
      this.params.push(new Param({
        ...plinkyParam,
        arr
      }));
    });

    // bitfield
    this.bitFieldUInt8 = new Uint8Array(patch, patch.byteLength - 16, 16)
    this.bitFieldInt8 = new Int8Array(patch, patch.byteLength - 16, 16)
  }

  // @TODO — i'm not quite sure I understand what the setters for these should 
  //         look like yet
  get arp() { return (this.bitFieldUInt8[0] & 1) > 0; }
  get latch() { return (this.bitFieldUInt8[0] & 2) > 0; }
  get loopStart() { return this.bitFieldInt8[1]; }
  get loopLength() { return this.bitFieldInt8[2]; }

  updateBuffer(patch) {
    // @todo - blat `patch` over the contents of this.buffer without reassigning this.buffer. 
  }
  
  setData(data, byteOffset) {
    // @todo - blat this data over the relevant bit of this.buffer
  }
  
}

export function patch2JSON(patch) {

  return new Patch(patch)

  /*
  let patchJSON = {
    buffer: patch,
    arp: false,
    latch: false,
    loopStart: 0,
    loopLength: 8,
    params: [],
  };
  // each parameter has 16 bytes;
  // first 2 bytes are the value, then the 7 mod matrix amounts
  EParams.forEach((param, index) => {
    // We have 16 bytes that we're looking at
    const len = 16;
    // Index to start slicing at
    const idx = index * len;
    // We have 16 bytes in the ArrayBuffer that we want
    const buf = patch.slice(idx, len * index + len);

    //console.log(param, len, idx, "BUF", buf, arr);
    const plinkyParam = getParam(param) || { name: param, id: param };
    patchJSON.params.push(new Param({
      ...plinkyParam,
      buffer: buf
    }));
  });

  //
  // Go through the bitfield in the last 16 bytes to set flags
  //
  // u8 flags;
  // - if flags & 1 is true, then arp is on
  // - if flags & 2 is true, then latch is on
  // s8 loopstart_step_no_offset;
  // - 0-63 which step the pattern starts on in the current pattern (normally 0)
  // s8 looplen_step;
  // - how long the pattern is, (normally 8)
  // u8 paddy[16-3];
  // - reserved for future use
  //

  const field = patch.slice(patch.byteLength - 16, patch.byteLength);
  patchJSON.arp = (new Uint8Array(field)[0] & 1) > 0;
  patchJSON.latch = (new Uint8Array(field)[0] & 2) > 0;
  patchJSON.loopStart = new Int8Array(field)[1];
  patchJSON.loopLength = new Int8Array(field)[2];

  console.log('bitfield', field, patchJSON);

  return patchJSON;
  */
}