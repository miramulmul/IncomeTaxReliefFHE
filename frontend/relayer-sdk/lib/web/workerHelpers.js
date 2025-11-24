/*
 * Copyright 2022 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Note: we use `wasm_bindgen_worker_`-prefixed message types to make sure
// we can handle bundling into other files, which might happen to have their
// own `postMessage`/`onmessage` communication channels.
//
// If we didn't take that into the account, we could send much simpler signals
// like just `0` or whatever, but the code would be less resilient.

function waitForMsgType(target, type) {
  return new Promise(resolve => {
    target.addEventListener('message', function onMsg({ data }) {
      if (data?.type !== type) return;
      target.removeEventListener('message', onMsg);
      resolve(data);
    });
  });
}

waitForMsgType(self, 'wasm_bindgen_worker_init').then(async ({ init, receiver }) => {
  // # Note 1
  // Our JS should have been generated in
  // `[out-dir]/snippets/wasm-bindgen-rayon-[hash]/workerHelpers.js`,
  // resolve the main module via `../../..`.
  //
  // This might need updating if the generated structure changes on wasm-bindgen
  // side ever in the future, but works well with bundlers today. The whole
  // point of this crate, after all, is to abstract away unstable features
  // and temporary bugs so that you don't need to deal with them in your code.
  //
  // # Note 2
  // This could be a regular import, but then some bundlers complain about
  // circular deps.
  //
  // Dynamic import could be cheap if this file was inlined into the parent,
  // which would require us just using `../../..` in `new Worker` below,
  // but that doesn't work because wasm-pack unconditionally adds
  // "sideEffects":false (see below).
  //
  // OTOH, even though it can't be inlined, it should be still reasonably
  // cheap since the requested file is already in cache (it was loaded by
  // the main thread).
  const pkg = await Promise.resolve().then(function () { return tfhe; });
  await pkg.default(init);
  postMessage({ type: 'wasm_bindgen_worker_ready' });
  pkg.wbg_rayon_start_worker(receiver);
});

async function startWorkers(module, memory, builder) {
  if (builder.numThreads() === 0) {
    throw new Error(`num_threads must be > 0.`);
  }

  const workerInit = {
    type: 'wasm_bindgen_worker_init',
    init: { module_or_path: module, memory },
    receiver: builder.receiver()
  };

  await Promise.all(
    Array.from({ length: builder.numThreads() }, async () => {
      // Self-spawn into a new Worker.
      //
      // TODO: while `new URL('...', import.meta.url) becomes a semi-standard
      // way to get asset URLs relative to the module across various bundlers
      // and browser, ideally we should switch to `import.meta.resolve`
      // once it becomes a standard.
      //
      // Note: we could use `../../..` as the URL here to inline workerHelpers.js
      // into the parent entry instead of creating another split point -
      // this would be preferable from optimization perspective -
      // however, Webpack then eliminates all message handler code
      // because wasm-pack produces "sideEffects":false in package.json
      // unconditionally.
      //
      // The only way to work around that is to have side effect code
      // in an entry point such as Worker file itself.
      const worker = new Worker(new URL("workerHelpers.js", import.meta.url), {
        type: 'module'
      });
      worker.postMessage(workerInit);
      await waitForMsgType(worker, 'wasm_bindgen_worker_ready');
      return worker;
    })
  );
  builder.build();
}

let wasm;

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_export_2.set(idx, obj);
    return idx;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); }
let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.buffer !== wasm.memory.buffer) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().slice(ptr, ptr + len));
}

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available') } } );

const encodeString = function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
};

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer !== wasm.memory.buffer) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

/**
 * @param {number} receiver
 */
function wbg_rayon_start_worker(receiver) {
    wasm.wbg_rayon_start_worker(receiver);
}

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_boolean_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_booleanciphertext_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_booleanclientkey_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_booleancompressedciphertext_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_booleancompressedserverkey_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_booleannoisedistribution_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_booleanparameters_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_booleanpublickey_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compactciphertextlist_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compactciphertextlistbuilder_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compactciphertextlistexpander_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compactpkecrs_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfhebool_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint10_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint1024_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint104_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint112_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint12_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint120_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint128_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint136_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint14_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint144_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint152_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint16_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint160_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint168_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint176_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint184_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint192_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint2_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint200_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint2048_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint208_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint216_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint224_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint232_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint24_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint240_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint248_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint256_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint32_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint4_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint40_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint48_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint512_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint56_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint6_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint64_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint72_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint8_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint80_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint88_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheint96_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint10_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint1024_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint104_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint112_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint12_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint120_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint128_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint136_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint14_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint144_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint152_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint16_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint160_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint168_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint176_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint184_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint192_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint2_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint200_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint2048_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint208_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint216_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint224_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint232_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint24_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint240_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint248_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint256_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint32_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint4_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint40_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint48_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint512_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint56_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint6_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint64_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint72_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint8_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint80_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint88_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_compressedfheuint96_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fhebool_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint10_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint1024_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint104_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint112_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint12_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint120_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint128_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint136_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint14_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint144_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint152_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint16_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint160_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint168_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint176_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint184_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint192_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint2_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint200_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint2048_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint208_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint216_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint224_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint232_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint24_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint240_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint248_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint256_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint32_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint4_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint40_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint48_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint512_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint56_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint6_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint64_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint72_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint8_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint80_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint88_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheint96_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint10_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint1024_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint104_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint112_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint12_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint120_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint128_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint136_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint14_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint144_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint152_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint16_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint160_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint168_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint176_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint184_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint192_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint2_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint200_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint2048_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint208_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint216_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint224_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint232_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint24_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint240_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint248_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint256_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint32_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint4_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint40_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint48_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint512_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint56_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint6_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint64_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint72_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint8_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint80_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint88_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_fheuint96_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_provencompactciphertextlist_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_shortint_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_shortintciphertext_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_shortintclientkey_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_shortintcompactpublickeyencryptionparameters_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_shortintcompressedciphertext_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_shortintcompressedpublickey_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_shortintcompressedserverkey_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_shortintnoisedistribution_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_shortintparameters_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_shortintpublickey_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_tfheclientkey_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_tfhecompactpublickey_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_tfhecompressedcompactpublickey_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_tfhecompressedpublickey_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_tfhecompressedserverkey_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_tfheconfig_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_tfheconfigbuilder_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_tfhepublickey_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_tfheserverkey_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_tfhe_free(ptr >>> 0, 1));

const wbg_rayon_PoolBuilderFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wbg_rayon_poolbuilder_free(ptr >>> 0, 1));

class wbg_rayon_PoolBuilder {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(wbg_rayon_PoolBuilder.prototype);
        obj.__wbg_ptr = ptr;
        wbg_rayon_PoolBuilderFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        wbg_rayon_PoolBuilderFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wbg_rayon_poolbuilder_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    numThreads() {
        const ret = wasm.wbg_rayon_poolbuilder_numThreads(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    receiver() {
        const ret = wasm.wbg_rayon_poolbuilder_receiver(this.__wbg_ptr);
        return ret >>> 0;
    }
    build() {
        wasm.wbg_rayon_poolbuilder_build(this.__wbg_ptr);
    }
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_BigInt_470dd987b8190f8e = function(arg0) {
        const ret = BigInt(arg0);
        return ret;
    };
    imports.wbg.__wbg_BigInt_ddea6d2f55558acb = function() { return handleError(function (arg0) {
        const ret = BigInt(arg0);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_buffer_609cc3eee51ed158 = function(arg0) {
        const ret = arg0.buffer;
        return ret;
    };
    imports.wbg.__wbg_call_672a4d21634d4a24 = function() { return handleError(function (arg0, arg1) {
        const ret = arg0.call(arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_call_7cccdd69e0791ae2 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = arg0.call(arg1, arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_crypto_574e78ad8b13b65f = function(arg0) {
        const ret = arg0.crypto;
        return ret;
    };
    imports.wbg.__wbg_error_7534b8e9a36f1ab4 = function(arg0, arg1) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg0;
            deferred0_1 = arg1;
            console.error(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_getRandomValues_b8f5dbd5f3995a9e = function() { return handleError(function (arg0, arg1) {
        arg0.getRandomValues(arg1);
    }, arguments) };
    imports.wbg.__wbg_getTime_46267b1c24877e30 = function(arg0) {
        const ret = arg0.getTime();
        return ret;
    };
    imports.wbg.__wbg_instanceof_Window_def73ea0955fc569 = function(arg0) {
        let result;
        try {
            result = arg0 instanceof Window;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_msCrypto_a61aeb35a24c1329 = function(arg0) {
        const ret = arg0.msCrypto;
        return ret;
    };
    imports.wbg.__wbg_new0_f788a2397c7ca929 = function() {
        const ret = new Date();
        return ret;
    };
    imports.wbg.__wbg_new_8a6f238a6ece86ea = function() {
        const ret = new Error();
        return ret;
    };
    imports.wbg.__wbg_new_a12002a7f91c75be = function(arg0) {
        const ret = new Uint8Array(arg0);
        return ret;
    };
    imports.wbg.__wbg_newnoargs_105ed471475aaf50 = function(arg0, arg1) {
        const ret = new Function(getStringFromWasm0(arg0, arg1));
        return ret;
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_d97e637ebe145a9a = function(arg0, arg1, arg2) {
        const ret = new Uint8Array(arg0, arg1 >>> 0, arg2 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_newwithlength_a381634e90c276d4 = function(arg0) {
        const ret = new Uint8Array(arg0 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_node_905d3e251edff8a2 = function(arg0) {
        const ret = arg0.node;
        return ret;
    };
    imports.wbg.__wbg_process_dc0fbacc7c1c06f7 = function(arg0) {
        const ret = arg0.process;
        return ret;
    };
    imports.wbg.__wbg_randomFillSync_ac0988aba3254290 = function() { return handleError(function (arg0, arg1) {
        arg0.randomFillSync(arg1);
    }, arguments) };
    imports.wbg.__wbg_require_60cc747a6bc5215a = function() { return handleError(function () {
        const ret = module.require;
        return ret;
    }, arguments) };
    imports.wbg.__wbg_set_65595bdd868b3009 = function(arg0, arg1, arg2) {
        arg0.set(arg1, arg2 >>> 0);
    };
    imports.wbg.__wbg_stack_0ed75d68575b0f3c = function(arg0, arg1) {
        const ret = arg1.stack;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_startWorkers_2ca11761e08ff5d5 = function(arg0, arg1, arg2) {
        const ret = startWorkers(arg0, arg1, wbg_rayon_PoolBuilder.__wrap(arg2));
        return ret;
    };
    imports.wbg.__wbg_static_accessor_GLOBAL_88a902d13a557d07 = function() {
        const ret = typeof global === 'undefined' ? null : global;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_static_accessor_GLOBAL_THIS_56578be7e9f832b0 = function() {
        const ret = typeof globalThis === 'undefined' ? null : globalThis;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_static_accessor_SELF_37c5d418e4bf5819 = function() {
        const ret = typeof self === 'undefined' ? null : self;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_static_accessor_WINDOW_5de37043a91a9c40 = function() {
        const ret = typeof window === 'undefined' ? null : window;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_subarray_aa9065fa9dc5df96 = function(arg0, arg1, arg2) {
        const ret = arg0.subarray(arg1 >>> 0, arg2 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_toString_2f76f493957b63da = function(arg0, arg1, arg2) {
        const ret = arg1.toString(arg2);
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_toString_c813bbd34d063839 = function(arg0) {
        const ret = arg0.toString();
        return ret;
    };
    imports.wbg.__wbg_versions_c01dfd4722a88165 = function(arg0) {
        const ret = arg0.versions;
        return ret;
    };
    imports.wbg.__wbindgen_bigint_from_i128 = function(arg0, arg1) {
        const ret = arg0 << BigInt(64) | BigInt.asUintN(64, arg1);
        return ret;
    };
    imports.wbg.__wbindgen_bigint_from_i64 = function(arg0) {
        const ret = arg0;
        return ret;
    };
    imports.wbg.__wbindgen_bigint_from_u128 = function(arg0, arg1) {
        const ret = BigInt.asUintN(64, arg0) << BigInt(64) | BigInt.asUintN(64, arg1);
        return ret;
    };
    imports.wbg.__wbindgen_bigint_from_u64 = function(arg0) {
        const ret = BigInt.asUintN(64, arg0);
        return ret;
    };
    imports.wbg.__wbindgen_bigint_get_as_i64 = function(arg0, arg1) {
        const v = arg1;
        const ret = typeof(v) === 'bigint' ? v : undefined;
        getDataViewMemory0().setBigInt64(arg0 + 8 * 1, isLikeNone(ret) ? BigInt(0) : ret, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
    };
    imports.wbg.__wbindgen_bit_and = function(arg0, arg1) {
        const ret = arg0 & arg1;
        return ret;
    };
    imports.wbg.__wbindgen_bit_or = function(arg0, arg1) {
        const ret = arg0 | arg1;
        return ret;
    };
    imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
        const ret = debugString(arg1);
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbindgen_error_new = function(arg0, arg1) {
        const ret = new Error(getStringFromWasm0(arg0, arg1));
        return ret;
    };
    imports.wbg.__wbindgen_init_externref_table = function() {
        const table = wasm.__wbindgen_export_2;
        const offset = table.grow(4);
        table.set(0, undefined);
        table.set(offset + 0, undefined);
        table.set(offset + 1, null);
        table.set(offset + 2, true);
        table.set(offset + 3, false);
    };
    imports.wbg.__wbindgen_is_function = function(arg0) {
        const ret = typeof(arg0) === 'function';
        return ret;
    };
    imports.wbg.__wbindgen_is_object = function(arg0) {
        const val = arg0;
        const ret = typeof(val) === 'object' && val !== null;
        return ret;
    };
    imports.wbg.__wbindgen_is_string = function(arg0) {
        const ret = typeof(arg0) === 'string';
        return ret;
    };
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        const ret = arg0 === undefined;
        return ret;
    };
    imports.wbg.__wbindgen_jsval_eq = function(arg0, arg1) {
        const ret = arg0 === arg1;
        return ret;
    };
    imports.wbg.__wbindgen_lt = function(arg0, arg1) {
        const ret = arg0 < arg1;
        return ret;
    };
    imports.wbg.__wbindgen_memory = function() {
        const ret = wasm.memory;
        return ret;
    };
    imports.wbg.__wbindgen_module = function() {
        const ret = __wbg_init.__wbindgen_wasm_module;
        return ret;
    };
    imports.wbg.__wbindgen_neg = function(arg0) {
        const ret = -arg0;
        return ret;
    };
    imports.wbg.__wbindgen_number_new = function(arg0) {
        const ret = arg0;
        return ret;
    };
    imports.wbg.__wbindgen_shl = function(arg0, arg1) {
        const ret = arg0 << arg1;
        return ret;
    };
    imports.wbg.__wbindgen_shr = function(arg0, arg1) {
        const ret = arg0 >> arg1;
        return ret;
    };
    imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
        const obj = arg1;
        const ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };

    return imports;
}

function __wbg_init_memory(imports, memory) {
    imports.wbg.memory = memory || new WebAssembly.Memory({initial:21,maximum:16384,shared:true});
}

function __wbg_finalize_init(instance, module, thread_stack_size) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedDataViewMemory0 = null;
    cachedUint8ArrayMemory0 = null;

    if (typeof thread_stack_size !== 'undefined' && (typeof thread_stack_size !== 'number' || thread_stack_size === 0 || thread_stack_size % 65536 !== 0)) { throw 'invalid stack size' }
    wasm.__wbindgen_start(thread_stack_size);
    return wasm;
}

async function __wbg_init(module_or_path, memory) {
    if (wasm !== undefined) return wasm;

    let thread_stack_size;
    if (typeof module_or_path !== 'undefined') {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path, memory, thread_stack_size} = module_or_path);
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead');
        }
    }

    if (typeof module_or_path === 'undefined') {
        module_or_path = new URL('tfhe_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    __wbg_init_memory(imports, memory);

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module, thread_stack_size);
}

var tfhe = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: __wbg_init,
  wbg_rayon_PoolBuilder: wbg_rayon_PoolBuilder,
  wbg_rayon_start_worker: wbg_rayon_start_worker
});

export { startWorkers };
