import { JsonRpcProvider, BrowserProvider, Contract, getAddress as getAddress$2, ethers, isAddress, AbiCoder } from 'ethers';
import createHash from 'keccak';
import fetchRetry from 'fetch-retry';
import { threads } from 'wasm-feature-detect';

var global$1 = (typeof global !== "undefined" ? global :
  typeof self !== "undefined" ? self :
  typeof window !== "undefined" ? window : {});

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
      const worker = new Worker(new URL('./workerHelpers.js', import.meta.url), {
        type: 'module'
      });
      worker.postMessage(workerInit);
      await waitForMsgType(worker, 'wasm_bindgen_worker_ready');
      return worker;
    })
  );
  builder.build();
}

let wasm$1;

function addToExternrefTable0$1(obj) {
    const idx = wasm$1.__externref_table_alloc();
    wasm$1.__wbindgen_export_2.set(idx, obj);
    return idx;
}

function handleError$1(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0$1(e);
        wasm$1.__wbindgen_exn_store(idx);
    }
}

const cachedTextDecoder$1 = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder$1.decode(); }
let cachedUint8ArrayMemory0$1 = null;

function getUint8ArrayMemory0$1() {
    if (cachedUint8ArrayMemory0$1 === null || cachedUint8ArrayMemory0$1.buffer !== wasm$1.memory.buffer) {
        cachedUint8ArrayMemory0$1 = new Uint8Array(wasm$1.memory.buffer);
    }
    return cachedUint8ArrayMemory0$1;
}

function getStringFromWasm0$1(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder$1.decode(getUint8ArrayMemory0$1().slice(ptr, ptr + len));
}

let WASM_VECTOR_LEN$1 = 0;

const cachedTextEncoder$1 = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available') } } );

const encodeString$1 = function (arg, view) {
    const buf = cachedTextEncoder$1.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
};

function passStringToWasm0$1(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder$1.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0$1().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN$1 = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0$1();

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
        const view = getUint8ArrayMemory0$1().subarray(ptr + offset, ptr + len);
        const ret = encodeString$1(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN$1 = offset;
    return ptr;
}

let cachedDataViewMemory0$1 = null;

function getDataViewMemory0$1() {
    if (cachedDataViewMemory0$1 === null || cachedDataViewMemory0$1.buffer !== wasm$1.memory.buffer) {
        cachedDataViewMemory0$1 = new DataView(wasm$1.memory.buffer);
    }
    return cachedDataViewMemory0$1;
}

function isLikeNone$1(x) {
    return x === undefined || x === null;
}

function debugString$1(val) {
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
            debug += debugString$1(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString$1(val[i]);
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

function _assertClass$1(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
}

function takeFromExternrefTable0$1(idx) {
    const value = wasm$1.__wbindgen_export_2.get(idx);
    wasm$1.__externref_table_dealloc(idx);
    return value;
}

function getArrayU8FromWasm0$1(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0$1().subarray(ptr / 1, ptr / 1 + len);
}

function passArray8ToWasm0$1(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0$1().set(arg, ptr / 1);
    WASM_VECTOR_LEN$1 = arg.length;
    return ptr;
}

function init_panic_hook() {
    wasm$1.init_panic_hook();
}

/**
 * @param {number} num_threads
 * @returns {Promise<any>}
 */
function initThreadPool(num_threads) {
    const ret = wasm$1.initThreadPool(num_threads);
    return ret;
}

/**
 * @param {number} receiver
 */
function wbg_rayon_start_worker(receiver) {
    wasm$1.wbg_rayon_start_worker(receiver);
}
/**
 * @enum {0 | 1}
 */
const ZkComputeLoad = Object.freeze({
    Proof: 0, "0": "Proof",
    Verify: 1, "1": "Verify",
});

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_boolean_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_booleanciphertext_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_booleanclientkey_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_booleancompressedciphertext_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_booleancompressedserverkey_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_booleannoisedistribution_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_booleanparameters_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_booleanpublickey_free(ptr >>> 0, 1));

const CompactCiphertextListFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compactciphertextlist_free(ptr >>> 0, 1));

class CompactCiphertextList {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(CompactCiphertextList.prototype);
        obj.__wbg_ptr = ptr;
        CompactCiphertextListFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CompactCiphertextListFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_compactciphertextlist_free(ptr, 0);
    }
    /**
     * @param {TfheCompactPublicKey} public_key
     * @returns {CompactCiphertextListBuilder}
     */
    static builder(public_key) {
        _assertClass$1(public_key, TfheCompactPublicKey);
        const ret = wasm$1.compactciphertextlist_builder(public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return CompactCiphertextListBuilder.__wrap(ret[0]);
    }
    /**
     * @returns {number}
     */
    len() {
        const ret = wasm$1.compactciphertextlist_len(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {boolean}
     */
    is_empty() {
        const ret = wasm$1.compactciphertextlist_is_empty(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {number} index
     * @returns {FheTypes | undefined}
     */
    get_kind_of(index) {
        const ret = wasm$1.compactciphertextlist_get_kind_of(this.__wbg_ptr, index);
        return ret === 84 ? undefined : ret;
    }
    /**
     * @returns {CompactCiphertextListExpander}
     */
    expand() {
        const ret = wasm$1.compactciphertextlist_expand(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return CompactCiphertextListExpander.__wrap(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.compactciphertextlist_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {CompactCiphertextList}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.compactciphertextlist_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return CompactCiphertextList.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.compactciphertextlist_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {CompactCiphertextList}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.compactciphertextlist_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return CompactCiphertextList.__wrap(ret[0]);
    }
}

const CompactCiphertextListBuilderFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compactciphertextlistbuilder_free(ptr >>> 0, 1));

class CompactCiphertextListBuilder {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(CompactCiphertextListBuilder.prototype);
        obj.__wbg_ptr = ptr;
        CompactCiphertextListBuilderFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CompactCiphertextListBuilderFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_compactciphertextlistbuilder_free(ptr, 0);
    }
    /**
     * @param {number} value
     */
    push_u24(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u24(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {bigint} value
     */
    push_u40(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u40(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {bigint} value
     */
    push_u48(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u48(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {bigint} value
     */
    push_u56(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u56(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {number} value
     */
    push_u2(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u2(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {number} value
     */
    push_u4(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u4(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {number} value
     */
    push_u6(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u6(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {number} value
     */
    push_u8(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u8(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {number} value
     */
    push_u10(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u10(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {number} value
     */
    push_u12(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u12(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {number} value
     */
    push_u14(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u14(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {number} value
     */
    push_u16(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u16(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {number} value
     */
    push_u32(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u32(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {bigint} value
     */
    push_u64(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u64(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {number} value
     */
    push_i24(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i24(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {bigint} value
     */
    push_i40(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i40(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {bigint} value
     */
    push_i48(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i48(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {bigint} value
     */
    push_i56(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i56(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {number} value
     */
    push_i2(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i2(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {number} value
     */
    push_i4(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i4(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {number} value
     */
    push_i6(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i6(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {number} value
     */
    push_i8(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i8(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {number} value
     */
    push_i10(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i10(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {number} value
     */
    push_i12(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i12(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {number} value
     */
    push_i14(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i14(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {number} value
     */
    push_i16(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i16(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {number} value
     */
    push_i32(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i32(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {bigint} value
     */
    push_i64(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i64(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_u128(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u128(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_u160(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u160(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_u256(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u256(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_u512(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u512(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_u1024(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u1024(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_u2048(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u2048(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_i128(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i128(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_i160(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i160(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_i256(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i256(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_i512(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i512(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_i1024(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i1024(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_i2048(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i2048(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {boolean} value
     */
    push_boolean(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_boolean(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @returns {CompactCiphertextList}
     */
    build() {
        const ret = wasm$1.compactciphertextlistbuilder_build(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return CompactCiphertextList.__wrap(ret[0]);
    }
    /**
     * @returns {CompactCiphertextList}
     */
    build_packed() {
        const ret = wasm$1.compactciphertextlistbuilder_build_packed(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return CompactCiphertextList.__wrap(ret[0]);
    }
    /**
     * @param {CompactPkeCrs} crs
     * @param {Uint8Array} metadata
     * @param {ZkComputeLoad} compute_load
     * @returns {ProvenCompactCiphertextList}
     */
    build_with_proof_packed(crs, metadata, compute_load) {
        _assertClass$1(crs, CompactPkeCrs);
        const ptr0 = passArray8ToWasm0$1(metadata, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.compactciphertextlistbuilder_build_with_proof_packed(this.__wbg_ptr, crs.__wbg_ptr, ptr0, len0, compute_load);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return ProvenCompactCiphertextList.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     */
    push_u72(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u72(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_u80(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u80(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_u88(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u88(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_u96(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u96(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_u104(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u104(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_u112(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u112(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_u120(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u120(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_u136(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u136(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_u144(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u144(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_u152(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u152(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_u168(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u168(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_u176(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u176(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_u184(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u184(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_u192(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u192(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_u200(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u200(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_u208(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u208(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_u216(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u216(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_u224(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u224(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_u232(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u232(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_u240(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u240(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_u248(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_u248(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_i72(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i72(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_i80(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i80(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_i88(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i88(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_i96(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i96(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_i104(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i104(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_i112(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i112(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_i120(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i120(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_i136(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i136(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_i144(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i144(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_i152(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i152(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_i168(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i168(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_i176(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i176(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_i184(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i184(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_i192(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i192(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_i200(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i200(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_i208(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i208(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_i216(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i216(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_i224(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i224(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_i232(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i232(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_i240(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i240(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
    /**
     * @param {any} value
     */
    push_i248(value) {
        const ret = wasm$1.compactciphertextlistbuilder_push_i248(this.__wbg_ptr, value);
        if (ret[1]) {
            throw takeFromExternrefTable0$1(ret[0]);
        }
    }
}

const CompactCiphertextListExpanderFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compactciphertextlistexpander_free(ptr >>> 0, 1));

class CompactCiphertextListExpander {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(CompactCiphertextListExpander.prototype);
        obj.__wbg_ptr = ptr;
        CompactCiphertextListExpanderFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CompactCiphertextListExpanderFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_compactciphertextlistexpander_free(ptr, 0);
    }
    /**
     * @param {number} index
     * @returns {FheUint24}
     */
    get_uint24(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint24(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint24.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint40}
     */
    get_uint40(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint40(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint40.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint48}
     */
    get_uint48(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint48(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint48.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint56}
     */
    get_uint56(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint56(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint56.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint72}
     */
    get_uint72(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint72(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint72.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint80}
     */
    get_uint80(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint80(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint80.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint88}
     */
    get_uint88(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint88(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint88.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint96}
     */
    get_uint96(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint96(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint96.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint104}
     */
    get_uint104(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint104(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint104.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint112}
     */
    get_uint112(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint112(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint112.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint120}
     */
    get_uint120(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint120(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint120.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint136}
     */
    get_uint136(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint136(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint136.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint144}
     */
    get_uint144(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint144(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint144.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint152}
     */
    get_uint152(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint152(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint152.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint168}
     */
    get_uint168(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint168(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint168.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint176}
     */
    get_uint176(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint176(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint176.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint184}
     */
    get_uint184(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint184(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint184.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint192}
     */
    get_uint192(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint192(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint192.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint200}
     */
    get_uint200(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint200(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint200.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint208}
     */
    get_uint208(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint208(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint208.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint216}
     */
    get_uint216(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint216(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint216.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint224}
     */
    get_uint224(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint224(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint224.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint232}
     */
    get_uint232(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint232(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint232.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint240}
     */
    get_uint240(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint240(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint240.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint248}
     */
    get_uint248(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint248(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint248.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint256}
     */
    get_uint256(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint256(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint256.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint2}
     */
    get_uint2(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint2(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint2.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint4}
     */
    get_uint4(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint4(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint4.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint6}
     */
    get_uint6(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint6(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint6.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint8}
     */
    get_uint8(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint8(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint8.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint10}
     */
    get_uint10(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint10(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint10.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint12}
     */
    get_uint12(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint12(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint12.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint14}
     */
    get_uint14(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint14(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint14.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint16}
     */
    get_uint16(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint16(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint16.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint32}
     */
    get_uint32(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint32(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint32.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint64}
     */
    get_uint64(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint64(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint64.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint128}
     */
    get_uint128(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint128(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint128.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint160}
     */
    get_uint160(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint160(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint160.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint512}
     */
    get_uint512(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint512(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint512.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint1024}
     */
    get_uint1024(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint1024(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint1024.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheUint2048}
     */
    get_uint2048(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_uint2048(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint2048.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt24}
     */
    get_int24(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int24(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt24.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt40}
     */
    get_int40(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int40(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt40.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt48}
     */
    get_int48(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int48(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt48.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt56}
     */
    get_int56(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int56(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt56.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt72}
     */
    get_int72(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int72(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt72.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt80}
     */
    get_int80(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int80(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt80.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt88}
     */
    get_int88(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int88(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt88.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt96}
     */
    get_int96(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int96(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt96.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt104}
     */
    get_int104(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int104(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt104.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt112}
     */
    get_int112(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int112(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt112.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt120}
     */
    get_int120(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int120(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt120.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt136}
     */
    get_int136(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int136(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt136.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt144}
     */
    get_int144(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int144(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt144.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt152}
     */
    get_int152(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int152(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt152.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt168}
     */
    get_int168(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int168(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt168.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt176}
     */
    get_int176(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int176(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt176.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt184}
     */
    get_int184(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int184(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt184.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt192}
     */
    get_int192(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int192(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt192.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt200}
     */
    get_int200(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int200(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt200.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt208}
     */
    get_int208(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int208(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt208.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt216}
     */
    get_int216(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int216(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt216.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt224}
     */
    get_int224(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int224(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt224.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt232}
     */
    get_int232(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int232(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt232.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt240}
     */
    get_int240(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int240(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt240.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt248}
     */
    get_int248(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int248(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt248.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt2}
     */
    get_int2(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int2(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt2.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt4}
     */
    get_int4(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int4(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt4.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt6}
     */
    get_int6(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int6(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt6.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt8}
     */
    get_int8(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int8(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt8.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt10}
     */
    get_int10(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int10(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt10.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt12}
     */
    get_int12(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int12(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt12.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt14}
     */
    get_int14(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int14(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt14.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt16}
     */
    get_int16(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int16(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt16.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt32}
     */
    get_int32(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int32(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt32.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt64}
     */
    get_int64(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int64(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt64.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt128}
     */
    get_int128(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int128(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt128.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt160}
     */
    get_int160(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int160(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt160.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt256}
     */
    get_int256(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int256(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt256.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt512}
     */
    get_int512(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int512(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt512.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt1024}
     */
    get_int1024(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int1024(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt1024.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheInt2048}
     */
    get_int2048(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_int2048(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt2048.__wrap(ret[0]);
    }
    /**
     * @param {number} index
     * @returns {FheBool}
     */
    get_bool(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_bool(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheBool.__wrap(ret[0]);
    }
    /**
     * @returns {number}
     */
    len() {
        const ret = wasm$1.compactciphertextlistexpander_len(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {boolean}
     */
    is_empty() {
        const ret = wasm$1.compactciphertextlistexpander_is_empty(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {number} index
     * @returns {FheTypes | undefined}
     */
    get_kind_of(index) {
        const ret = wasm$1.compactciphertextlistexpander_get_kind_of(this.__wbg_ptr, index);
        return ret === 84 ? undefined : ret;
    }
}

const CompactPkeCrsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compactpkecrs_free(ptr >>> 0, 1));

class CompactPkeCrs {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(CompactPkeCrs.prototype);
        obj.__wbg_ptr = ptr;
        CompactPkeCrsFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CompactPkeCrsFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_compactpkecrs_free(ptr, 0);
    }
    /**
     * @param {boolean} compress
     * @returns {Uint8Array}
     */
    serialize(compress) {
        const ret = wasm$1.compactpkecrs_serialize(this.__wbg_ptr, compress);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {CompactPkeCrs}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.compactpkecrs_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return CompactPkeCrs.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.compactpkecrs_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {CompactPkeCrs}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.compactpkecrs_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return CompactPkeCrs.__wrap(ret[0]);
    }
    /**
     * @param {TfheConfig} config
     * @param {number} max_num_bits
     * @returns {CompactPkeCrs}
     */
    static from_config(config, max_num_bits) {
        _assertClass$1(config, TfheConfig);
        const ret = wasm$1.compactpkecrs_from_config(config.__wbg_ptr, max_num_bits);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return CompactPkeCrs.__wrap(ret[0]);
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {CompactPkeCrs}
     */
    static deserialize_from_public_params(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.compactpkecrs_deserialize_from_public_params(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return CompactPkeCrs.__wrap(ret[0]);
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {CompactPkeCrs}
     */
    static safe_deserialize_from_public_params(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.compactpkecrs_safe_deserialize_from_public_params(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return CompactPkeCrs.__wrap(ret[0]);
    }
}

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfhebool_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint10_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint1024_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint104_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint112_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint12_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint120_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint128_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint136_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint14_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint144_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint152_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint16_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint160_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint168_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint176_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint184_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint192_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint2_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint200_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint2048_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint208_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint216_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint224_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint232_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint24_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint240_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint248_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint256_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint32_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint4_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint40_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint48_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint512_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint56_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint6_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint64_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint72_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint8_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint80_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint88_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheint96_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint10_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint1024_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint104_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint112_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint12_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint120_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint128_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint136_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint14_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint144_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint152_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint16_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint160_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint168_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint176_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint184_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint192_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint2_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint200_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint2048_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint208_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint216_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint224_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint232_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint24_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint240_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint248_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint256_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint32_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint4_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint40_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint48_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint512_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint56_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint6_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint64_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint72_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint8_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint80_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint88_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_compressedfheuint96_free(ptr >>> 0, 1));

const FheBoolFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fhebool_free(ptr >>> 0, 1));

class FheBool {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheBool.prototype);
        obj.__wbg_ptr = ptr;
        FheBoolFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheBoolFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fhebool_free(ptr, 0);
    }
    /**
     * @param {boolean} value
     * @param {TfheClientKey} client_key
     * @returns {FheBool}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fhebool_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheBool.__wrap(ret[0]);
    }
    /**
     * @param {boolean} value
     * @param {TfhePublicKey} public_key
     * @returns {FheBool}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fhebool_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheBool.__wrap(ret[0]);
    }
    /**
     * @param {boolean} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheBool}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fhebool_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheBool.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {boolean}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fhebool_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return ret[0] !== 0;
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fhebool_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheBool}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fhebool_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheBool.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fhebool_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheBool}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fhebool_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheBool.__wrap(ret[0]);
    }
}

const FheInt10Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint10_free(ptr >>> 0, 1));

class FheInt10 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt10.prototype);
        obj.__wbg_ptr = ptr;
        FheInt10Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt10Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint10_free(ptr, 0);
    }
    /**
     * @param {number} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt10}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint10_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt10.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt10}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint10_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt10.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt10}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint10_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt10.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {number}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint10_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return ret[0];
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint10_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt10}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint10_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt10.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint10_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt10}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint10_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt10.__wrap(ret[0]);
    }
}

const FheInt1024Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint1024_free(ptr >>> 0, 1));

class FheInt1024 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt1024.prototype);
        obj.__wbg_ptr = ptr;
        FheInt1024Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt1024Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint1024_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt1024}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint1024_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt1024.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt1024}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint1024_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt1024.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt1024}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint1024_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt1024.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint1024_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint1024_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt1024}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint1024_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt1024.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint1024_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt1024}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint1024_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt1024.__wrap(ret[0]);
    }
}

const FheInt104Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint104_free(ptr >>> 0, 1));

class FheInt104 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt104.prototype);
        obj.__wbg_ptr = ptr;
        FheInt104Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt104Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint104_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt104}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint104_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt104.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt104}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint104_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt104.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt104}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint104_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt104.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint104_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint104_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt104}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint104_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt104.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint104_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt104}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint104_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt104.__wrap(ret[0]);
    }
}

const FheInt112Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint112_free(ptr >>> 0, 1));

class FheInt112 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt112.prototype);
        obj.__wbg_ptr = ptr;
        FheInt112Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt112Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint112_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt112}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint112_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt112.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt112}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint112_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt112.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt112}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint112_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt112.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint112_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint112_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt112}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint112_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt112.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint112_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt112}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint112_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt112.__wrap(ret[0]);
    }
}

const FheInt12Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint12_free(ptr >>> 0, 1));

class FheInt12 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt12.prototype);
        obj.__wbg_ptr = ptr;
        FheInt12Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt12Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint12_free(ptr, 0);
    }
    /**
     * @param {number} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt12}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint12_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt12.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt12}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint12_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt12.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt12}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint12_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt12.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {number}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint12_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return ret[0];
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint12_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt12}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint12_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt12.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint12_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt12}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint12_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt12.__wrap(ret[0]);
    }
}

const FheInt120Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint120_free(ptr >>> 0, 1));

class FheInt120 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt120.prototype);
        obj.__wbg_ptr = ptr;
        FheInt120Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt120Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint120_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt120}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint120_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt120.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt120}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint120_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt120.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt120}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint120_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt120.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint120_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint120_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt120}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint120_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt120.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint120_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt120}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint120_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt120.__wrap(ret[0]);
    }
}

const FheInt128Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint128_free(ptr >>> 0, 1));

class FheInt128 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt128.prototype);
        obj.__wbg_ptr = ptr;
        FheInt128Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt128Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint128_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt128}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint128_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt128.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt128}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint128_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt128.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt128}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint128_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt128.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint128_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint128_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt128}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint128_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt128.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint128_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt128}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint128_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt128.__wrap(ret[0]);
    }
}

const FheInt136Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint136_free(ptr >>> 0, 1));

class FheInt136 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt136.prototype);
        obj.__wbg_ptr = ptr;
        FheInt136Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt136Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint136_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt136}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint136_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt136.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt136}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint136_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt136.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt136}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint136_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt136.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint136_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint136_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt136}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint136_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt136.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint136_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt136}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint136_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt136.__wrap(ret[0]);
    }
}

const FheInt14Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint14_free(ptr >>> 0, 1));

class FheInt14 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt14.prototype);
        obj.__wbg_ptr = ptr;
        FheInt14Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt14Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint14_free(ptr, 0);
    }
    /**
     * @param {number} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt14}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint14_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt14.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt14}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint14_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt14.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt14}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint14_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt14.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {number}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint14_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return ret[0];
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint14_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt14}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint14_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt14.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint14_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt14}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint14_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt14.__wrap(ret[0]);
    }
}

const FheInt144Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint144_free(ptr >>> 0, 1));

class FheInt144 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt144.prototype);
        obj.__wbg_ptr = ptr;
        FheInt144Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt144Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint144_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt144}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint144_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt144.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt144}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint144_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt144.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt144}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint144_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt144.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint144_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint144_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt144}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint144_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt144.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint144_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt144}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint144_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt144.__wrap(ret[0]);
    }
}

const FheInt152Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint152_free(ptr >>> 0, 1));

class FheInt152 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt152.prototype);
        obj.__wbg_ptr = ptr;
        FheInt152Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt152Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint152_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt152}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint152_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt152.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt152}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint152_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt152.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt152}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint152_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt152.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint152_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint152_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt152}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint152_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt152.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint152_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt152}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint152_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt152.__wrap(ret[0]);
    }
}

const FheInt16Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint16_free(ptr >>> 0, 1));

class FheInt16 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt16.prototype);
        obj.__wbg_ptr = ptr;
        FheInt16Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt16Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint16_free(ptr, 0);
    }
    /**
     * @param {number} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt16}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint16_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt16.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt16}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint16_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt16.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt16}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint16_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt16.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {number}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint16_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return ret[0];
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint16_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt16}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint16_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt16.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint16_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt16}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint16_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt16.__wrap(ret[0]);
    }
}

const FheInt160Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint160_free(ptr >>> 0, 1));

class FheInt160 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt160.prototype);
        obj.__wbg_ptr = ptr;
        FheInt160Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt160Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint160_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt160}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint160_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt160.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt160}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint160_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt160.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt160}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint160_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt160.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint160_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint160_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt160}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint160_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt160.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint160_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt160}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint160_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt160.__wrap(ret[0]);
    }
}

const FheInt168Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint168_free(ptr >>> 0, 1));

class FheInt168 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt168.prototype);
        obj.__wbg_ptr = ptr;
        FheInt168Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt168Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint168_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt168}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint168_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt168.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt168}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint168_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt168.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt168}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint168_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt168.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint168_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint168_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt168}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint168_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt168.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint168_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt168}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint168_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt168.__wrap(ret[0]);
    }
}

const FheInt176Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint176_free(ptr >>> 0, 1));

class FheInt176 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt176.prototype);
        obj.__wbg_ptr = ptr;
        FheInt176Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt176Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint176_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt176}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint176_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt176.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt176}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint176_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt176.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt176}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint176_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt176.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint176_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint176_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt176}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint176_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt176.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint176_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt176}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint176_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt176.__wrap(ret[0]);
    }
}

const FheInt184Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint184_free(ptr >>> 0, 1));

class FheInt184 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt184.prototype);
        obj.__wbg_ptr = ptr;
        FheInt184Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt184Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint184_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt184}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint184_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt184.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt184}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint184_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt184.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt184}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint184_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt184.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint184_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint184_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt184}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint184_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt184.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint184_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt184}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint184_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt184.__wrap(ret[0]);
    }
}

const FheInt192Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint192_free(ptr >>> 0, 1));

class FheInt192 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt192.prototype);
        obj.__wbg_ptr = ptr;
        FheInt192Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt192Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint192_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt192}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint192_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt192.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt192}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint192_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt192.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt192}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint192_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt192.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint192_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint192_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt192}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint192_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt192.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint192_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt192}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint192_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt192.__wrap(ret[0]);
    }
}

const FheInt2Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint2_free(ptr >>> 0, 1));

class FheInt2 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt2.prototype);
        obj.__wbg_ptr = ptr;
        FheInt2Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt2Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint2_free(ptr, 0);
    }
    /**
     * @param {number} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt2}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint2_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt2.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt2}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint2_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt2.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt2}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint2_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt2.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {number}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint2_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return ret[0];
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint2_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt2}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint2_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt2.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint2_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt2}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint2_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt2.__wrap(ret[0]);
    }
}

const FheInt200Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint200_free(ptr >>> 0, 1));

class FheInt200 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt200.prototype);
        obj.__wbg_ptr = ptr;
        FheInt200Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt200Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint200_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt200}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint200_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt200.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt200}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint200_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt200.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt200}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint200_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt200.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint200_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint200_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt200}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint200_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt200.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint200_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt200}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint200_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt200.__wrap(ret[0]);
    }
}

const FheInt2048Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint2048_free(ptr >>> 0, 1));

class FheInt2048 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt2048.prototype);
        obj.__wbg_ptr = ptr;
        FheInt2048Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt2048Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint2048_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt2048}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint2048_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt2048.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt2048}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint2048_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt2048.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt2048}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint2048_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt2048.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint2048_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint2048_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt2048}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint2048_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt2048.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint2048_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt2048}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint2048_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt2048.__wrap(ret[0]);
    }
}

const FheInt208Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint208_free(ptr >>> 0, 1));

class FheInt208 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt208.prototype);
        obj.__wbg_ptr = ptr;
        FheInt208Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt208Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint208_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt208}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint208_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt208.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt208}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint208_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt208.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt208}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint208_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt208.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint208_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint208_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt208}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint208_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt208.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint208_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt208}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint208_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt208.__wrap(ret[0]);
    }
}

const FheInt216Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint216_free(ptr >>> 0, 1));

class FheInt216 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt216.prototype);
        obj.__wbg_ptr = ptr;
        FheInt216Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt216Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint216_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt216}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint216_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt216.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt216}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint216_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt216.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt216}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint216_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt216.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint216_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint216_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt216}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint216_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt216.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint216_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt216}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint216_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt216.__wrap(ret[0]);
    }
}

const FheInt224Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint224_free(ptr >>> 0, 1));

class FheInt224 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt224.prototype);
        obj.__wbg_ptr = ptr;
        FheInt224Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt224Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint224_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt224}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint224_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt224.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt224}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint224_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt224.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt224}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint224_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt224.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint224_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint224_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt224}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint224_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt224.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint224_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt224}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint224_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt224.__wrap(ret[0]);
    }
}

const FheInt232Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint232_free(ptr >>> 0, 1));

class FheInt232 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt232.prototype);
        obj.__wbg_ptr = ptr;
        FheInt232Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt232Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint232_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt232}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint232_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt232.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt232}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint232_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt232.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt232}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint232_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt232.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint232_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint232_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt232}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint232_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt232.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint232_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt232}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint232_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt232.__wrap(ret[0]);
    }
}

const FheInt24Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint24_free(ptr >>> 0, 1));

class FheInt24 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt24.prototype);
        obj.__wbg_ptr = ptr;
        FheInt24Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt24Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint24_free(ptr, 0);
    }
    /**
     * @param {number} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt24}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint24_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt24.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt24}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint24_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt24.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt24}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint24_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt24.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {number}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint24_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return ret[0];
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint24_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt24}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint24_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt24.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint24_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt24}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint24_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt24.__wrap(ret[0]);
    }
}

const FheInt240Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint240_free(ptr >>> 0, 1));

class FheInt240 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt240.prototype);
        obj.__wbg_ptr = ptr;
        FheInt240Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt240Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint240_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt240}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint240_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt240.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt240}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint240_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt240.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt240}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint240_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt240.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint240_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint240_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt240}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint240_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt240.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint240_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt240}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint240_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt240.__wrap(ret[0]);
    }
}

const FheInt248Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint248_free(ptr >>> 0, 1));

class FheInt248 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt248.prototype);
        obj.__wbg_ptr = ptr;
        FheInt248Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt248Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint248_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt248}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint248_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt248.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt248}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint248_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt248.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt248}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint248_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt248.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint248_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint248_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt248}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint248_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt248.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint248_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt248}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint248_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt248.__wrap(ret[0]);
    }
}

const FheInt256Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint256_free(ptr >>> 0, 1));

class FheInt256 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt256.prototype);
        obj.__wbg_ptr = ptr;
        FheInt256Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt256Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint256_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt256}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint256_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt256.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt256}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint256_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt256.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt256}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint256_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt256.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint256_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint256_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt256}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint256_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt256.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint256_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt256}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint256_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt256.__wrap(ret[0]);
    }
}

const FheInt32Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint32_free(ptr >>> 0, 1));

class FheInt32 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt32.prototype);
        obj.__wbg_ptr = ptr;
        FheInt32Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt32Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint32_free(ptr, 0);
    }
    /**
     * @param {number} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt32}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint32_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt32.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt32}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint32_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt32.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt32}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint32_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt32.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {number}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint32_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return ret[0];
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint32_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt32}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint32_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt32.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint32_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt32}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint32_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt32.__wrap(ret[0]);
    }
}

const FheInt4Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint4_free(ptr >>> 0, 1));

class FheInt4 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt4.prototype);
        obj.__wbg_ptr = ptr;
        FheInt4Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt4Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint4_free(ptr, 0);
    }
    /**
     * @param {number} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt4}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint4_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt4.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt4}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint4_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt4.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt4}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint4_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt4.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {number}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint4_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return ret[0];
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint4_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt4}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint4_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt4.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint4_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt4}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint4_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt4.__wrap(ret[0]);
    }
}

const FheInt40Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint40_free(ptr >>> 0, 1));

class FheInt40 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt40.prototype);
        obj.__wbg_ptr = ptr;
        FheInt40Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt40Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint40_free(ptr, 0);
    }
    /**
     * @param {bigint} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt40}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint40_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt40.__wrap(ret[0]);
    }
    /**
     * @param {bigint} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt40}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint40_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt40.__wrap(ret[0]);
    }
    /**
     * @param {bigint} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt40}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint40_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt40.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {bigint}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint40_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return ret[0];
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint40_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt40}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint40_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt40.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint40_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt40}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint40_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt40.__wrap(ret[0]);
    }
}

const FheInt48Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint48_free(ptr >>> 0, 1));

class FheInt48 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt48.prototype);
        obj.__wbg_ptr = ptr;
        FheInt48Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt48Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint48_free(ptr, 0);
    }
    /**
     * @param {bigint} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt48}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint48_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt48.__wrap(ret[0]);
    }
    /**
     * @param {bigint} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt48}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint48_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt48.__wrap(ret[0]);
    }
    /**
     * @param {bigint} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt48}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint48_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt48.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {bigint}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint48_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return ret[0];
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint48_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt48}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint48_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt48.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint48_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt48}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint48_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt48.__wrap(ret[0]);
    }
}

const FheInt512Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint512_free(ptr >>> 0, 1));

class FheInt512 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt512.prototype);
        obj.__wbg_ptr = ptr;
        FheInt512Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt512Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint512_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt512}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint512_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt512.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt512}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint512_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt512.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt512}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint512_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt512.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint512_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint512_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt512}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint512_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt512.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint512_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt512}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint512_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt512.__wrap(ret[0]);
    }
}

const FheInt56Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint56_free(ptr >>> 0, 1));

class FheInt56 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt56.prototype);
        obj.__wbg_ptr = ptr;
        FheInt56Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt56Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint56_free(ptr, 0);
    }
    /**
     * @param {bigint} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt56}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint56_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt56.__wrap(ret[0]);
    }
    /**
     * @param {bigint} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt56}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint56_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt56.__wrap(ret[0]);
    }
    /**
     * @param {bigint} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt56}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint56_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt56.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {bigint}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint56_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return ret[0];
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint56_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt56}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint56_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt56.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint56_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt56}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint56_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt56.__wrap(ret[0]);
    }
}

const FheInt6Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint6_free(ptr >>> 0, 1));

class FheInt6 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt6.prototype);
        obj.__wbg_ptr = ptr;
        FheInt6Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt6Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint6_free(ptr, 0);
    }
    /**
     * @param {number} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt6}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint6_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt6.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt6}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint6_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt6.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt6}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint6_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt6.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {number}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint6_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return ret[0];
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint6_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt6}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint6_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt6.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint6_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt6}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint6_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt6.__wrap(ret[0]);
    }
}

const FheInt64Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint64_free(ptr >>> 0, 1));

class FheInt64 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt64.prototype);
        obj.__wbg_ptr = ptr;
        FheInt64Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt64Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint64_free(ptr, 0);
    }
    /**
     * @param {bigint} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt64}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint64_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt64.__wrap(ret[0]);
    }
    /**
     * @param {bigint} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt64}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint64_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt64.__wrap(ret[0]);
    }
    /**
     * @param {bigint} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt64}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint64_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt64.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {bigint}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint64_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return ret[0];
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint64_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt64}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint64_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt64.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint64_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt64}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint64_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt64.__wrap(ret[0]);
    }
}

const FheInt72Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint72_free(ptr >>> 0, 1));

class FheInt72 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt72.prototype);
        obj.__wbg_ptr = ptr;
        FheInt72Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt72Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint72_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt72}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint72_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt72.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt72}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint72_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt72.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt72}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint72_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt72.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint72_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint72_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt72}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint72_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt72.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint72_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt72}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint72_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt72.__wrap(ret[0]);
    }
}

const FheInt8Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint8_free(ptr >>> 0, 1));

class FheInt8 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt8.prototype);
        obj.__wbg_ptr = ptr;
        FheInt8Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt8Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint8_free(ptr, 0);
    }
    /**
     * @param {number} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt8}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint8_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt8.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt8}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint8_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt8.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt8}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint8_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt8.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {number}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint8_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return ret[0];
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint8_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt8}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint8_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt8.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint8_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt8}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint8_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt8.__wrap(ret[0]);
    }
}

const FheInt80Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint80_free(ptr >>> 0, 1));

class FheInt80 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt80.prototype);
        obj.__wbg_ptr = ptr;
        FheInt80Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt80Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint80_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt80}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint80_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt80.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt80}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint80_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt80.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt80}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint80_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt80.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint80_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint80_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt80}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint80_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt80.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint80_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt80}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint80_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt80.__wrap(ret[0]);
    }
}

const FheInt88Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint88_free(ptr >>> 0, 1));

class FheInt88 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt88.prototype);
        obj.__wbg_ptr = ptr;
        FheInt88Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt88Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint88_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt88}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint88_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt88.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt88}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint88_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt88.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt88}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint88_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt88.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint88_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint88_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt88}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint88_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt88.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint88_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt88}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint88_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt88.__wrap(ret[0]);
    }
}

const FheInt96Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheint96_free(ptr >>> 0, 1));

class FheInt96 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheInt96.prototype);
        obj.__wbg_ptr = ptr;
        FheInt96Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheInt96Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheint96_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheInt96}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint96_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt96.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheInt96}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheint96_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt96.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheInt96}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheint96_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt96.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheint96_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheint96_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheInt96}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint96_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt96.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheint96_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheInt96}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheint96_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheInt96.__wrap(ret[0]);
    }
}

const FheUint10Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint10_free(ptr >>> 0, 1));

class FheUint10 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint10.prototype);
        obj.__wbg_ptr = ptr;
        FheUint10Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint10Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint10_free(ptr, 0);
    }
    /**
     * @param {number} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint10}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint10_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint10.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint10}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint10_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint10.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint10}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint10_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint10.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {number}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint10_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return ret[0];
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint10_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint10}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint10_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint10.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint10_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint10}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint10_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint10.__wrap(ret[0]);
    }
}

const FheUint1024Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint1024_free(ptr >>> 0, 1));

class FheUint1024 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint1024.prototype);
        obj.__wbg_ptr = ptr;
        FheUint1024Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint1024Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint1024_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint1024}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint1024_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint1024.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint1024}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint1024_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint1024.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint1024}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint1024_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint1024.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint1024_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint1024_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint1024}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint1024_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint1024.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint1024_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint1024}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint1024_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint1024.__wrap(ret[0]);
    }
}

const FheUint104Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint104_free(ptr >>> 0, 1));

class FheUint104 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint104.prototype);
        obj.__wbg_ptr = ptr;
        FheUint104Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint104Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint104_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint104}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint104_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint104.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint104}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint104_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint104.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint104}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint104_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint104.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint104_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint104_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint104}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint104_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint104.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint104_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint104}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint104_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint104.__wrap(ret[0]);
    }
}

const FheUint112Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint112_free(ptr >>> 0, 1));

class FheUint112 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint112.prototype);
        obj.__wbg_ptr = ptr;
        FheUint112Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint112Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint112_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint112}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint112_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint112.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint112}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint112_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint112.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint112}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint112_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint112.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint112_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint112_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint112}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint112_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint112.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint112_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint112}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint112_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint112.__wrap(ret[0]);
    }
}

const FheUint12Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint12_free(ptr >>> 0, 1));

class FheUint12 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint12.prototype);
        obj.__wbg_ptr = ptr;
        FheUint12Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint12Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint12_free(ptr, 0);
    }
    /**
     * @param {number} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint12}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint12_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint12.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint12}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint12_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint12.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint12}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint12_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint12.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {number}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint12_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return ret[0];
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint12_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint12}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint12_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint12.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint12_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint12}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint12_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint12.__wrap(ret[0]);
    }
}

const FheUint120Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint120_free(ptr >>> 0, 1));

class FheUint120 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint120.prototype);
        obj.__wbg_ptr = ptr;
        FheUint120Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint120Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint120_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint120}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint120_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint120.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint120}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint120_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint120.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint120}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint120_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint120.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint120_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint120_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint120}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint120_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint120.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint120_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint120}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint120_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint120.__wrap(ret[0]);
    }
}

const FheUint128Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint128_free(ptr >>> 0, 1));

class FheUint128 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint128.prototype);
        obj.__wbg_ptr = ptr;
        FheUint128Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint128Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint128_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint128}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint128_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint128.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint128}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint128_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint128.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint128}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint128_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint128.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint128_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint128_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint128}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint128_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint128.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint128_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint128}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint128_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint128.__wrap(ret[0]);
    }
}

const FheUint136Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint136_free(ptr >>> 0, 1));

class FheUint136 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint136.prototype);
        obj.__wbg_ptr = ptr;
        FheUint136Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint136Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint136_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint136}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint136_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint136.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint136}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint136_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint136.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint136}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint136_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint136.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint136_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint136_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint136}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint136_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint136.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint136_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint136}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint136_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint136.__wrap(ret[0]);
    }
}

const FheUint14Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint14_free(ptr >>> 0, 1));

class FheUint14 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint14.prototype);
        obj.__wbg_ptr = ptr;
        FheUint14Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint14Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint14_free(ptr, 0);
    }
    /**
     * @param {number} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint14}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint14_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint14.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint14}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint14_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint14.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint14}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint14_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint14.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {number}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint14_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return ret[0];
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint14_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint14}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint14_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint14.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint14_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint14}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint14_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint14.__wrap(ret[0]);
    }
}

const FheUint144Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint144_free(ptr >>> 0, 1));

class FheUint144 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint144.prototype);
        obj.__wbg_ptr = ptr;
        FheUint144Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint144Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint144_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint144}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint144_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint144.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint144}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint144_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint144.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint144}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint144_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint144.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint144_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint144_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint144}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint144_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint144.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint144_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint144}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint144_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint144.__wrap(ret[0]);
    }
}

const FheUint152Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint152_free(ptr >>> 0, 1));

class FheUint152 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint152.prototype);
        obj.__wbg_ptr = ptr;
        FheUint152Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint152Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint152_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint152}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint152_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint152.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint152}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint152_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint152.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint152}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint152_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint152.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint152_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint152_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint152}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint152_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint152.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint152_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint152}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint152_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint152.__wrap(ret[0]);
    }
}

const FheUint16Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint16_free(ptr >>> 0, 1));

class FheUint16 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint16.prototype);
        obj.__wbg_ptr = ptr;
        FheUint16Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint16Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint16_free(ptr, 0);
    }
    /**
     * @param {number} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint16}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint16_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint16.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint16}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint16_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint16.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint16}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint16_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint16.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {number}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint16_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return ret[0];
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint16_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint16}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint16_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint16.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint16_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint16}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint16_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint16.__wrap(ret[0]);
    }
}

const FheUint160Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint160_free(ptr >>> 0, 1));

class FheUint160 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint160.prototype);
        obj.__wbg_ptr = ptr;
        FheUint160Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint160Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint160_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint160}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint160_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint160.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint160}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint160_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint160.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint160}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint160_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint160.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint160_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint160_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint160}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint160_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint160.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint160_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint160}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint160_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint160.__wrap(ret[0]);
    }
}

const FheUint168Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint168_free(ptr >>> 0, 1));

class FheUint168 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint168.prototype);
        obj.__wbg_ptr = ptr;
        FheUint168Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint168Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint168_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint168}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint168_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint168.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint168}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint168_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint168.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint168}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint168_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint168.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint168_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint168_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint168}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint168_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint168.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint168_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint168}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint168_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint168.__wrap(ret[0]);
    }
}

const FheUint176Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint176_free(ptr >>> 0, 1));

class FheUint176 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint176.prototype);
        obj.__wbg_ptr = ptr;
        FheUint176Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint176Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint176_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint176}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint176_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint176.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint176}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint176_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint176.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint176}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint176_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint176.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint176_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint176_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint176}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint176_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint176.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint176_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint176}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint176_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint176.__wrap(ret[0]);
    }
}

const FheUint184Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint184_free(ptr >>> 0, 1));

class FheUint184 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint184.prototype);
        obj.__wbg_ptr = ptr;
        FheUint184Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint184Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint184_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint184}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint184_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint184.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint184}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint184_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint184.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint184}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint184_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint184.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint184_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint184_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint184}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint184_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint184.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint184_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint184}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint184_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint184.__wrap(ret[0]);
    }
}

const FheUint192Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint192_free(ptr >>> 0, 1));

class FheUint192 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint192.prototype);
        obj.__wbg_ptr = ptr;
        FheUint192Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint192Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint192_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint192}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint192_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint192.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint192}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint192_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint192.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint192}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint192_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint192.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint192_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint192_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint192}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint192_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint192.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint192_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint192}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint192_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint192.__wrap(ret[0]);
    }
}

const FheUint2Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint2_free(ptr >>> 0, 1));

class FheUint2 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint2.prototype);
        obj.__wbg_ptr = ptr;
        FheUint2Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint2Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint2_free(ptr, 0);
    }
    /**
     * @param {number} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint2}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint2_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint2.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint2}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint2_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint2.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint2}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint2_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint2.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {number}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint2_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return ret[0];
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint2_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint2}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint2_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint2.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint2_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint2}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint2_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint2.__wrap(ret[0]);
    }
}

const FheUint200Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint200_free(ptr >>> 0, 1));

class FheUint200 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint200.prototype);
        obj.__wbg_ptr = ptr;
        FheUint200Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint200Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint200_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint200}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint200_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint200.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint200}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint200_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint200.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint200}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint200_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint200.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint200_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint200_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint200}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint200_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint200.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint200_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint200}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint200_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint200.__wrap(ret[0]);
    }
}

const FheUint2048Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint2048_free(ptr >>> 0, 1));

class FheUint2048 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint2048.prototype);
        obj.__wbg_ptr = ptr;
        FheUint2048Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint2048Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint2048_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint2048}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint2048_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint2048.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint2048}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint2048_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint2048.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint2048}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint2048_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint2048.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint2048_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint2048_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint2048}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint2048_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint2048.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint2048_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint2048}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint2048_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint2048.__wrap(ret[0]);
    }
}

const FheUint208Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint208_free(ptr >>> 0, 1));

class FheUint208 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint208.prototype);
        obj.__wbg_ptr = ptr;
        FheUint208Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint208Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint208_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint208}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint208_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint208.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint208}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint208_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint208.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint208}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint208_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint208.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint208_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint208_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint208}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint208_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint208.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint208_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint208}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint208_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint208.__wrap(ret[0]);
    }
}

const FheUint216Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint216_free(ptr >>> 0, 1));

class FheUint216 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint216.prototype);
        obj.__wbg_ptr = ptr;
        FheUint216Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint216Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint216_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint216}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint216_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint216.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint216}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint216_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint216.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint216}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint216_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint216.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint216_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint216_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint216}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint216_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint216.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint216_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint216}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint216_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint216.__wrap(ret[0]);
    }
}

const FheUint224Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint224_free(ptr >>> 0, 1));

class FheUint224 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint224.prototype);
        obj.__wbg_ptr = ptr;
        FheUint224Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint224Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint224_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint224}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint224_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint224.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint224}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint224_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint224.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint224}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint224_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint224.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint224_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint224_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint224}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint224_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint224.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint224_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint224}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint224_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint224.__wrap(ret[0]);
    }
}

const FheUint232Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint232_free(ptr >>> 0, 1));

class FheUint232 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint232.prototype);
        obj.__wbg_ptr = ptr;
        FheUint232Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint232Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint232_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint232}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint232_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint232.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint232}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint232_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint232.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint232}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint232_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint232.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint232_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint232_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint232}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint232_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint232.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint232_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint232}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint232_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint232.__wrap(ret[0]);
    }
}

const FheUint24Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint24_free(ptr >>> 0, 1));

class FheUint24 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint24.prototype);
        obj.__wbg_ptr = ptr;
        FheUint24Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint24Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint24_free(ptr, 0);
    }
    /**
     * @param {number} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint24}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint24_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint24.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint24}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint24_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint24.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint24}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint24_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint24.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {number}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint24_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return ret[0] >>> 0;
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint24_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint24}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint24_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint24.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint24_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint24}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint24_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint24.__wrap(ret[0]);
    }
}

const FheUint240Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint240_free(ptr >>> 0, 1));

class FheUint240 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint240.prototype);
        obj.__wbg_ptr = ptr;
        FheUint240Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint240Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint240_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint240}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint240_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint240.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint240}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint240_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint240.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint240}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint240_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint240.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint240_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint240_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint240}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint240_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint240.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint240_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint240}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint240_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint240.__wrap(ret[0]);
    }
}

const FheUint248Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint248_free(ptr >>> 0, 1));

class FheUint248 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint248.prototype);
        obj.__wbg_ptr = ptr;
        FheUint248Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint248Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint248_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint248}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint248_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint248.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint248}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint248_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint248.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint248}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint248_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint248.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint248_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint248_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint248}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint248_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint248.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint248_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint248}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint248_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint248.__wrap(ret[0]);
    }
}

const FheUint256Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint256_free(ptr >>> 0, 1));

class FheUint256 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint256.prototype);
        obj.__wbg_ptr = ptr;
        FheUint256Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint256Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint256_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint256}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint256_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint256.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint256}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint256_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint256.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint256}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint256_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint256.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint256_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint256_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint256}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint256_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint256.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint256_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint256}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint256_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint256.__wrap(ret[0]);
    }
}

const FheUint32Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint32_free(ptr >>> 0, 1));

class FheUint32 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint32.prototype);
        obj.__wbg_ptr = ptr;
        FheUint32Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint32Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint32_free(ptr, 0);
    }
    /**
     * @param {number} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint32}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint32_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint32.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint32}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint32_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint32.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint32}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint32_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint32.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {number}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint32_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return ret[0] >>> 0;
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint32_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint32}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint32_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint32.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint32_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint32}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint32_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint32.__wrap(ret[0]);
    }
}

const FheUint4Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint4_free(ptr >>> 0, 1));

class FheUint4 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint4.prototype);
        obj.__wbg_ptr = ptr;
        FheUint4Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint4Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint4_free(ptr, 0);
    }
    /**
     * @param {number} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint4}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint4_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint4.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint4}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint4_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint4.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint4}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint4_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint4.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {number}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint4_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return ret[0];
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint4_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint4}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint4_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint4.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint4_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint4}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint4_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint4.__wrap(ret[0]);
    }
}

const FheUint40Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint40_free(ptr >>> 0, 1));

class FheUint40 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint40.prototype);
        obj.__wbg_ptr = ptr;
        FheUint40Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint40Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint40_free(ptr, 0);
    }
    /**
     * @param {bigint} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint40}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint40_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint40.__wrap(ret[0]);
    }
    /**
     * @param {bigint} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint40}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint40_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint40.__wrap(ret[0]);
    }
    /**
     * @param {bigint} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint40}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint40_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint40.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {bigint}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint40_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return BigInt.asUintN(64, ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint40_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint40}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint40_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint40.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint40_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint40}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint40_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint40.__wrap(ret[0]);
    }
}

const FheUint48Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint48_free(ptr >>> 0, 1));

class FheUint48 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint48.prototype);
        obj.__wbg_ptr = ptr;
        FheUint48Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint48Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint48_free(ptr, 0);
    }
    /**
     * @param {bigint} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint48}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint48_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint48.__wrap(ret[0]);
    }
    /**
     * @param {bigint} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint48}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint48_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint48.__wrap(ret[0]);
    }
    /**
     * @param {bigint} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint48}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint48_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint48.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {bigint}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint48_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return BigInt.asUintN(64, ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint48_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint48}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint48_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint48.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint48_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint48}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint48_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint48.__wrap(ret[0]);
    }
}

const FheUint512Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint512_free(ptr >>> 0, 1));

class FheUint512 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint512.prototype);
        obj.__wbg_ptr = ptr;
        FheUint512Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint512Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint512_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint512}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint512_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint512.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint512}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint512_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint512.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint512}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint512_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint512.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint512_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint512_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint512}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint512_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint512.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint512_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint512}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint512_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint512.__wrap(ret[0]);
    }
}

const FheUint56Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint56_free(ptr >>> 0, 1));

class FheUint56 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint56.prototype);
        obj.__wbg_ptr = ptr;
        FheUint56Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint56Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint56_free(ptr, 0);
    }
    /**
     * @param {bigint} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint56}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint56_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint56.__wrap(ret[0]);
    }
    /**
     * @param {bigint} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint56}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint56_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint56.__wrap(ret[0]);
    }
    /**
     * @param {bigint} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint56}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint56_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint56.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {bigint}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint56_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return BigInt.asUintN(64, ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint56_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint56}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint56_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint56.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint56_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint56}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint56_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint56.__wrap(ret[0]);
    }
}

const FheUint6Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint6_free(ptr >>> 0, 1));

class FheUint6 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint6.prototype);
        obj.__wbg_ptr = ptr;
        FheUint6Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint6Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint6_free(ptr, 0);
    }
    /**
     * @param {number} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint6}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint6_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint6.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint6}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint6_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint6.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint6}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint6_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint6.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {number}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint6_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return ret[0];
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint6_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint6}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint6_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint6.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint6_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint6}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint6_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint6.__wrap(ret[0]);
    }
}

const FheUint64Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint64_free(ptr >>> 0, 1));

class FheUint64 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint64.prototype);
        obj.__wbg_ptr = ptr;
        FheUint64Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint64Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint64_free(ptr, 0);
    }
    /**
     * @param {bigint} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint64}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint64_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint64.__wrap(ret[0]);
    }
    /**
     * @param {bigint} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint64}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint64_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint64.__wrap(ret[0]);
    }
    /**
     * @param {bigint} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint64}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint64_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint64.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {bigint}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint64_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return BigInt.asUintN(64, ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint64_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint64}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint64_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint64.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint64_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint64}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint64_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint64.__wrap(ret[0]);
    }
}

const FheUint72Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint72_free(ptr >>> 0, 1));

class FheUint72 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint72.prototype);
        obj.__wbg_ptr = ptr;
        FheUint72Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint72Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint72_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint72}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint72_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint72.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint72}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint72_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint72.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint72}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint72_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint72.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint72_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint72_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint72}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint72_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint72.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint72_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint72}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint72_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint72.__wrap(ret[0]);
    }
}

const FheUint8Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint8_free(ptr >>> 0, 1));

class FheUint8 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint8.prototype);
        obj.__wbg_ptr = ptr;
        FheUint8Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint8Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint8_free(ptr, 0);
    }
    /**
     * @param {number} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint8}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint8_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint8.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint8}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint8_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint8.__wrap(ret[0]);
    }
    /**
     * @param {number} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint8}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint8_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint8.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {number}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint8_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return ret[0];
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint8_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint8}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint8_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint8.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint8_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint8}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint8_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint8.__wrap(ret[0]);
    }
}

const FheUint80Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint80_free(ptr >>> 0, 1));

class FheUint80 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint80.prototype);
        obj.__wbg_ptr = ptr;
        FheUint80Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint80Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint80_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint80}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint80_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint80.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint80}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint80_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint80.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint80}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint80_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint80.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint80_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint80_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint80}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint80_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint80.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint80_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint80}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint80_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint80.__wrap(ret[0]);
    }
}

const FheUint88Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint88_free(ptr >>> 0, 1));

class FheUint88 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint88.prototype);
        obj.__wbg_ptr = ptr;
        FheUint88Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint88Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint88_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint88}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint88_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint88.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint88}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint88_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint88.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint88}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint88_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint88.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint88_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint88_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint88}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint88_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint88.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint88_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint88}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint88_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint88.__wrap(ret[0]);
    }
}

const FheUint96Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_fheuint96_free(ptr >>> 0, 1));

class FheUint96 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FheUint96.prototype);
        obj.__wbg_ptr = ptr;
        FheUint96Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FheUint96Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_fheuint96_free(ptr, 0);
    }
    /**
     * @param {any} value
     * @param {TfheClientKey} client_key
     * @returns {FheUint96}
     */
    static encrypt_with_client_key(value, client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint96_encrypt_with_client_key(value, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint96.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfhePublicKey} public_key
     * @returns {FheUint96}
     */
    static encrypt_with_public_key(value, public_key) {
        _assertClass$1(public_key, TfhePublicKey);
        const ret = wasm$1.fheuint96_encrypt_with_public_key(value, public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint96.__wrap(ret[0]);
    }
    /**
     * @param {any} value
     * @param {TfheCompressedPublicKey} compressed_public_key
     * @returns {FheUint96}
     */
    static encrypt_with_compressed_public_key(value, compressed_public_key) {
        _assertClass$1(compressed_public_key, TfheCompressedPublicKey);
        const ret = wasm$1.fheuint96_encrypt_with_compressed_public_key(value, compressed_public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint96.__wrap(ret[0]);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {any}
     */
    decrypt(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.fheuint96_decrypt(this.__wbg_ptr, client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return takeFromExternrefTable0$1(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.fheuint96_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {FheUint96}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint96_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint96.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.fheuint96_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {FheUint96}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.fheuint96_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return FheUint96.__wrap(ret[0]);
    }
}

const ProvenCompactCiphertextListFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_provencompactciphertextlist_free(ptr >>> 0, 1));

class ProvenCompactCiphertextList {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(ProvenCompactCiphertextList.prototype);
        obj.__wbg_ptr = ptr;
        ProvenCompactCiphertextListFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ProvenCompactCiphertextListFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_provencompactciphertextlist_free(ptr, 0);
    }
    /**
     * @param {TfheCompactPublicKey} public_key
     * @returns {CompactCiphertextListBuilder}
     */
    static builder(public_key) {
        _assertClass$1(public_key, TfheCompactPublicKey);
        const ret = wasm$1.provencompactciphertextlist_builder(public_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return CompactCiphertextListBuilder.__wrap(ret[0]);
    }
    /**
     * @returns {number}
     */
    len() {
        const ret = wasm$1.compactciphertextlistexpander_len(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {boolean}
     */
    is_empty() {
        const ret = wasm$1.compactciphertextlistexpander_is_empty(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {number} index
     * @returns {FheTypes | undefined}
     */
    get_kind_of(index) {
        const ret = wasm$1.provencompactciphertextlist_get_kind_of(this.__wbg_ptr, index);
        return ret === 84 ? undefined : ret;
    }
    /**
     * @param {CompactPkeCrs} crs
     * @param {TfheCompactPublicKey} public_key
     * @param {Uint8Array} metadata
     * @returns {CompactCiphertextListExpander}
     */
    verify_and_expand(crs, public_key, metadata) {
        _assertClass$1(crs, CompactPkeCrs);
        _assertClass$1(public_key, TfheCompactPublicKey);
        const ptr0 = passArray8ToWasm0$1(metadata, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.provencompactciphertextlist_verify_and_expand(this.__wbg_ptr, crs.__wbg_ptr, public_key.__wbg_ptr, ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return CompactCiphertextListExpander.__wrap(ret[0]);
    }
    /**
     * @returns {CompactCiphertextListExpander}
     */
    expand_without_verification() {
        const ret = wasm$1.provencompactciphertextlist_expand_without_verification(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return CompactCiphertextListExpander.__wrap(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.provencompactciphertextlist_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {ProvenCompactCiphertextList}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.provencompactciphertextlist_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return ProvenCompactCiphertextList.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.provencompactciphertextlist_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {ProvenCompactCiphertextList}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.provencompactciphertextlist_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return ProvenCompactCiphertextList.__wrap(ret[0]);
    }
}

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_shortint_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_shortintciphertext_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_shortintclientkey_free(ptr >>> 0, 1));

const ShortintCompactPublicKeyEncryptionParametersFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_shortintcompactpublickeyencryptionparameters_free(ptr >>> 0, 1));

class ShortintCompactPublicKeyEncryptionParameters {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(ShortintCompactPublicKeyEncryptionParameters.prototype);
        obj.__wbg_ptr = ptr;
        ShortintCompactPublicKeyEncryptionParametersFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ShortintCompactPublicKeyEncryptionParametersFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_shortintcompactpublickeyencryptionparameters_free(ptr, 0);
    }
    /**
     * @param {ShortintCompactPublicKeyEncryptionParametersName} name
     */
    constructor(name) {
        const ret = wasm$1.shortintcompactpublickeyencryptionparameters_new(name);
        this.__wbg_ptr = ret >>> 0;
        ShortintCompactPublicKeyEncryptionParametersFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @param {number} encryption_lwe_dimension
     * @param {ShortintNoiseDistribution} encryption_noise_distribution
     * @param {bigint} message_modulus
     * @param {bigint} carry_modulus
     * @param {number} modulus_power_of_2_exponent
     * @param {number} ks_base_log
     * @param {number} ks_level
     * @param {ShortintEncryptionKeyChoice} encryption_key_choice
     * @returns {ShortintCompactPublicKeyEncryptionParameters}
     */
    static new_parameters(encryption_lwe_dimension, encryption_noise_distribution, message_modulus, carry_modulus, modulus_power_of_2_exponent, ks_base_log, ks_level, encryption_key_choice) {
        _assertClass$1(encryption_noise_distribution, ShortintNoiseDistribution);
        const ret = wasm$1.shortintcompactpublickeyencryptionparameters_new_parameters(encryption_lwe_dimension, encryption_noise_distribution.__wbg_ptr, message_modulus, carry_modulus, modulus_power_of_2_exponent, ks_base_log, ks_level, encryption_key_choice);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return ShortintCompactPublicKeyEncryptionParameters.__wrap(ret[0]);
    }
}

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_shortintcompressedciphertext_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_shortintcompressedpublickey_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_shortintcompressedserverkey_free(ptr >>> 0, 1));

const ShortintNoiseDistributionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_shortintnoisedistribution_free(ptr >>> 0, 1));

class ShortintNoiseDistribution {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(ShortintNoiseDistribution.prototype);
        obj.__wbg_ptr = ptr;
        ShortintNoiseDistributionFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ShortintNoiseDistributionFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_shortintnoisedistribution_free(ptr, 0);
    }
}

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_shortintparameters_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_shortintpublickey_free(ptr >>> 0, 1));

const TfheClientKeyFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_tfheclientkey_free(ptr >>> 0, 1));

class TfheClientKey {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(TfheClientKey.prototype);
        obj.__wbg_ptr = ptr;
        TfheClientKeyFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        TfheClientKeyFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_tfheclientkey_free(ptr, 0);
    }
    /**
     * @param {TfheConfig} config
     * @returns {TfheClientKey}
     */
    static generate(config) {
        _assertClass$1(config, TfheConfig);
        const ret = wasm$1.tfheclientkey_generate(config.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return TfheClientKey.__wrap(ret[0]);
    }
    /**
     * @param {TfheConfig} config
     * @param {any} seed
     * @returns {TfheClientKey}
     */
    static generate_with_seed(config, seed) {
        _assertClass$1(config, TfheConfig);
        const ret = wasm$1.tfheclientkey_generate_with_seed(config.__wbg_ptr, seed);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return TfheClientKey.__wrap(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.tfheclientkey_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {TfheClientKey}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.tfheclientkey_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return TfheClientKey.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.tfheclientkey_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {TfheClientKey}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.tfheclientkey_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return TfheClientKey.__wrap(ret[0]);
    }
}

const TfheCompactPublicKeyFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_tfhecompactpublickey_free(ptr >>> 0, 1));

class TfheCompactPublicKey {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(TfheCompactPublicKey.prototype);
        obj.__wbg_ptr = ptr;
        TfheCompactPublicKeyFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        TfheCompactPublicKeyFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_tfhecompactpublickey_free(ptr, 0);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {TfheCompactPublicKey}
     */
    static new(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.tfhecompactpublickey_new(client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return TfheCompactPublicKey.__wrap(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.tfhecompactpublickey_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {TfheCompactPublicKey}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.tfhecompactpublickey_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return TfheCompactPublicKey.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.tfhecompactpublickey_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {TfheCompactPublicKey}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.tfhecompactpublickey_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return TfheCompactPublicKey.__wrap(ret[0]);
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @param {ShortintCompactPublicKeyEncryptionParameters} conformance_params
     * @returns {TfheCompactPublicKey}
     */
    static safe_deserialize_conformant(buffer, serialized_size_limit, conformance_params) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        _assertClass$1(conformance_params, ShortintCompactPublicKeyEncryptionParameters);
        const ret = wasm$1.tfhecompactpublickey_safe_deserialize_conformant(ptr0, len0, serialized_size_limit, conformance_params.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return TfheCompactPublicKey.__wrap(ret[0]);
    }
}

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_tfhecompressedcompactpublickey_free(ptr >>> 0, 1));

const TfheCompressedPublicKeyFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_tfhecompressedpublickey_free(ptr >>> 0, 1));

class TfheCompressedPublicKey {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(TfheCompressedPublicKey.prototype);
        obj.__wbg_ptr = ptr;
        TfheCompressedPublicKeyFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        TfheCompressedPublicKeyFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_tfhecompressedpublickey_free(ptr, 0);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {TfheCompressedPublicKey}
     */
    static new(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.tfhecompressedpublickey_new(client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return TfheCompressedPublicKey.__wrap(ret[0]);
    }
    /**
     * @returns {TfhePublicKey}
     */
    decompress() {
        const ret = wasm$1.tfhecompressedpublickey_decompress(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return TfhePublicKey.__wrap(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.tfhecompressedpublickey_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {TfheCompressedPublicKey}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.tfhecompressedpublickey_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return TfheCompressedPublicKey.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.tfhecompressedpublickey_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {TfheCompressedPublicKey}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.tfhecompressedpublickey_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return TfheCompressedPublicKey.__wrap(ret[0]);
    }
}

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_tfhecompressedserverkey_free(ptr >>> 0, 1));

const TfheConfigFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_tfheconfig_free(ptr >>> 0, 1));

class TfheConfig {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(TfheConfig.prototype);
        obj.__wbg_ptr = ptr;
        TfheConfigFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        TfheConfigFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_tfheconfig_free(ptr, 0);
    }
}

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_tfheconfigbuilder_free(ptr >>> 0, 1));

const TfhePublicKeyFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_tfhepublickey_free(ptr >>> 0, 1));

class TfhePublicKey {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(TfhePublicKey.prototype);
        obj.__wbg_ptr = ptr;
        TfhePublicKeyFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        TfhePublicKeyFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm$1.__wbg_tfhepublickey_free(ptr, 0);
    }
    /**
     * @param {TfheClientKey} client_key
     * @returns {TfhePublicKey}
     */
    static new(client_key) {
        _assertClass$1(client_key, TfheClientKey);
        const ret = wasm$1.tfhepublickey_new(client_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return TfhePublicKey.__wrap(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm$1.tfhepublickey_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @returns {TfhePublicKey}
     */
    static deserialize(buffer) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.tfhepublickey_deserialize(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return TfhePublicKey.__wrap(ret[0]);
    }
    /**
     * @param {bigint} serialized_size_limit
     * @returns {Uint8Array}
     */
    safe_serialize(serialized_size_limit) {
        const ret = wasm$1.tfhepublickey_safe_serialize(this.__wbg_ptr, serialized_size_limit);
        if (ret[3]) {
            throw takeFromExternrefTable0$1(ret[2]);
        }
        var v1 = getArrayU8FromWasm0$1(ret[0], ret[1]).slice();
        wasm$1.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} buffer
     * @param {bigint} serialized_size_limit
     * @returns {TfhePublicKey}
     */
    static safe_deserialize(buffer, serialized_size_limit) {
        const ptr0 = passArray8ToWasm0$1(buffer, wasm$1.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN$1;
        const ret = wasm$1.tfhepublickey_safe_deserialize(ptr0, len0, serialized_size_limit);
        if (ret[2]) {
            throw takeFromExternrefTable0$1(ret[1]);
        }
        return TfhePublicKey.__wrap(ret[0]);
    }
}

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_tfheserverkey_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_tfhe_free(ptr >>> 0, 1));

const wbg_rayon_PoolBuilderFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm$1.__wbg_wbg_rayon_poolbuilder_free(ptr >>> 0, 1));

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
        wasm$1.__wbg_wbg_rayon_poolbuilder_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    numThreads() {
        const ret = wasm$1.wbg_rayon_poolbuilder_numThreads(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    receiver() {
        const ret = wasm$1.wbg_rayon_poolbuilder_receiver(this.__wbg_ptr);
        return ret >>> 0;
    }
    build() {
        wasm$1.wbg_rayon_poolbuilder_build(this.__wbg_ptr);
    }
}

async function __wbg_load$1(module, imports) {
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

function __wbg_get_imports$1() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_BigInt_470dd987b8190f8e = function(arg0) {
        const ret = BigInt(arg0);
        return ret;
    };
    imports.wbg.__wbg_BigInt_ddea6d2f55558acb = function() { return handleError$1(function (arg0) {
        const ret = BigInt(arg0);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_buffer_609cc3eee51ed158 = function(arg0) {
        const ret = arg0.buffer;
        return ret;
    };
    imports.wbg.__wbg_call_672a4d21634d4a24 = function() { return handleError$1(function (arg0, arg1) {
        const ret = arg0.call(arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_call_7cccdd69e0791ae2 = function() { return handleError$1(function (arg0, arg1, arg2) {
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
            console.error(getStringFromWasm0$1(arg0, arg1));
        } finally {
            wasm$1.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_getRandomValues_b8f5dbd5f3995a9e = function() { return handleError$1(function (arg0, arg1) {
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
        const ret = new Function(getStringFromWasm0$1(arg0, arg1));
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
    imports.wbg.__wbg_randomFillSync_ac0988aba3254290 = function() { return handleError$1(function (arg0, arg1) {
        arg0.randomFillSync(arg1);
    }, arguments) };
    imports.wbg.__wbg_require_60cc747a6bc5215a = function() { return handleError$1(function () {
        const ret = module.require;
        return ret;
    }, arguments) };
    imports.wbg.__wbg_set_65595bdd868b3009 = function(arg0, arg1, arg2) {
        arg0.set(arg1, arg2 >>> 0);
    };
    imports.wbg.__wbg_stack_0ed75d68575b0f3c = function(arg0, arg1) {
        const ret = arg1.stack;
        const ptr1 = passStringToWasm0$1(ret, wasm$1.__wbindgen_malloc, wasm$1.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN$1;
        getDataViewMemory0$1().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0$1().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_startWorkers_2ca11761e08ff5d5 = function(arg0, arg1, arg2) {
        const ret = startWorkers(arg0, arg1, wbg_rayon_PoolBuilder.__wrap(arg2));
        return ret;
    };
    imports.wbg.__wbg_static_accessor_GLOBAL_88a902d13a557d07 = function() {
        const ret = typeof global$1 === 'undefined' ? null : global$1;
        return isLikeNone$1(ret) ? 0 : addToExternrefTable0$1(ret);
    };
    imports.wbg.__wbg_static_accessor_GLOBAL_THIS_56578be7e9f832b0 = function() {
        const ret = typeof globalThis === 'undefined' ? null : globalThis;
        return isLikeNone$1(ret) ? 0 : addToExternrefTable0$1(ret);
    };
    imports.wbg.__wbg_static_accessor_SELF_37c5d418e4bf5819 = function() {
        const ret = typeof self === 'undefined' ? null : self;
        return isLikeNone$1(ret) ? 0 : addToExternrefTable0$1(ret);
    };
    imports.wbg.__wbg_static_accessor_WINDOW_5de37043a91a9c40 = function() {
        const ret = typeof window === 'undefined' ? null : window;
        return isLikeNone$1(ret) ? 0 : addToExternrefTable0$1(ret);
    };
    imports.wbg.__wbg_subarray_aa9065fa9dc5df96 = function(arg0, arg1, arg2) {
        const ret = arg0.subarray(arg1 >>> 0, arg2 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_toString_2f76f493957b63da = function(arg0, arg1, arg2) {
        const ret = arg1.toString(arg2);
        const ptr1 = passStringToWasm0$1(ret, wasm$1.__wbindgen_malloc, wasm$1.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN$1;
        getDataViewMemory0$1().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0$1().setInt32(arg0 + 4 * 0, ptr1, true);
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
        getDataViewMemory0$1().setBigInt64(arg0 + 8 * 1, isLikeNone$1(ret) ? BigInt(0) : ret, true);
        getDataViewMemory0$1().setInt32(arg0 + 4 * 0, !isLikeNone$1(ret), true);
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
        const ret = debugString$1(arg1);
        const ptr1 = passStringToWasm0$1(ret, wasm$1.__wbindgen_malloc, wasm$1.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN$1;
        getDataViewMemory0$1().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0$1().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbindgen_error_new = function(arg0, arg1) {
        const ret = new Error(getStringFromWasm0$1(arg0, arg1));
        return ret;
    };
    imports.wbg.__wbindgen_init_externref_table = function() {
        const table = wasm$1.__wbindgen_export_2;
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
        const ret = wasm$1.memory;
        return ret;
    };
    imports.wbg.__wbindgen_module = function() {
        const ret = __wbg_init$1.__wbindgen_wasm_module;
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
        var ptr1 = isLikeNone$1(ret) ? 0 : passStringToWasm0$1(ret, wasm$1.__wbindgen_malloc, wasm$1.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN$1;
        getDataViewMemory0$1().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0$1().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0$1(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0$1(arg0, arg1));
    };

    return imports;
}

function __wbg_init_memory(imports, memory) {
    imports.wbg.memory = memory || new WebAssembly.Memory({initial:21,maximum:16384,shared:true});
}

function __wbg_finalize_init$1(instance, module, thread_stack_size) {
    wasm$1 = instance.exports;
    __wbg_init$1.__wbindgen_wasm_module = module;
    cachedDataViewMemory0$1 = null;
    cachedUint8ArrayMemory0$1 = null;

    if (typeof thread_stack_size !== 'undefined' && (typeof thread_stack_size !== 'number' || thread_stack_size === 0 || thread_stack_size % 65536 !== 0)) { throw 'invalid stack size' }
    wasm$1.__wbindgen_start(thread_stack_size);
    return wasm$1;
}

async function __wbg_init$1(module_or_path, memory) {
    if (wasm$1 !== undefined) return wasm$1;

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
    const imports = __wbg_get_imports$1();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    __wbg_init_memory(imports, memory);

    const { instance, module } = await __wbg_load$1(await module_or_path, imports);

    return __wbg_finalize_init$1(instance, module, thread_stack_size);
}

var tfhe = /*#__PURE__*/Object.freeze({
  __proto__: null,
  CompactCiphertextList: CompactCiphertextList,
  CompactCiphertextListBuilder: CompactCiphertextListBuilder,
  CompactCiphertextListExpander: CompactCiphertextListExpander,
  CompactPkeCrs: CompactPkeCrs,
  FheBool: FheBool,
  FheInt10: FheInt10,
  FheInt1024: FheInt1024,
  FheInt104: FheInt104,
  FheInt112: FheInt112,
  FheInt12: FheInt12,
  FheInt120: FheInt120,
  FheInt128: FheInt128,
  FheInt136: FheInt136,
  FheInt14: FheInt14,
  FheInt144: FheInt144,
  FheInt152: FheInt152,
  FheInt16: FheInt16,
  FheInt160: FheInt160,
  FheInt168: FheInt168,
  FheInt176: FheInt176,
  FheInt184: FheInt184,
  FheInt192: FheInt192,
  FheInt2: FheInt2,
  FheInt200: FheInt200,
  FheInt2048: FheInt2048,
  FheInt208: FheInt208,
  FheInt216: FheInt216,
  FheInt224: FheInt224,
  FheInt232: FheInt232,
  FheInt24: FheInt24,
  FheInt240: FheInt240,
  FheInt248: FheInt248,
  FheInt256: FheInt256,
  FheInt32: FheInt32,
  FheInt4: FheInt4,
  FheInt40: FheInt40,
  FheInt48: FheInt48,
  FheInt512: FheInt512,
  FheInt56: FheInt56,
  FheInt6: FheInt6,
  FheInt64: FheInt64,
  FheInt72: FheInt72,
  FheInt8: FheInt8,
  FheInt80: FheInt80,
  FheInt88: FheInt88,
  FheInt96: FheInt96,
  FheUint10: FheUint10,
  FheUint1024: FheUint1024,
  FheUint104: FheUint104,
  FheUint112: FheUint112,
  FheUint12: FheUint12,
  FheUint120: FheUint120,
  FheUint128: FheUint128,
  FheUint136: FheUint136,
  FheUint14: FheUint14,
  FheUint144: FheUint144,
  FheUint152: FheUint152,
  FheUint16: FheUint16,
  FheUint160: FheUint160,
  FheUint168: FheUint168,
  FheUint176: FheUint176,
  FheUint184: FheUint184,
  FheUint192: FheUint192,
  FheUint2: FheUint2,
  FheUint200: FheUint200,
  FheUint2048: FheUint2048,
  FheUint208: FheUint208,
  FheUint216: FheUint216,
  FheUint224: FheUint224,
  FheUint232: FheUint232,
  FheUint24: FheUint24,
  FheUint240: FheUint240,
  FheUint248: FheUint248,
  FheUint256: FheUint256,
  FheUint32: FheUint32,
  FheUint4: FheUint4,
  FheUint40: FheUint40,
  FheUint48: FheUint48,
  FheUint512: FheUint512,
  FheUint56: FheUint56,
  FheUint6: FheUint6,
  FheUint64: FheUint64,
  FheUint72: FheUint72,
  FheUint8: FheUint8,
  FheUint80: FheUint80,
  FheUint88: FheUint88,
  FheUint96: FheUint96,
  ProvenCompactCiphertextList: ProvenCompactCiphertextList,
  ShortintCompactPublicKeyEncryptionParameters: ShortintCompactPublicKeyEncryptionParameters,
  ShortintNoiseDistribution: ShortintNoiseDistribution,
  TfheClientKey: TfheClientKey,
  TfheCompactPublicKey: TfheCompactPublicKey,
  TfheCompressedPublicKey: TfheCompressedPublicKey,
  TfheConfig: TfheConfig,
  TfhePublicKey: TfhePublicKey,
  ZkComputeLoad: ZkComputeLoad,
  default: __wbg_init$1,
  initThreadPool: initThreadPool,
  init_panic_hook: init_panic_hook,
  wbg_rayon_PoolBuilder: wbg_rayon_PoolBuilder,
  wbg_rayon_start_worker: wbg_rayon_start_worker
});

let wasm;

let WASM_VECTOR_LEN = 0;

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available') } } );

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

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
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_export_4.set(idx, obj);
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
function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
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

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_export_4.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

/**
 * Create a new [ServerIdAddr] structure that holds an ID and an address
 * which must be a valid EIP-55 address, notably prefixed with "0x".
 * @param {number} id
 * @param {string} addr
 * @returns {ServerIdAddr}
 */
function new_server_id_addr(id, addr) {
    const ptr0 = passStringToWasm0(addr, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.new_server_id_addr(id, ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ServerIdAddr.__wrap(ret[0]);
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    for (let i = 0; i < array.length; i++) {
        const add = addToExternrefTable0(array[i]);
        getDataViewMemory0().setUint32(ptr + 4 * i, add, true);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}
/**
 * Instantiate a new client.
 *
 * * `server_addrs` - a list of KMS server ID with EIP-55 addresses,
 * the elements in the list can be created using [new_server_id_addr].
 *
 * * `client_address_hex` - the client (wallet) address in hex,
 * must be prefixed with "0x".
 *
 * * `fhe_parameter` - the parameter choice, which can be either `"test"` or `"default"`.
 * The "default" parameter choice is selected if no matching string is found.
 * @param {ServerIdAddr[]} server_addrs
 * @param {string} client_address_hex
 * @param {string} fhe_parameter
 * @returns {Client}
 */
function new_client(server_addrs, client_address_hex, fhe_parameter) {
    const ptr0 = passArrayJsValueToWasm0(server_addrs, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(client_address_hex, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(fhe_parameter, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.new_client(ptr0, len0, ptr1, len1, ptr2, len2);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return Client.__wrap(ret[0]);
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getDataViewMemory0();
    const result = [];
    for (let i = ptr; i < ptr + 4 * len; i += 4) {
        result.push(wasm.__wbindgen_export_4.get(mem.getUint32(i, true)));
    }
    wasm.__externref_drop_slice(ptr, len);
    return result;
}

/**
 * @returns {PrivateEncKey}
 */
function ml_kem_pke_keygen() {
    const ret = wasm.ml_kem_pke_keygen();
    return PrivateEncKey.__wrap(ret);
}

/**
 * @param {PrivateEncKey} sk
 * @returns {PublicEncKey}
 */
function ml_kem_pke_get_pk(sk) {
    _assertClass(sk, PrivateEncKey);
    const ret = wasm.ml_kem_pke_get_pk(sk.__wbg_ptr);
    return PublicEncKey.__wrap(ret);
}

/**
 * @param {PublicEncKey} pk
 * @returns {Uint8Array}
 */
function ml_kem_pke_pk_to_u8vec(pk) {
    _assertClass(pk, PublicEncKey);
    const ret = wasm.ml_kem_pke_pk_to_u8vec(pk.__wbg_ptr);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
}

/**
 * @param {PrivateEncKey} sk
 * @returns {Uint8Array}
 */
function ml_kem_pke_sk_to_u8vec(sk) {
    _assertClass(sk, PrivateEncKey);
    const ret = wasm.ml_kem_pke_sk_to_u8vec(sk.__wbg_ptr);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
}

/**
 * @param {Uint8Array} v
 * @returns {PublicEncKey}
 */
function u8vec_to_ml_kem_pke_pk(v) {
    const ptr0 = passArray8ToWasm0(v, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.u8vec_to_ml_kem_pke_pk(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return PublicEncKey.__wrap(ret[0]);
}

/**
 * @param {Uint8Array} v
 * @returns {PrivateEncKey}
 */
function u8vec_to_ml_kem_pke_sk(v) {
    const ptr0 = passArray8ToWasm0(v, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.u8vec_to_ml_kem_pke_sk(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return PrivateEncKey.__wrap(ret[0]);
}

/**
 * Process the user_decryption response from JavaScript objects.
 * The returned result is a byte array representing a plaintext of any length,
 * postprocessing is returned to turn it into an integer.
 *
 * * `client` - client that wants to perform user_decryption.
 *
 * * `request` - the initial user_decryption request JS object.
 * It can be set to null if `verify` is false.
 * Otherwise the caller needs to give the following JS object.
 * Note that `client_address` and `eip712_verifying_contract` follow EIP-55.
 * The signature field is not needed.
 * ```
 * {
 *   signature: undefined,
 *   client_address: '0x17853A630aAe15AED549B2B874de08B73C0F59c5',
 *   enc_key: '2000000000000000df2fcacb774f03187f3802a27259f45c06d33cefa68d9c53426b15ad531aa822',
 *   ciphertext_handles: [ '0748b542afe2353c86cb707e3d21044b0be1fd18efc7cbaa6a415af055bfb358' ]
 *   eip712_verifying_contract: '0x66f9664f97F2b50F62D13eA064982f936dE76657'
 * }
 * ```
 *
 * * `eip712_domain` - the EIP-712 domain JS object.
 * It can be set to null if `verify` is false.
 * Otherwise the caller needs to give the following JS object.
 * Note that `salt` is optional and `verifying_contract` follows EIP-55,
 * additionally, `chain_id` is an array of u8.
 * ```
 * {
 *   name: 'Authorization token',
 *   version: '1',
 *   chain_id: [
 *     70, 31, 0, 0, 0, 0, 0, 0, 0,
 *      0,  0, 0, 0, 0, 0, 0, 0, 0,
 *      0,  0, 0, 0, 0, 0, 0, 0, 0,
 *      0,  0, 0, 0, 0
 *   ],
 *   verifying_contract: '0x66f9664f97F2b50F62D13eA064982f936dE76657',
 *   salt: []
 * }
 * ```
 *
 * * `agg_resp` - the response JS object from the gateway.
 * It has two fields like so, both are hex encoded byte arrays.
 * ```
 * [
 *   {
 *     signature: '69e7e040cab157aa819015b321c012dccb1545ffefd325b359b492653f0347517e28e66c572cdc299e259024329859ff9fcb0096e1ce072af0b6e1ca1fe25ec6',
 *     payload: '0100000029...'
 *   }
 * ]
 * ```
 *
 * * `enc_pk` - The ephemeral public key.
 *
 * * `enc_sk` - The ephemeral secret key.
 *
 * * `verify` - Whether to perform signature verification for the response.
 * It is insecure if `verify = false`!
 * @param {Client} client
 * @param {any} request
 * @param {any} eip712_domain
 * @param {any} agg_resp
 * @param {PublicEncKey} enc_pk
 * @param {PrivateEncKey} enc_sk
 * @param {boolean} verify
 * @returns {TypedPlaintext[]}
 */
function process_user_decryption_resp_from_js(client, request, eip712_domain, agg_resp, enc_pk, enc_sk, verify) {
    _assertClass(client, Client);
    _assertClass(enc_pk, PublicEncKey);
    _assertClass(enc_sk, PrivateEncKey);
    const ret = wasm.process_user_decryption_resp_from_js(client.__wbg_ptr, request, eip712_domain, agg_resp, enc_pk.__wbg_ptr, enc_sk.__wbg_ptr, verify);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v1;
}

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_ciphertexthandle_free(ptr >>> 0, 1));

const ClientFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_client_free(ptr >>> 0, 1));
/**
 * Core Client
 *
 * Simple client to interact with the KMS servers. This can be seen as a proof-of-concept
 * and reference code for validating the KMS. The logic supplied by the client will be
 * distributed across the aggregator/proxy and smart contracts.
 */
class Client {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Client.prototype);
        obj.__wbg_ptr = ptr;
        ClientFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ClientFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_client_free(ptr, 0);
    }
}

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_cryptoboxct_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_eip712domainmsg_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_parseduserdecryptionrequest_free(ptr >>> 0, 1));

const PrivateEncKeyFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_privateenckey_free(ptr >>> 0, 1));

class PrivateEncKey {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(PrivateEncKey.prototype);
        obj.__wbg_ptr = ptr;
        PrivateEncKeyFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PrivateEncKeyFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_privateenckey_free(ptr, 0);
    }
}

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_privatesigkey_free(ptr >>> 0, 1));

const PublicEncKeyFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_publicenckey_free(ptr >>> 0, 1));

class PublicEncKey {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(PublicEncKey.prototype);
        obj.__wbg_ptr = ptr;
        PublicEncKeyFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PublicEncKeyFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_publicenckey_free(ptr, 0);
    }
}

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_publicsigkey_free(ptr >>> 0, 1));

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_requestid_free(ptr >>> 0, 1));

const ServerIdAddrFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_serveridaddr_free(ptr >>> 0, 1));

class ServerIdAddr {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(ServerIdAddr.prototype);
        obj.__wbg_ptr = ptr;
        ServerIdAddrFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof ServerIdAddr)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ServerIdAddrFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_serveridaddr_free(ptr, 0);
    }
}

const TypedCiphertextFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_typedciphertext_free(ptr >>> 0, 1));

class TypedCiphertext {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(TypedCiphertext.prototype);
        obj.__wbg_ptr = ptr;
        TypedCiphertextFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof TypedCiphertext)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        TypedCiphertextFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_typedciphertext_free(ptr, 0);
    }
    /**
     * The actual ciphertext to decrypt, taken directly from fhevm.
     * @returns {Uint8Array}
     */
    get ciphertext() {
        const ret = wasm.__wbg_get_typedciphertext_ciphertext(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * The actual ciphertext to decrypt, taken directly from fhevm.
     * @param {Uint8Array} arg0
     */
    set ciphertext(arg0) {
        const ptr0 = passArray8ToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_eip712domainmsg_name(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * The type of plaintext encrypted. The type should match FheType from tfhe-rs:
     * <https://github.com/zama-ai/tfhe-rs/blob/main/tfhe/src/high_level_api/mod.rs>
     * @returns {number}
     */
    get fhe_type() {
        const ret = wasm.__wbg_get_typedciphertext_fhe_type(this.__wbg_ptr);
        return ret;
    }
    /**
     * The type of plaintext encrypted. The type should match FheType from tfhe-rs:
     * <https://github.com/zama-ai/tfhe-rs/blob/main/tfhe/src/high_level_api/mod.rs>
     * @param {number} arg0
     */
    set fhe_type(arg0) {
        wasm.__wbg_set_typedciphertext_fhe_type(this.__wbg_ptr, arg0);
    }
    /**
     * The external handle of the ciphertext (the handle used in the copro).
     * @returns {Uint8Array}
     */
    get external_handle() {
        const ret = wasm.__wbg_get_typedciphertext_external_handle(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * The external handle of the ciphertext (the handle used in the copro).
     * @param {Uint8Array} arg0
     */
    set external_handle(arg0) {
        const ptr0 = passArray8ToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_eip712domainmsg_version(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * The ciphertext format, see CiphertextFormat documentation for details.
     * CiphertextFormat::default() is used if unspecified.
     * @returns {number}
     */
    get ciphertext_format() {
        const ret = wasm.__wbg_get_typedciphertext_ciphertext_format(this.__wbg_ptr);
        return ret;
    }
    /**
     * The ciphertext format, see CiphertextFormat documentation for details.
     * CiphertextFormat::default() is used if unspecified.
     * @param {number} arg0
     */
    set ciphertext_format(arg0) {
        wasm.__wbg_set_typedciphertext_ciphertext_format(this.__wbg_ptr, arg0);
    }
}

const TypedPlaintextFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_typedplaintext_free(ptr >>> 0, 1));

class TypedPlaintext {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(TypedPlaintext.prototype);
        obj.__wbg_ptr = ptr;
        TypedPlaintextFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        TypedPlaintextFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_typedplaintext_free(ptr, 0);
    }
    /**
     * The actual plaintext in bytes.
     * @returns {Uint8Array}
     */
    get bytes() {
        const ret = wasm.__wbg_get_typedplaintext_bytes(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * The actual plaintext in bytes.
     * @param {Uint8Array} arg0
     */
    set bytes(arg0) {
        const ptr0 = passArray8ToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_eip712domainmsg_name(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * The type of plaintext encrypted. The type should match FheType from tfhe-rs:
     * <https://github.com/zama-ai/tfhe-rs/blob/main/tfhe/src/high_level_api/mod.rs>
     * @returns {number}
     */
    get fhe_type() {
        const ret = wasm.__wbg_get_typedplaintext_fhe_type(this.__wbg_ptr);
        return ret;
    }
    /**
     * The type of plaintext encrypted. The type should match FheType from tfhe-rs:
     * <https://github.com/zama-ai/tfhe-rs/blob/main/tfhe/src/high_level_api/mod.rs>
     * @param {number} arg0
     */
    set fhe_type(arg0) {
        wasm.__wbg_set_typedplaintext_fhe_type(this.__wbg_ptr, arg0);
    }
}

const TypedSigncryptedCiphertextFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_typedsigncryptedciphertext_free(ptr >>> 0, 1));

class TypedSigncryptedCiphertext {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(TypedSigncryptedCiphertext.prototype);
        obj.__wbg_ptr = ptr;
        TypedSigncryptedCiphertextFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof TypedSigncryptedCiphertext)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        TypedSigncryptedCiphertextFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_typedsigncryptedciphertext_free(ptr, 0);
    }
    /**
     * The type of plaintext encrypted. The type should match FheType from tfhe-rs:
     * <https://github.com/zama-ai/tfhe-rs/blob/main/tfhe/src/high_level_api/mod.rs>
     * @returns {number}
     */
    get fhe_type() {
        const ret = wasm.__wbg_get_typedciphertext_fhe_type(this.__wbg_ptr);
        return ret;
    }
    /**
     * The type of plaintext encrypted. The type should match FheType from tfhe-rs:
     * <https://github.com/zama-ai/tfhe-rs/blob/main/tfhe/src/high_level_api/mod.rs>
     * @param {number} arg0
     */
    set fhe_type(arg0) {
        wasm.__wbg_set_typedciphertext_fhe_type(this.__wbg_ptr, arg0);
    }
    /**
     * The signcrypted payload, using a hybrid encryption approach in
     * sign-then-encrypt.
     * @returns {Uint8Array}
     */
    get signcrypted_ciphertext() {
        const ret = wasm.__wbg_get_typedsigncryptedciphertext_signcrypted_ciphertext(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * The signcrypted payload, using a hybrid encryption approach in
     * sign-then-encrypt.
     * @param {Uint8Array} arg0
     */
    set signcrypted_ciphertext(arg0) {
        const ptr0 = passArray8ToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_eip712domainmsg_name(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * The external handles that were originally in the request.
     * @returns {Uint8Array}
     */
    get external_handle() {
        const ret = wasm.__wbg_get_typedsigncryptedciphertext_external_handle(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * The external handles that were originally in the request.
     * @param {Uint8Array} arg0
     */
    set external_handle(arg0) {
        const ptr0 = passArray8ToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_eip712domainmsg_version(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * The packing factor determines whether the decrypted plaintext
     * has a different way of packing compared to what is specified in the plaintext modulus.
     * @returns {number}
     */
    get packing_factor() {
        const ret = wasm.__wbg_get_typedciphertext_ciphertext_format(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * The packing factor determines whether the decrypted plaintext
     * has a different way of packing compared to what is specified in the plaintext modulus.
     * @param {number} arg0
     */
    set packing_factor(arg0) {
        wasm.__wbg_set_typedciphertext_ciphertext_format(this.__wbg_ptr, arg0);
    }
}

(typeof FinalizationRegistry === 'undefined')
    ? { }
    : new FinalizationRegistry(ptr => wasm.__wbg_userdecryptionrequest_free(ptr >>> 0, 1));

const UserDecryptionResponseFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_userdecryptionresponse_free(ptr >>> 0, 1));

class UserDecryptionResponse {

    static __unwrap(jsValue) {
        if (!(jsValue instanceof UserDecryptionResponse)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        UserDecryptionResponseFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_userdecryptionresponse_free(ptr, 0);
    }
    /**
     * @returns {Uint8Array}
     */
    get signature() {
        const ret = wasm.__wbg_get_userdecryptionresponse_signature(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} arg0
     */
    set signature(arg0) {
        const ptr0 = passArray8ToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_eip712domainmsg_name(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * This is the external signature created from the Eip712 domain
     * on the structure, where userDecryptedShare is bc2wrap::serialize(&payload)
     * struct UserDecryptResponseVerification {
     *      bytes publicKey;
     *      uint256\[\] ctHandles;
     *      bytes userDecryptedShare;
     * }
     * @returns {Uint8Array}
     */
    get external_signature() {
        const ret = wasm.__wbg_get_userdecryptionresponse_external_signature(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * This is the external signature created from the Eip712 domain
     * on the structure, where userDecryptedShare is bc2wrap::serialize(&payload)
     * struct UserDecryptResponseVerification {
     *      bytes publicKey;
     *      uint256\[\] ctHandles;
     *      bytes userDecryptedShare;
     * }
     * @param {Uint8Array} arg0
     */
    set external_signature(arg0) {
        const ptr0 = passArray8ToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_eip712domainmsg_version(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * The actual \[UserDecryptionResponsePayload\].
     * @returns {UserDecryptionResponsePayload | undefined}
     */
    get payload() {
        const ret = wasm.__wbg_get_userdecryptionresponse_payload(this.__wbg_ptr);
        return ret === 0 ? undefined : UserDecryptionResponsePayload.__wrap(ret);
    }
    /**
     * The actual \[UserDecryptionResponsePayload\].
     * @param {UserDecryptionResponsePayload | null} [arg0]
     */
    set payload(arg0) {
        let ptr0 = 0;
        if (!isLikeNone(arg0)) {
            _assertClass(arg0, UserDecryptionResponsePayload);
            ptr0 = arg0.__destroy_into_raw();
        }
        wasm.__wbg_set_userdecryptionresponse_payload(this.__wbg_ptr, ptr0);
    }
}

const UserDecryptionResponsePayloadFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_userdecryptionresponsepayload_free(ptr >>> 0, 1));

class UserDecryptionResponsePayload {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(UserDecryptionResponsePayload.prototype);
        obj.__wbg_ptr = ptr;
        UserDecryptionResponsePayloadFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        UserDecryptionResponsePayloadFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_userdecryptionresponsepayload_free(ptr, 0);
    }
    /**
     * The server's signature verification key, Encoded using SEC1.
     * Needed to validate the response, but MUST also be linked to a list of
     * trusted keys.
     * @returns {Uint8Array}
     */
    get verification_key() {
        const ret = wasm.__wbg_get_userdecryptionresponsepayload_verification_key(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * The server's signature verification key, Encoded using SEC1.
     * Needed to validate the response, but MUST also be linked to a list of
     * trusted keys.
     * @param {Uint8Array} arg0
     */
    set verification_key(arg0) {
        const ptr0 = passArray8ToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_eip712domainmsg_name(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * This is needed to ensure the response corresponds to the request.
     * It is the digest of UserDecryptionLinker hashed using EIP712
     * under the given domain in the request.
     * @returns {Uint8Array}
     */
    get digest() {
        const ret = wasm.__wbg_get_userdecryptionresponsepayload_digest(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * This is needed to ensure the response corresponds to the request.
     * It is the digest of UserDecryptionLinker hashed using EIP712
     * under the given domain in the request.
     * @param {Uint8Array} arg0
     */
    set digest(arg0) {
        const ptr0 = passArray8ToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_eip712domainmsg_version(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * The resulting signcrypted ciphertexts, each ciphertext
     * must be decrypted and then reconstructed with the other shares
     * to produce the final plaintext.
     * @returns {TypedSigncryptedCiphertext[]}
     */
    get signcrypted_ciphertexts() {
        const ret = wasm.__wbg_get_userdecryptionresponsepayload_signcrypted_ciphertexts(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * The resulting signcrypted ciphertexts, each ciphertext
     * must be decrypted and then reconstructed with the other shares
     * to produce the final plaintext.
     * @param {TypedSigncryptedCiphertext[]} arg0
     */
    set signcrypted_ciphertexts(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_userdecryptionresponsepayload_signcrypted_ciphertexts(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * The ID of the MPC party doing the user decryption. Used for polynomial
     * reconstruction.
     * @returns {number}
     */
    get party_id() {
        const ret = wasm.__wbg_get_userdecryptionresponsepayload_party_id(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * The ID of the MPC party doing the user decryption. Used for polynomial
     * reconstruction.
     * @param {number} arg0
     */
    set party_id(arg0) {
        wasm.__wbg_set_userdecryptionresponsepayload_party_id(this.__wbg_ptr, arg0);
    }
    /**
     * The degree of the sharing scheme used.
     * @returns {number}
     */
    get degree() {
        const ret = wasm.__wbg_get_userdecryptionresponsepayload_degree(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * The degree of the sharing scheme used.
     * @param {number} arg0
     */
    set degree(arg0) {
        wasm.__wbg_set_userdecryptionresponsepayload_degree(this.__wbg_ptr, arg0);
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
    imports.wbg.__wbg_String_8f0eb39a4a4c2f66 = function(arg0, arg1) {
        const ret = String(arg1);
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
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
    imports.wbg.__wbg_crypto_ed58b8e10a292839 = function(arg0) {
        const ret = arg0.crypto;
        return ret;
    };
    imports.wbg.__wbg_done_769e5ede4b31c67b = function(arg0) {
        const ret = arg0.done;
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
    imports.wbg.__wbg_getRandomValues_bcb4912f16000dc4 = function() { return handleError(function (arg0, arg1) {
        arg0.getRandomValues(arg1);
    }, arguments) };
    imports.wbg.__wbg_get_67b2ba62fc30de12 = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.get(arg0, arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_get_b9b93047fe3cf45b = function(arg0, arg1) {
        const ret = arg0[arg1 >>> 0];
        return ret;
    };
    imports.wbg.__wbg_getwithrefkey_1dc361bd10053bfe = function(arg0, arg1) {
        const ret = arg0[arg1];
        return ret;
    };
    imports.wbg.__wbg_instanceof_ArrayBuffer_e14585432e3737fc = function(arg0) {
        let result;
        try {
            result = arg0 instanceof ArrayBuffer;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Uint8Array_17156bcf118086a9 = function(arg0) {
        let result;
        try {
            result = arg0 instanceof Uint8Array;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_isArray_a1eab7e0d067391b = function(arg0) {
        const ret = Array.isArray(arg0);
        return ret;
    };
    imports.wbg.__wbg_isSafeInteger_343e2beeeece1bb0 = function(arg0) {
        const ret = Number.isSafeInteger(arg0);
        return ret;
    };
    imports.wbg.__wbg_iterator_9a24c88df860dc65 = function() {
        const ret = Symbol.iterator;
        return ret;
    };
    imports.wbg.__wbg_length_a446193dc22c12f8 = function(arg0) {
        const ret = arg0.length;
        return ret;
    };
    imports.wbg.__wbg_length_e2d2a49132c1b256 = function(arg0) {
        const ret = arg0.length;
        return ret;
    };
    imports.wbg.__wbg_msCrypto_0a36e2ec3a343d26 = function(arg0) {
        const ret = arg0.msCrypto;
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
    imports.wbg.__wbg_next_25feadfc0913fea9 = function(arg0) {
        const ret = arg0.next;
        return ret;
    };
    imports.wbg.__wbg_next_6574e1a8a62d1055 = function() { return handleError(function (arg0) {
        const ret = arg0.next();
        return ret;
    }, arguments) };
    imports.wbg.__wbg_node_02999533c4ea02e3 = function(arg0) {
        const ret = arg0.node;
        return ret;
    };
    imports.wbg.__wbg_process_5c1d670bc53614b8 = function(arg0) {
        const ret = arg0.process;
        return ret;
    };
    imports.wbg.__wbg_randomFillSync_ab2cfe79ebbf2740 = function() { return handleError(function (arg0, arg1) {
        arg0.randomFillSync(arg1);
    }, arguments) };
    imports.wbg.__wbg_require_79b1e9274cde3c87 = function() { return handleError(function () {
        const ret = module.require;
        return ret;
    }, arguments) };
    imports.wbg.__wbg_serveridaddr_new = function(arg0) {
        const ret = ServerIdAddr.__wrap(arg0);
        return ret;
    };
    imports.wbg.__wbg_serveridaddr_unwrap = function(arg0) {
        const ret = ServerIdAddr.__unwrap(arg0);
        return ret;
    };
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
    imports.wbg.__wbg_static_accessor_GLOBAL_88a902d13a557d07 = function() {
        const ret = typeof global$1 === 'undefined' ? null : global$1;
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
    imports.wbg.__wbg_typedciphertext_new = function(arg0) {
        const ret = TypedCiphertext.__wrap(arg0);
        return ret;
    };
    imports.wbg.__wbg_typedciphertext_unwrap = function(arg0) {
        const ret = TypedCiphertext.__unwrap(arg0);
        return ret;
    };
    imports.wbg.__wbg_typedplaintext_new = function(arg0) {
        const ret = TypedPlaintext.__wrap(arg0);
        return ret;
    };
    imports.wbg.__wbg_typedsigncryptedciphertext_new = function(arg0) {
        const ret = TypedSigncryptedCiphertext.__wrap(arg0);
        return ret;
    };
    imports.wbg.__wbg_typedsigncryptedciphertext_unwrap = function(arg0) {
        const ret = TypedSigncryptedCiphertext.__unwrap(arg0);
        return ret;
    };
    imports.wbg.__wbg_userdecryptionresponse_unwrap = function(arg0) {
        const ret = UserDecryptionResponse.__unwrap(arg0);
        return ret;
    };
    imports.wbg.__wbg_value_cd1ffa7b1ab794f1 = function(arg0) {
        const ret = arg0.value;
        return ret;
    };
    imports.wbg.__wbg_versions_c71aa1626a93e0a1 = function(arg0) {
        const ret = arg0.versions;
        return ret;
    };
    imports.wbg.__wbindgen_as_number = function(arg0) {
        const ret = +arg0;
        return ret;
    };
    imports.wbg.__wbindgen_boolean_get = function(arg0) {
        const v = arg0;
        const ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
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
    imports.wbg.__wbindgen_in = function(arg0, arg1) {
        const ret = arg0 in arg1;
        return ret;
    };
    imports.wbg.__wbindgen_init_externref_table = function() {
        const table = wasm.__wbindgen_export_4;
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
    imports.wbg.__wbindgen_is_null = function(arg0) {
        const ret = arg0 === null;
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
    imports.wbg.__wbindgen_jsval_loose_eq = function(arg0, arg1) {
        const ret = arg0 == arg1;
        return ret;
    };
    imports.wbg.__wbindgen_memory = function() {
        const ret = wasm.memory;
        return ret;
    };
    imports.wbg.__wbindgen_number_get = function(arg0, arg1) {
        const obj = arg1;
        const ret = typeof(obj) === 'number' ? obj : undefined;
        getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
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

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedDataViewMemory0 = null;
    cachedUint8ArrayMemory0 = null;


    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (typeof module_or_path !== 'undefined') {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path);
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead');
        }
    }

    if (typeof module_or_path === 'undefined') {
        module_or_path = new URL('kms_lib_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

const SERIALIZED_SIZE_LIMIT_CIPHERTEXT = BigInt(1024 * 1024 * 512);
const SERIALIZED_SIZE_LIMIT_PK = BigInt(1024 * 1024 * 512);
const SERIALIZED_SIZE_LIMIT_CRS = BigInt(1024 * 1024 * 512);
const cleanURL = (url) => {
    if (!url)
        return '';
    return url.endsWith('/') ? url.slice(0, -1) : url;
};
const numberToHex = (num) => {
    let hex = num.toString(16);
    return hex.length % 2 ? '0' + hex : hex;
};
const fromHexString = (hexString) => {
    const arr = hexString.replace(/^(0x)/, '').match(/.{1,2}/g);
    if (!arr)
        return new Uint8Array();
    return Uint8Array.from(arr.map((byte) => parseInt(byte, 16)));
};
function toHexString(bytes, with0x = false) {
    return `${with0x ? '0x' : ''}${bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '')}`;
}
const bytesToBigInt = function (byteArray) {
    if (!byteArray || byteArray?.length === 0) {
        return BigInt(0);
    }
    const hex = Array.from(byteArray)
        .map((b) => b.toString(16).padStart(2, '0')) // byte to hex
        .join('');
    return BigInt(`0x${hex}`);
};

function getErrorCause(e) {
    if (e instanceof Error && typeof e.cause === 'object' && e.cause !== null) {
        return e.cause;
    }
    return undefined;
}
function getErrorCauseCode(e) {
    const cause = getErrorCause(e);
    if (!cause || !('code' in cause) || !cause.code) {
        return undefined;
    }
    if (typeof cause.code !== 'string') {
        return undefined;
    }
    return cause.code;
}
function getErrorCauseStatus(e) {
    const cause = getErrorCause(e);
    if (!cause || !('status' in cause) || cause.status === undefined) {
        return undefined;
    }
    if (typeof cause.status !== 'number') {
        return undefined;
    }
    return cause.status;
}
async function throwRelayerResponseError(operation, response) {
    let message;
    // Special case for 429
    if (response.status === 429) {
        message = `Relayer rate limit exceeded: Please wait and try again later.`;
    }
    else {
        switch (operation) {
            case 'PUBLIC_DECRYPT': {
                message = `Public decrypt failed: relayer respond with HTTP code ${response.status}`;
                break;
            }
            case 'USER_DECRYPT': {
                message = `User decrypt failed: relayer respond with HTTP code ${response.status}`;
                break;
            }
            case 'KEY_URL': {
                message = `HTTP error! status: ${response.status}`;
                break;
            }
            default: {
                const responseText = await response.text();
                message = `Relayer didn't response correctly. Bad status ${response.statusText}. Content: ${responseText}`;
                break;
            }
        }
    }
    const cause = {
        code: 'RELAYER_FETCH_ERROR',
        operation,
        status: response.status,
        statusText: response.statusText,
        url: response.url,
    };
    throw new Error(message, {
        cause,
    });
}
function throwRelayerJSONError(operation, error) {
    let message;
    switch (operation) {
        case 'PUBLIC_DECRYPT': {
            message = "Public decrypt failed: Relayer didn't return a JSON";
            break;
        }
        case 'USER_DECRYPT': {
            message = "User decrypt failed: Relayer didn't return a JSON";
            break;
        }
        default: {
            message = "Relayer didn't return a JSON";
            break;
        }
    }
    const cause = {
        code: 'RELAYER_NO_JSON_ERROR',
        operation,
        error,
    };
    throw new Error(message, {
        cause,
    });
}
function throwRelayerUnexpectedJSONError(operation, error) {
    let message;
    switch (operation) {
        case 'PUBLIC_DECRYPT': {
            message =
                'Public decrypt failed: Relayer returned an unexpected JSON response';
            break;
        }
        case 'USER_DECRYPT': {
            message =
                'User decrypt failed: Relayer returned an unexpected JSON response';
            break;
        }
        default: {
            message = 'Relayer returned an unexpected JSON response';
            break;
        }
    }
    const cause = {
        code: 'RELAYER_UNEXPECTED_JSON_ERROR',
        operation,
        error,
    };
    throw new Error(message, {
        cause,
    });
}
function throwRelayerInternalError(operation, json) {
    let message;
    switch (operation) {
        case 'PUBLIC_DECRYPT': {
            message =
                "Pulbic decrypt failed: the public decryption didn't succeed for an unknown reason";
            break;
        }
        case 'USER_DECRYPT': {
            message =
                "User decrypt failed: the user decryption didn't succeed for an unknown reason";
            break;
        }
        default: {
            message = "Relayer didn't response correctly.";
            break;
        }
    }
    const cause = {
        code: 'RELAYER_INTERNAL_ERROR',
        operation,
        error: json,
    };
    throw new Error(message, {
        cause,
    });
}
function throwRelayerUnknownError(operation, error, message) {
    if (!message) {
        switch (operation) {
            case 'PUBLIC_DECRYPT': {
                message = "Public decrypt failed: Relayer didn't respond";
                break;
            }
            case 'USER_DECRYPT': {
                message = "User decrypt failed: Relayer didn't respond";
                break;
            }
            default: {
                message = "Relayer didn't response correctly. Bad JSON.";
                break;
            }
        }
    }
    const cause = {
        code: 'RELAYER_UNKNOWN_ERROR',
        operation,
        error,
    };
    throw new Error(message ?? "Relayer didn't response correctly.", {
        cause,
    });
}

function assertIsRelayerFetchResponseJson(json) {
    if (!json || typeof json !== 'object') {
        throw new Error('Unexpected response JSON.');
    }
    if (!('response' in json &&
        json.response !== null &&
        json.response !== undefined)) {
        throw new Error("Unexpected response JSON format: missing 'response' property.");
    }
}
async function fetchRelayerJsonRpcPost(relayerOperation, url, payload, options) {
    const init = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(options?.apiKey && { 'x-api-key': options.apiKey }),
        },
        body: JSON.stringify(payload),
    };
    let response;
    let json;
    try {
        response = await fetch(url, init);
    }
    catch (e) {
        throwRelayerUnknownError(relayerOperation, e);
    }
    if (!response.ok) {
        await throwRelayerResponseError(relayerOperation, response);
    }
    let parsed;
    try {
        parsed = await response.json();
    }
    catch (e) {
        throwRelayerJSONError(relayerOperation, e);
    }
    try {
        assertIsRelayerFetchResponseJson(parsed);
        json = parsed;
    }
    catch (e) {
        throwRelayerUnexpectedJSONError(relayerOperation, e);
    }
    return json;
}
async function fetchRelayerGet(relayerOperation, url) {
    let response;
    let json;
    try {
        response = await fetch(url);
    }
    catch (e) {
        throwRelayerUnknownError(relayerOperation, e);
    }
    if (!response.ok) {
        await throwRelayerResponseError(relayerOperation, response);
    }
    let parsed;
    try {
        parsed = await response.json();
    }
    catch (e) {
        throwRelayerJSONError(relayerOperation, e);
    }
    try {
        assertIsRelayerFetchResponseJson(parsed);
        json = parsed;
    }
    catch (e) {
        throwRelayerUnexpectedJSONError(relayerOperation, e);
    }
    return json;
}

// export type RelayerKeysItem = {
//   data_id: string;
//   param_choice: number;
//   urls: string[];
//   signatures: string[];
// };
// export type RelayerKey = {
//   data_id: string;
//   param_choice: number;
//   signatures: string[];
//   urls: string[];
// };
// export type RelayerKeys = {
//   response: {
//     fhe_key_info: {
//       fhe_public_key: RelayerKey;
//       fhe_server_key: RelayerKey;
//     }[];
//     verf_public_key: {
//       key_id: string;
//       server_id: number;
//       verf_public_key_address: string;
//       verf_public_key_url: string;
//     }[];
//     crs: {
//       [key: string]: RelayerKeysItem;
//     };
//   };
//   status: string;
// };
const keyurlCache = {};
const getKeysFromRelayer = async (url, publicKeyId) => {
    if (keyurlCache[url]) {
        return keyurlCache[url];
    }
    const data = await fetchRelayerGet('KEY_URL', `${url}/v1/keyurl`);
    try {
        // const response = await fetch(`${url}/v1/keyurl`);
        // if (!response.ok) {
        //   await throwRelayerResponseError("KEY_URL", response);
        // }
        //const data: RelayerKeys = await response.json();
        //if (data) {
        let pubKeyUrl;
        // If no publicKeyId is provided, use the first one
        // Warning: if there are multiple keys available, the first one will most likely never be the
        // same between several calls (fetching the infos is non-deterministic)
        if (!publicKeyId) {
            pubKeyUrl = data.response.fhe_key_info[0].fhe_public_key.urls[0];
            publicKeyId = data.response.fhe_key_info[0].fhe_public_key.data_id;
        }
        else {
            // If a publicKeyId is provided, get the corresponding info
            const keyInfo = data.response.fhe_key_info.find((info) => info.fhe_public_key.data_id === publicKeyId);
            if (!keyInfo) {
                throw new Error(`Could not find FHE key info with data_id ${publicKeyId}`);
            }
            // TODO: Get a given party's public key url instead of the first one
            pubKeyUrl = keyInfo.fhe_public_key.urls[0];
        }
        const publicKeyResponse = await fetch(pubKeyUrl);
        if (!publicKeyResponse.ok) {
            throw new Error(`HTTP error! status: ${publicKeyResponse.status} on ${publicKeyResponse.url}`);
        }
        let publicKey;
        if (typeof publicKeyResponse.bytes === 'function') {
            // bytes is not widely supported yet
            publicKey = await publicKeyResponse.bytes();
        }
        else {
            publicKey = new Uint8Array(await publicKeyResponse.arrayBuffer());
        }
        const publicParamsUrl = data.response.crs['2048'].urls[0];
        const publicParamsId = data.response.crs['2048'].data_id;
        const publicParams2048Response = await fetch(publicParamsUrl);
        if (!publicParams2048Response.ok) {
            throw new Error(`HTTP error! status: ${publicParams2048Response.status} on ${publicParams2048Response.url}`);
        }
        let publicParams2048;
        if (typeof publicParams2048Response.bytes === 'function') {
            // bytes is not widely supported yet
            publicParams2048 = await publicParams2048Response.bytes();
        }
        else {
            publicParams2048 = new Uint8Array(await publicParams2048Response.arrayBuffer());
        }
        let pub_key;
        try {
            pub_key = TFHE.TfheCompactPublicKey.safe_deserialize(publicKey, SERIALIZED_SIZE_LIMIT_PK);
        }
        catch (e) {
            throw new Error('Invalid public key (deserialization failed)', {
                cause: e,
            });
        }
        let crs;
        try {
            crs = TFHE.CompactPkeCrs.safe_deserialize(new Uint8Array(publicParams2048), SERIALIZED_SIZE_LIMIT_CRS);
        }
        catch (e) {
            throw new Error('Invalid crs (deserialization failed)', {
                cause: e,
            });
        }
        const result = {
            publicKey: pub_key,
            publicKeyId,
            publicParams: {
                2048: {
                    publicParams: crs,
                    publicParamsId,
                },
            },
        };
        keyurlCache[url] = result;
        return result;
        // } else {
        //   throw new Error('No public key available');
        // }
    }
    catch (e) {
        throw new Error('Impossible to fetch public key: wrong relayer url.', {
            cause: e,
        });
    }
};

const abiKmsVerifier = [
    'function getKmsSigners() view returns (address[])',
    'function getThreshold() view returns (uint256)',
];
const abiInputVerifier = [
    'function getCoprocessorSigners() view returns (address[])',
    'function getThreshold() view returns (uint256)',
];
const getProvider = (config) => {
    if (typeof config.network === 'string') {
        return new JsonRpcProvider(config.network);
    }
    else if (config.network) {
        return new BrowserProvider(config.network);
    }
    throw new Error('You must provide a network URL or a EIP1193 object (eg: window.ethereum)');
};
const getChainId = async (provider, config) => {
    if (config.chainId && typeof config.chainId === 'number') {
        return config.chainId;
    }
    else if (config.chainId && typeof config.chainId !== 'number') {
        throw new Error('chainId must be a number.');
    }
    else {
        const chainId = (await provider.getNetwork()).chainId;
        return Number(chainId);
    }
};
const getTfheCompactPublicKey = async (config) => {
    if (config.relayerUrl && !config.publicKey) {
        const inputs = await getKeysFromRelayer(cleanURL(config.relayerUrl));
        return { publicKey: inputs.publicKey, publicKeyId: inputs.publicKeyId };
    }
    else if (config.publicKey && config.publicKey.data && config.publicKey.id) {
        const buff = config.publicKey.data;
        try {
            return {
                publicKey: TFHE.TfheCompactPublicKey.safe_deserialize(buff, SERIALIZED_SIZE_LIMIT_PK),
                publicKeyId: config.publicKey.id,
            };
        }
        catch (e) {
            throw new Error('Invalid public key (deserialization failed)', {
                cause: e,
            });
        }
    }
    else {
        throw new Error('You must provide a public key with its public key ID.');
    }
};
const getPublicParams = async (config) => {
    if (config.relayerUrl && !config.publicParams) {
        const inputs = await getKeysFromRelayer(cleanURL(config.relayerUrl));
        return inputs.publicParams;
    }
    else if (config.publicParams && config.publicParams['2048']) {
        const buff = config.publicParams['2048'].publicParams;
        try {
            return {
                2048: {
                    publicParams: TFHE.CompactPkeCrs.safe_deserialize(buff, SERIALIZED_SIZE_LIMIT_CRS),
                    publicParamsId: config.publicParams['2048'].publicParamsId,
                },
            };
        }
        catch (e) {
            throw new Error('Invalid public key (deserialization failed)', {
                cause: e,
            });
        }
    }
    else {
        throw new Error('You must provide a valid CRS with its CRS ID.');
    }
};
const getKMSSigners = async (provider, config) => {
    const kmsContract = new Contract(config.kmsContractAddress, abiKmsVerifier, provider);
    const signers = await kmsContract.getKmsSigners();
    return signers;
};
const getKMSSignersThreshold = async (provider, config) => {
    const kmsContract = new Contract(config.kmsContractAddress, abiKmsVerifier, provider);
    const threshold = await kmsContract.getThreshold();
    return Number(threshold); // threshold is always supposed to fit in a number
};
const getCoprocessorSigners = async (provider, config) => {
    const inputContract = new Contract(config.inputVerifierContractAddress, abiInputVerifier, provider);
    const signers = await inputContract.getCoprocessorSigners();
    return signers;
};
const getCoprocessorSignersThreshold = async (provider, config) => {
    const inputContract = new Contract(config.inputVerifierContractAddress, abiInputVerifier, provider);
    const threshold = await inputContract.getThreshold();
    return Number(threshold); // threshold is always supposed to fit in a number
};

const NumEncryptedBits = {
    0: 2, // ebool
    2: 8, // euint8
    3: 16, // euint16
    4: 32, // euint32
    5: 64, // euint64
    6: 128, // euint128
    7: 160, // eaddress
    8: 256, // euint256
};
function checkEncryptedBits(handles) {
    let total = 0;
    for (const handle of handles) {
        if (handle.length !== 66) {
            throw new Error(`Handle ${handle} is not of valid length`);
        }
        const hexPair = handle.slice(-4, -2).toLowerCase();
        const typeDiscriminant = parseInt(hexPair, 16);
        if (!(typeDiscriminant in NumEncryptedBits)) {
            throw new Error(`Handle ${handle} is not of valid type`);
        }
        total +=
            NumEncryptedBits[typeDiscriminant];
        // enforce 2048‑bit limit
        if (total > 2048) {
            throw new Error('Cannot decrypt more than 2048 encrypted bits in a single request');
        }
    }
    return total;
}

// Add type checking
const getAddress$1 = (value) => getAddress$2(value);
const aclABI$1 = [
    'function persistAllowed(bytes32 handle, address account) view returns (bool)',
];
const MAX_USER_DECRYPT_CONTRACT_ADDRESSES = 10;
const MAX_USER_DECRYPT_DURATION_DAYS = BigInt(365);
function formatAccordingToType(decryptedBigInt, type) {
    if (type === 0) {
        // ebool
        return decryptedBigInt === BigInt(1);
    }
    else if (type === 7) {
        // eaddress
        return getAddress$1('0x' + decryptedBigInt.toString(16).padStart(40, '0'));
    }
    else if (type === 9) {
        // ebytes64
        return '0x' + decryptedBigInt.toString(16).padStart(128, '0');
    }
    else if (type === 10) {
        // ebytes128
        return '0x' + decryptedBigInt.toString(16).padStart(256, '0');
    }
    else if (type === 11) {
        // ebytes256
        return '0x' + decryptedBigInt.toString(16).padStart(512, '0');
    } // euintXXX
    return decryptedBigInt;
}
function buildUserDecryptedResult(handles, listBigIntDecryptions) {
    let typesList = [];
    for (const handle of handles) {
        const hexPair = handle.slice(-4, -2).toLowerCase();
        const typeDiscriminant = parseInt(hexPair, 16);
        typesList.push(typeDiscriminant);
    }
    let results = {};
    handles.forEach((handle, idx) => (results[handle] = formatAccordingToType(listBigIntDecryptions[idx], typesList[idx])));
    return results;
}
function checkDeadlineValidity(startTimestamp, durationDays) {
    if (durationDays === BigInt(0)) {
        throw Error('durationDays is null');
    }
    if (durationDays > MAX_USER_DECRYPT_DURATION_DAYS) {
        throw Error(`durationDays is above max duration of ${MAX_USER_DECRYPT_DURATION_DAYS}`);
    }
    const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));
    if (startTimestamp > currentTimestamp) {
        throw Error('startTimestamp is set in the future');
    }
    const durationInSeconds = durationDays * BigInt(86400);
    if (startTimestamp + durationInSeconds < currentTimestamp) {
        throw Error('User decrypt request has expired');
    }
}
const userDecryptRequest = (kmsSigners, gatewayChainId, chainId, verifyingContractAddress, aclContractAddress, relayerUrl, provider, options) => async (_handles, privateKey, publicKey, signature, contractAddresses, userAddress, startTimestamp, durationDays) => {
    let pubKey;
    let privKey;
    try {
        pubKey = TKMS.u8vec_to_ml_kem_pke_pk(fromHexString(publicKey));
        privKey = TKMS.u8vec_to_ml_kem_pke_sk(fromHexString(privateKey));
    }
    catch (e) {
        throw new Error('Invalid public or private key', { cause: e });
    }
    // Casting handles if string
    const signatureSanitized = signature.replace(/^(0x)/, '');
    const publicKeySanitized = publicKey.replace(/^(0x)/, '');
    const handles = _handles.map((h) => ({
        handle: typeof h.handle === 'string'
            ? toHexString(fromHexString(h.handle), true)
            : toHexString(h.handle, true),
        contractAddress: getAddress$1(h.contractAddress),
    }));
    checkEncryptedBits(handles.map((h) => h.handle));
    checkDeadlineValidity(BigInt(startTimestamp), BigInt(durationDays));
    const acl = new ethers.Contract(aclContractAddress, aclABI$1, provider);
    const verifications = handles.map(async ({ handle, contractAddress }) => {
        const userAllowed = await acl.persistAllowed(handle, userAddress);
        const contractAllowed = await acl.persistAllowed(handle, contractAddress);
        if (!userAllowed) {
            throw new Error(`User ${userAddress} is not authorized to user decrypt handle ${handle}!`);
        }
        if (!contractAllowed) {
            throw new Error(`dapp contract ${contractAddress} is not authorized to user decrypt handle ${handle}!`);
        }
        if (userAddress === contractAddress) {
            throw new Error(`userAddress ${userAddress} should not be equal to contractAddress when requesting user decryption!`);
        }
    });
    const contractAddressesLength = contractAddresses.length;
    if (contractAddressesLength === 0) {
        throw Error('contractAddresses is empty');
    }
    if (contractAddressesLength > MAX_USER_DECRYPT_CONTRACT_ADDRESSES) {
        throw Error(`contractAddresses max length of ${MAX_USER_DECRYPT_CONTRACT_ADDRESSES} exceeded`);
    }
    await Promise.all(verifications).catch((e) => {
        throw e;
    });
    const payloadForRequest = {
        handleContractPairs: handles,
        requestValidity: {
            startTimestamp: startTimestamp.toString(), // Convert to string
            durationDays: durationDays.toString(), // Convert to string
        },
        contractsChainId: chainId.toString(), // Convert to string
        contractAddresses: contractAddresses.map((c) => getAddress$1(c)),
        userAddress: getAddress$1(userAddress),
        signature: signatureSanitized,
        publicKey: publicKeySanitized,
    };
    const json = await fetchRelayerJsonRpcPost('USER_DECRYPT', `${relayerUrl}/v1/user-decrypt`, payloadForRequest, options);
    // assume the KMS Signers have the correct order
    let indexedKmsSigners = kmsSigners.map((signer, index) => {
        return TKMS.new_server_id_addr(index + 1, signer);
    });
    const client = TKMS.new_client(indexedKmsSigners, userAddress, 'default');
    try {
        const buffer = new ArrayBuffer(32);
        const view = new DataView(buffer);
        view.setUint32(28, gatewayChainId, false);
        const chainIdArrayBE = new Uint8Array(buffer);
        const eip712Domain = {
            name: 'Decryption',
            version: '1',
            chain_id: chainIdArrayBE,
            verifying_contract: verifyingContractAddress,
            salt: null,
        };
        const payloadForVerification = {
            signature: signatureSanitized,
            client_address: userAddress,
            enc_key: publicKeySanitized,
            ciphertext_handles: handles.map((h) => h.handle.replace(/^0x/, '')),
            eip712_verifying_contract: verifyingContractAddress,
        };
        const decryption = TKMS.process_user_decryption_resp_from_js(client, payloadForVerification, eip712Domain, json.response, pubKey, privKey, true);
        const listBigIntDecryptions = decryption.map((d) => bytesToBigInt(d.bytes));
        const results = buildUserDecryptedResult(handles.map((h) => h.handle), listBigIntDecryptions);
        return results;
    }
    catch (e) {
        throw new Error('An error occured during decryption', { cause: e });
    }
};

const checkEncryptedValue = (value, bits) => {
    if (value == null)
        throw new Error('Missing value');
    let limit;
    if (bits >= 8) {
        limit = BigInt(`0x${new Array(bits / 8).fill(null).reduce((v) => `${v}ff`, '')}`);
    }
    else {
        limit = BigInt(2 ** bits - 1);
    }
    if (typeof value !== 'number' && typeof value !== 'bigint')
        throw new Error('Value must be a number or a bigint.');
    if (value > limit) {
        throw new Error(`The value exceeds the limit for ${bits}bits integer (${limit.toString()}).`);
    }
};
const createEncryptedInput = ({ aclContractAddress, chainId, tfheCompactPublicKey, publicParams, contractAddress, userAddress, }) => {
    if (!isAddress(contractAddress)) {
        throw new Error('Contract address is not a valid address.');
    }
    if (!isAddress(userAddress)) {
        throw new Error('User address is not a valid address.');
    }
    const publicKey = tfheCompactPublicKey;
    const bits = [];
    const builder = TFHE.CompactCiphertextList.builder(publicKey);
    let ciphertextWithZKProof = new Uint8Array(); // updated in `_prove`
    const checkLimit = (added) => {
        if (bits.reduce((acc, val) => acc + Math.max(2, val), 0) + added > 2048) {
            throw Error('Packing more than 2048 bits in a single input ciphertext is unsupported');
        }
        if (bits.length + 1 > 256)
            throw Error('Packing more than 256 variables in a single input ciphertext is unsupported');
    };
    return {
        addBool(value) {
            if (value == null)
                throw new Error('Missing value');
            if (typeof value !== 'boolean' &&
                typeof value !== 'number' &&
                typeof value !== 'bigint')
                throw new Error('The value must be a boolean, a number or a bigint.');
            if (Number(value) > 1)
                throw new Error('The value must be 1 or 0.');
            checkEncryptedValue(Number(value), 1);
            checkLimit(2);
            builder.push_boolean(!!value);
            bits.push(1); // ebool takes 2 encrypted bits
            return this;
        },
        add8(value) {
            checkEncryptedValue(value, 8);
            checkLimit(8);
            builder.push_u8(Number(value));
            bits.push(8);
            return this;
        },
        add16(value) {
            checkEncryptedValue(value, 16);
            checkLimit(16);
            builder.push_u16(Number(value));
            bits.push(16);
            return this;
        },
        add32(value) {
            checkEncryptedValue(value, 32);
            checkLimit(32);
            builder.push_u32(Number(value));
            bits.push(32);
            return this;
        },
        add64(value) {
            checkEncryptedValue(value, 64);
            checkLimit(64);
            builder.push_u64(BigInt(value));
            bits.push(64);
            return this;
        },
        add128(value) {
            checkEncryptedValue(value, 128);
            checkLimit(128);
            builder.push_u128(BigInt(value));
            bits.push(128);
            return this;
        },
        addAddress(value) {
            if (!isAddress(value)) {
                throw new Error('The value must be a valid address.');
            }
            checkLimit(160);
            builder.push_u160(BigInt(value));
            bits.push(160);
            return this;
        },
        add256(value) {
            checkEncryptedValue(value, 256);
            checkLimit(256);
            builder.push_u256(BigInt(value));
            bits.push(256);
            return this;
        },
        addBytes64(value) {
            if (value.length !== 64)
                throw Error('Uncorrect length of input Uint8Array, should be 64 for an ebytes64');
            const bigIntValue = bytesToBigInt(value);
            checkEncryptedValue(bigIntValue, 512);
            checkLimit(512);
            builder.push_u512(bigIntValue);
            bits.push(512);
            return this;
        },
        addBytes128(value) {
            if (value.length !== 128)
                throw Error('Uncorrect length of input Uint8Array, should be 128 for an ebytes128');
            const bigIntValue = bytesToBigInt(value);
            checkEncryptedValue(bigIntValue, 1024);
            checkLimit(1024);
            builder.push_u1024(bigIntValue);
            bits.push(1024);
            return this;
        },
        addBytes256(value) {
            if (value.length !== 256)
                throw Error('Uncorrect length of input Uint8Array, should be 256 for an ebytes256');
            const bigIntValue = bytesToBigInt(value);
            checkEncryptedValue(bigIntValue, 2048);
            checkLimit(2048);
            builder.push_u2048(bigIntValue);
            bits.push(2048);
            return this;
        },
        getBits() {
            return bits;
        },
        encrypt() {
            const getClosestPP = () => {
                const getKeys = (obj) => Object.keys(obj);
                const totalBits = bits.reduce((total, v) => total + v, 0);
                const ppTypes = getKeys(publicParams);
                const closestPP = ppTypes.find((k) => Number(k) >= totalBits);
                if (!closestPP) {
                    throw new Error(`Too many bits in provided values. Maximum is ${ppTypes[ppTypes.length - 1]}.`);
                }
                return closestPP;
            };
            const closestPP = getClosestPP();
            const pp = publicParams[closestPP].publicParams;
            const buffContract = fromHexString(contractAddress);
            const buffUser = fromHexString(userAddress);
            const buffAcl = fromHexString(aclContractAddress);
            const buffChainId = fromHexString(chainId.toString(16).padStart(64, '0'));
            const auxData = new Uint8Array(buffContract.length + buffUser.length + buffAcl.length + 32);
            auxData.set(buffContract, 0);
            auxData.set(buffUser, 20);
            auxData.set(buffAcl, 40);
            auxData.set(buffChainId, auxData.length - buffChainId.length);
            const encrypted = builder.build_with_proof_packed(pp, auxData, TFHE.ZkComputeLoad.Verify);
            ciphertextWithZKProof = encrypted.safe_serialize(SERIALIZED_SIZE_LIMIT_CIPHERTEXT);
            return ciphertextWithZKProof;
        },
    };
};

const ENCRYPTION_TYPES = {
    1: 0, // ebool takes 2 encrypted bits
    8: 2,
    16: 3,
    32: 4,
    64: 5,
    128: 6,
    160: 7,
    256: 8,
    512: 9,
    1024: 10,
    2048: 11,
};

const MAX_UINT64 = BigInt('18446744073709551615'); // 2^64 - 1
const computeHandles = (ciphertextWithZKProof, bitwidths, aclContractAddress, chainId, ciphertextVersion) => {
    // Should be identical to:
    // https://github.com/zama-ai/fhevm-backend/blob/bae00d1b0feafb63286e94acdc58dc88d9c481bf/fhevm-engine/zkproof-worker/src/verifier.rs#L301
    const blob_hash = createHash('keccak256')
        .update(Buffer.from(ciphertextWithZKProof))
        .digest();
    const aclContractAddress20Bytes = Buffer.from(fromHexString(aclContractAddress));
    const hex = chainId.toString(16).padStart(64, '0'); // 64 hex chars = 32 bytes
    const chainId32Bytes = Buffer.from(hex, 'hex');
    const handles = bitwidths.map((bitwidth, encryptionIndex) => {
        const encryptionType = ENCRYPTION_TYPES[bitwidth];
        const encryptionIndex1Byte = Buffer.from([encryptionIndex]);
        const handleHash = createHash('keccak256')
            .update(blob_hash)
            .update(encryptionIndex1Byte)
            .update(aclContractAddress20Bytes)
            .update(chainId32Bytes)
            .digest();
        const dataInput = new Uint8Array(32);
        dataInput.set(handleHash, 0);
        // Check if chainId exceeds 8 bytes
        if (BigInt(chainId) > MAX_UINT64) {
            throw new Error('ChainId exceeds maximum allowed value (8 bytes)'); // fhevm assumes chainID is only taking up to 8 bytes
        }
        const chainId8Bytes = fromHexString(hex).slice(24, 32);
        dataInput[21] = encryptionIndex;
        dataInput.set(chainId8Bytes, 22);
        dataInput[30] = encryptionType;
        dataInput[31] = ciphertextVersion;
        return dataInput;
    });
    return handles;
};

// Add type checking
const getAddress = (value) => getAddress$2(value);
const currentCiphertextVersion = () => {
    return 0;
};
function isThresholdReached$1(coprocessorSigners, recoveredAddresses, threshold) {
    const addressMap = new Map();
    recoveredAddresses.forEach((address, index) => {
        if (addressMap.has(address)) {
            const duplicateValue = address;
            throw new Error(`Duplicate coprocessor signer address found: ${duplicateValue} appears multiple times in recovered addresses`);
        }
        addressMap.set(address, index);
    });
    for (const address of recoveredAddresses) {
        if (!coprocessorSigners.includes(address)) {
            throw new Error(`Invalid address found: ${address} is not in the list of coprocessor signers`);
        }
    }
    return recoveredAddresses.length >= threshold;
}
function isFhevmRelayerInputProofResponse(json) {
    const response = json.response;
    if (typeof response !== 'object' || response === null) {
        return false;
    }
    if (!('handles' in response && Array.isArray(response.handles))) {
        return false;
    }
    if (!('signatures' in response && Array.isArray(response.signatures))) {
        return false;
    }
    return (response.signatures.every((s) => typeof s === 'string') &&
        response.handles.every((h) => typeof h === 'string'));
}
const createRelayerEncryptedInput = (aclContractAddress, verifyingContractAddressInputVerification, chainId, gatewayChainId, relayerUrl, tfheCompactPublicKey, publicParams, coprocessorSigners, thresholdCoprocessorSigners) => (contractAddress, userAddress) => {
    if (!isAddress(contractAddress)) {
        throw new Error('Contract address is not a valid address.');
    }
    if (!isAddress(userAddress)) {
        throw new Error('User address is not a valid address.');
    }
    const input = createEncryptedInput({
        aclContractAddress,
        chainId,
        tfheCompactPublicKey,
        publicParams,
        contractAddress,
        userAddress,
    });
    return {
        _input: input,
        addBool(value) {
            input.addBool(value);
            return this;
        },
        add8(value) {
            input.add8(value);
            return this;
        },
        add16(value) {
            input.add16(value);
            return this;
        },
        add32(value) {
            input.add32(value);
            return this;
        },
        add64(value) {
            input.add64(value);
            return this;
        },
        add128(value) {
            input.add128(value);
            return this;
        },
        add256(value) {
            input.add256(value);
            return this;
        },
        addAddress(value) {
            input.addAddress(value);
            return this;
        },
        getBits() {
            return input.getBits();
        },
        encrypt: async (options) => {
            const bits = input.getBits();
            const ciphertext = input.encrypt();
            const payload = {
                contractAddress: getAddress(contractAddress),
                userAddress: getAddress(userAddress),
                ciphertextWithInputVerification: toHexString(ciphertext),
                contractChainId: ('0x' + chainId.toString(16)),
            };
            const json = await fetchRelayerJsonRpcPost('INPUT_PROOF', `${relayerUrl}/v1/input-proof`, payload, options);
            if (!isFhevmRelayerInputProofResponse(json)) {
                throwRelayerInternalError('INPUT_PROOF', json);
            }
            const handles = computeHandles(ciphertext, bits, aclContractAddress, chainId, currentCiphertextVersion());
            // Note that the hex strings returned by the relayer do have have the 0x prefix
            if (json.response.handles && json.response.handles.length > 0) {
                const responseHandles = json.response.handles.map(fromHexString);
                if (handles.length != responseHandles.length) {
                    throw new Error(`Incorrect Handles list sizes: (expected) ${handles.length} != ${responseHandles.length} (received)`);
                }
                for (let index = 0; index < handles.length; index += 1) {
                    let handle = handles[index];
                    let responseHandle = responseHandles[index];
                    let expected = toHexString(handle);
                    let current = toHexString(responseHandle);
                    if (expected !== current) {
                        throw new Error(`Incorrect Handle ${index}: (expected) ${expected} != ${current} (received)`);
                    }
                }
            }
            const signatures = json.response.signatures;
            // verify signatures for inputs:
            const domain = {
                name: 'InputVerification',
                version: '1',
                chainId: gatewayChainId,
                verifyingContract: verifyingContractAddressInputVerification,
            };
            const types = {
                CiphertextVerification: [
                    { name: 'ctHandles', type: 'bytes32[]' },
                    { name: 'userAddress', type: 'address' },
                    { name: 'contractAddress', type: 'address' },
                    { name: 'contractChainId', type: 'uint256' },
                ],
            };
            const recoveredAddresses = signatures.map((signature) => {
                const sig = signature.startsWith('0x') ? signature : `0x${signature}`;
                const recoveredAddress = ethers.verifyTypedData(domain, types, {
                    ctHandles: handles,
                    userAddress,
                    contractAddress,
                    contractChainId: chainId,
                }, sig);
                return recoveredAddress;
            });
            const thresholdReached = isThresholdReached$1(coprocessorSigners, recoveredAddresses, thresholdCoprocessorSigners);
            if (!thresholdReached) {
                throw Error('Coprocessor signers threshold is not reached');
            }
            // inputProof is len(list_handles) + numCoprocessorSigners + list_handles + signatureCoprocessorSigners (1+1+NUM_HANDLES*32+65*numSigners)
            let inputProof = numberToHex(handles.length);
            const numSigners = signatures.length;
            inputProof += numberToHex(numSigners);
            const listHandlesStr = handles.map((i) => toHexString(i));
            listHandlesStr.map((handle) => (inputProof += handle));
            signatures.map((signature) => (inputProof += signature.slice(2))); // removes the '0x' prefix from the `signature` string
            return {
                handles,
                inputProof: fromHexString(inputProof),
            };
        },
    };
};

const aclABI = [
    'function isAllowedForDecryption(bytes32 handle) view returns (bool)',
];
function isThresholdReached(kmsSigners, recoveredAddresses, threshold) {
    const addressMap = new Map();
    recoveredAddresses.forEach((address, index) => {
        if (addressMap.has(address)) {
            const duplicateValue = address;
            throw new Error(`Duplicate KMS signer address found: ${duplicateValue} appears multiple times in recovered addresses`);
        }
        addressMap.set(address, index);
    });
    for (const address of recoveredAddresses) {
        if (!kmsSigners.includes(address)) {
            throw new Error(`Invalid address found: ${address} is not in the list of KMS signers`);
        }
    }
    return recoveredAddresses.length >= threshold;
}
const CiphertextType = {
    0: 'bool',
    2: 'uint256',
    3: 'uint256',
    4: 'uint256',
    5: 'uint256',
    6: 'uint256',
    7: 'address',
    8: 'uint256',
};
function deserializeDecryptedResult(handles, decryptedResult) {
    let typesList = [];
    for (const handle of handles) {
        const hexPair = handle.slice(-4, -2).toLowerCase();
        const typeDiscriminant = parseInt(hexPair, 16);
        typesList.push(typeDiscriminant);
    }
    const restoredEncoded = '0x' +
        '00'.repeat(32) + // dummy requestID (ignored)
        decryptedResult.slice(2) +
        '00'.repeat(32); // dummy empty bytes[] length (ignored)
    const abiTypes = typesList.map((t) => {
        const abiType = CiphertextType[t]; // all types are valid because this was supposedly checked already inside the `checkEncryptedBits` function
        return abiType;
    });
    const coder = new AbiCoder();
    const decoded = coder.decode(['uint256', ...abiTypes, 'bytes[]'], restoredEncoded);
    // strip dummy first/last element
    const rawValues = decoded.slice(1, 1 + typesList.length);
    let results = {};
    handles.forEach((handle, idx) => (results[handle] = rawValues[idx]));
    return results;
}
const publicDecryptRequest = (kmsSigners, thresholdSigners, gatewayChainId, verifyingContractAddress, aclContractAddress, relayerUrl, provider, options) => async (_handles) => {
    const acl = new ethers.Contract(aclContractAddress, aclABI, provider);
    let handles;
    try {
        handles = await Promise.all(_handles.map(async (_handle) => {
            const handle = typeof _handle === 'string'
                ? toHexString(fromHexString(_handle), true)
                : toHexString(_handle, true);
            const isAllowedForDecryption = await acl.isAllowedForDecryption(handle);
            if (!isAllowedForDecryption) {
                throw new Error(`Handle ${handle} is not allowed for public decryption!`);
            }
            return handle;
        }));
    }
    catch (e) {
        throw e;
    }
    // check 2048 bits limit
    checkEncryptedBits(handles);
    const payloadForRequest = {
        ciphertextHandles: handles,
    };
    const json = await fetchRelayerJsonRpcPost('PUBLIC_DECRYPT', `${relayerUrl}/v1/public-decrypt`, payloadForRequest, options);
    // verify signatures on decryption:
    const domain = {
        name: 'Decryption',
        version: '1',
        chainId: gatewayChainId,
        verifyingContract: verifyingContractAddress,
    };
    const types = {
        PublicDecryptVerification: [
            { name: 'ctHandles', type: 'bytes32[]' },
            { name: 'decryptedResult', type: 'bytes' },
        ],
    };
    const result = json.response[0];
    const decryptedResult = result.decrypted_value.startsWith('0x')
        ? result.decrypted_value
        : `0x${result.decrypted_value}`;
    const signatures = result.signatures;
    const recoveredAddresses = signatures.map((signature) => {
        const sig = signature.startsWith('0x') ? signature : `0x${signature}`;
        const recoveredAddress = ethers.verifyTypedData(domain, types, { ctHandles: handles, decryptedResult }, sig);
        return recoveredAddress;
    });
    const thresholdReached = isThresholdReached(kmsSigners, recoveredAddresses, thresholdSigners);
    if (!thresholdReached) {
        throw Error('KMS signers threshold is not reached');
    }
    const results = deserializeDecryptedResult(handles, decryptedResult);
    return results;
};

/**
 * Creates an EIP712 structure specifically for user decrypt requests
 *
 * @param gatewayChainId - The chain ID of the gateway
 * @param verifyingContract - The address of the contract that will verify the signature
 * @param publicKey - The user's public key as a hex string or Uint8Array
 * @param contractAddresses - Array of contract addresses that can access the decryption
 * @param contractsChainId - The chain ID where the contracts are deployed
 * @param startTimestamp - The timestamp when the decryption permission becomes valid
 * @param durationDays - How many days the decryption permission remains valid
 * @returns EIP712 typed data structure for user decryption
 */
const createEIP712 = (verifyingContract, contractsChainId) => (publicKey, contractAddresses, startTimestamp, durationDays, delegatedAccount) => {
    if (delegatedAccount && !isAddress(delegatedAccount))
        throw new Error('Invalid delegated account.');
    if (!isAddress(verifyingContract)) {
        throw new Error('Invalid verifying contract address.');
    }
    if (!contractAddresses.every((c) => isAddress(c))) {
        throw new Error('Invalid contract address.');
    }
    // Format the public key based on its type
    const formattedPublicKey = typeof publicKey === 'string'
        ? publicKey.startsWith('0x')
            ? publicKey
            : `0x${publicKey}`
        : publicKey;
    // Convert timestamps to strings if they're bigints
    const formattedStartTimestamp = typeof startTimestamp === 'number'
        ? startTimestamp.toString()
        : startTimestamp;
    const formattedDurationDays = typeof durationDays === 'number' ? durationDays.toString() : durationDays;
    const EIP712Domain = [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
    ];
    const domain = {
        name: 'Decryption',
        version: '1',
        chainId: contractsChainId,
        verifyingContract,
    };
    if (delegatedAccount) {
        return {
            types: {
                EIP712Domain,
                DelegatedUserDecryptRequestVerification: [
                    { name: 'publicKey', type: 'bytes' },
                    { name: 'contractAddresses', type: 'address[]' },
                    { name: 'contractsChainId', type: 'uint256' },
                    { name: 'startTimestamp', type: 'uint256' },
                    { name: 'durationDays', type: 'uint256' },
                    {
                        name: 'delegatedAccount',
                        type: 'address',
                    },
                ],
            },
            primaryType: 'DelegatedUserDecryptRequestVerification',
            domain,
            message: {
                publicKey: formattedPublicKey,
                contractAddresses,
                contractsChainId,
                startTimestamp: formattedStartTimestamp,
                durationDays: formattedDurationDays,
                delegatedAccount: delegatedAccount,
            },
        };
    }
    return {
        types: {
            EIP712Domain,
            UserDecryptRequestVerification: [
                { name: 'publicKey', type: 'bytes' },
                { name: 'contractAddresses', type: 'address[]' },
                { name: 'contractsChainId', type: 'uint256' },
                { name: 'startTimestamp', type: 'uint256' },
                { name: 'durationDays', type: 'uint256' },
            ],
        },
        primaryType: 'UserDecryptRequestVerification',
        domain,
        message: {
            publicKey: formattedPublicKey,
            contractAddresses,
            contractsChainId,
            startTimestamp: formattedStartTimestamp,
            durationDays: formattedDurationDays,
        },
    };
};
const generateKeypair = () => {
    const keypair = TKMS.ml_kem_pke_keygen();
    return {
        publicKey: toHexString(TKMS.ml_kem_pke_pk_to_u8vec(TKMS.ml_kem_pke_get_pk(keypair))),
        privateKey: toHexString(TKMS.ml_kem_pke_sk_to_u8vec(keypair)),
    };
};

global.fetch = fetchRetry(global.fetch, { retries: 5, retryDelay: 500 });
const SepoliaConfig = {
    // ACL_CONTRACT_ADDRESS (FHEVM Host chain)
    aclContractAddress: '0x687820221192C5B662b25367F70076A37bc79b6c',
    // KMS_VERIFIER_CONTRACT_ADDRESS (FHEVM Host chain)
    kmsContractAddress: '0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC',
    // INPUT_VERIFIER_CONTRACT_ADDRESS (FHEVM Host chain)
    inputVerifierContractAddress: '0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4',
    // DECRYPTION_ADDRESS (Gateway chain)
    verifyingContractAddressDecryption: '0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1',
    // INPUT_VERIFICATION_ADDRESS (Gateway chain)
    verifyingContractAddressInputVerification: '0x7048C39f048125eDa9d678AEbaDfB22F7900a29F',
    // FHEVM Host chain id
    chainId: 11155111,
    // Gateway chain id
    gatewayChainId: 55815,
    // Optional RPC provider to host chain
    network: 'https://eth-sepolia.public.blastapi.io',
    // Relayer URL
    relayerUrl: 'https://relayer.testnet.zama.cloud',
};
const createInstance = async (config) => {
    const { verifyingContractAddressDecryption, verifyingContractAddressInputVerification, publicKey, kmsContractAddress, aclContractAddress, gatewayChainId, } = config;
    if (!kmsContractAddress || !isAddress(kmsContractAddress)) {
        throw new Error('KMS contract address is not valid or empty');
    }
    if (!verifyingContractAddressDecryption ||
        !isAddress(verifyingContractAddressDecryption)) {
        throw new Error('Verifying contract for Decryption address is not valid or empty');
    }
    if (!verifyingContractAddressInputVerification ||
        !isAddress(verifyingContractAddressInputVerification)) {
        throw new Error('Verifying contract for InputVerification address is not valid or empty');
    }
    if (!aclContractAddress || !isAddress(aclContractAddress)) {
        throw new Error('ACL contract address is not valid or empty');
    }
    if (publicKey && !(publicKey.data instanceof Uint8Array))
        throw new Error('publicKey must be a Uint8Array');
    const provider = getProvider(config);
    if (!provider) {
        throw new Error('No network has been provided!');
    }
    const chainId = await getChainId(provider, config);
    const publicKeyData = await getTfheCompactPublicKey(config);
    const publicParamsData = await getPublicParams(config);
    const kmsSigners = await getKMSSigners(provider, config);
    const thresholdKMSSigners = await getKMSSignersThreshold(provider, config);
    const coprocessorSigners = await getCoprocessorSigners(provider, config);
    const thresholdCoprocessorSigners = await getCoprocessorSignersThreshold(provider, config);
    return {
        createEncryptedInput: createRelayerEncryptedInput(aclContractAddress, verifyingContractAddressInputVerification, chainId, gatewayChainId, cleanURL(config.relayerUrl), publicKeyData.publicKey, publicParamsData, coprocessorSigners, thresholdCoprocessorSigners),
        generateKeypair,
        createEIP712: createEIP712(verifyingContractAddressDecryption, chainId),
        publicDecrypt: publicDecryptRequest(kmsSigners, thresholdKMSSigners, gatewayChainId, verifyingContractAddressDecryption, aclContractAddress, cleanURL(config.relayerUrl), provider),
        userDecrypt: userDecryptRequest(kmsSigners, gatewayChainId, chainId, verifyingContractAddressDecryption, aclContractAddress, cleanURL(config.relayerUrl), provider),
        getPublicKey: () => publicKeyData.publicKey
            ? {
                publicKey: publicKeyData.publicKey.safe_serialize(SERIALIZED_SIZE_LIMIT_PK),
                publicKeyId: publicKeyData.publicKeyId,
            }
            : null,
        getPublicParams: (bits) => {
            if (publicParamsData[bits]) {
                return {
                    publicParams: publicParamsData[bits].publicParams.safe_serialize(SERIALIZED_SIZE_LIMIT_CRS),
                    publicParamsId: publicParamsData[bits].publicParamsId,
                };
            }
            return null;
        },
    };
};

let initialized = false;
const initSDK = async ({ tfheParams, kmsParams, thread, } = {}) => {
    if (thread == null)
        thread = navigator.hardwareConcurrency;
    let supportsThreads = await threads();
    if (!supportsThreads) {
        console.warn('This browser does not support threads. Verify that your server returns correct headers:\n', "'Cross-Origin-Opener-Policy': 'same-origin'\n", "'Cross-Origin-Embedder-Policy': 'require-corp'");
        thread = undefined;
    }
    if (!initialized) {
        await __wbg_init$1({ module_or_path: tfheParams });
        await __wbg_init({
            module_or_path: kmsParams,
        });
        if (thread) {
            init_panic_hook();
            await initThreadPool(thread);
        }
        initialized = true;
    }
    return true;
};

// ESM explicit named re-export is required.
window.TFHE = {
    default: __wbg_init$1,
    initThreadPool,
    init_panic_hook,
    TfheCompactPublicKey: TfheCompactPublicKey,
    CompactPkeCrs: CompactPkeCrs,
    CompactCiphertextList: CompactCiphertextList,
    ZkComputeLoad: ZkComputeLoad,
};
window.TKMS = {
    default: __wbg_init,
    u8vec_to_ml_kem_pke_pk,
    u8vec_to_ml_kem_pke_sk,
    new_client,
    new_server_id_addr,
    process_user_decryption_resp_from_js,
    ml_kem_pke_keygen,
    ml_kem_pke_pk_to_u8vec,
    ml_kem_pke_sk_to_u8vec,
    ml_kem_pke_get_pk,
};

export { ENCRYPTION_TYPES, SepoliaConfig, createEIP712, createInstance, generateKeypair, getErrorCauseCode, getErrorCauseStatus, initSDK };
