import { EParams, PlinkyParams, PatchCategories } from './params';
import { paramIconMap } from './param-icons.js'
import { formatValue } from '../utils.js'

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
  
  get displayValue() {
    let activeOption = this.getActiveSelectOption();
    if (activeOption) return activeOption.label;
    
    let suffix = "%"; // todo -- which params have me?
    return formatValue(this.value) + suffix;
  }
  
  getActiveSelectOption () {
    let values = this.getSelectOptions()
    if (!values) return null
    
    const width = 1024 / values.length
    
    let i = Math.floor(this.value / width)
    if (i >= values.length) i = values.length - 1 // guard overflow in the top half of the top bucket
    return  values[i]
  }
  
  get icon () {
    return paramIconMap[this.id]
  }
  
  getSelectOptions () {

    if (this.enum_name) {
      
      const length = this.enum_name.length
      const values = this
        .enum_name
        .map(
          (entry, i) => ({ 
            label: entry, 
            value: Math.floor(i * (1024 / length) + (1024 / length * 0.5)) 
          })
        )
      return values
    } else {
      return null
    }

  }

}


export class Patch {

  constructor(patch) {
    this.buffer = patch;
    this.params = [];

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
  
  get category () {
    const categoryArray = new Uint8Array(this.buffer, 1543, 1);
    return categoryArray[0];
  }
  
  set category (i) {
    if (i < 0) i = 0;
    const categoryArray = new Uint8Array(this.buffer, 1543, 1);
    categoryArray[0] = i;
  }
  
  get name () {
    const nameArray = new Uint8Array(this.buffer, 1544, 8);
    let str = "";
    nameArray.forEach(a => { 
      if (a == 0) return;
      str += String.fromCharCode(a);
    })
    return str;
  }
  
  set name (str) {
    const nameArray = new Uint8Array(this.buffer, 1544, 8);
    let i = 0;
    while (i < 8) {
      let charCode = str.charCodeAt(i);
      if (isNaN(charCode)) charCode = 0;
      nameArray[i] = charCode;
      i++;
    }
  }

  /**
   * # Replace the entire contents of the patch's underlying buffer
   * 
   */ 
  updateBuffer(patch) {
    // @todo - blat `patch` over the contents of this.buffer without reassigning this.buffer. 
  }
  
  setData(data, byteOffset) {
    // @todo - blat this data over the relevant bit of this.buffer
  }
  
}