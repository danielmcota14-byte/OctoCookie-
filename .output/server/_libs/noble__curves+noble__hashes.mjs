import { r as __exportAll } from "../_runtime.mjs";
import * as nc from "node:crypto";
//#region node_modules/@noble/hashes/esm/_assert.js
function number(n) {
	if (!Number.isSafeInteger(n) || n < 0) throw new Error(`Wrong positive integer: ${n}`);
}
function bytes(b, ...lengths) {
	if (!(b instanceof Uint8Array)) throw new Error("Expected Uint8Array");
	if (lengths.length > 0 && !lengths.includes(b.length)) throw new Error(`Expected Uint8Array of length ${lengths}, not of length=${b.length}`);
}
function hash(hash) {
	if (typeof hash !== "function" || typeof hash.create !== "function") throw new Error("Hash should be wrapped by utils.wrapConstructor");
	number(hash.outputLen);
	number(hash.blockLen);
}
function exists(instance, checkFinished = true) {
	if (instance.destroyed) throw new Error("Hash instance has been destroyed");
	if (checkFinished && instance.finished) throw new Error("Hash#digest() has already been called");
}
function output(out, instance) {
	bytes(out);
	const min = instance.outputLen;
	if (out.length < min) throw new Error(`digestInto() expects output buffer of length at least ${min}`);
}
//#endregion
//#region node_modules/@noble/hashes/esm/cryptoNode.js
var crypto = nc && typeof nc === "object" && "webcrypto" in nc ? nc.webcrypto : void 0;
//#endregion
//#region node_modules/@noble/hashes/esm/utils.js
/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
var u8a$1 = (a) => a instanceof Uint8Array;
var u32 = (arr) => new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
var createView = (arr) => new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
var rotr = (word, shift) => word << 32 - shift | word >>> shift;
if (!(new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68)) throw new Error("Non little-endian hardware is not supported");
/**
* @example utf8ToBytes('abc') // new Uint8Array([97, 98, 99])
*/
function utf8ToBytes$1(str) {
	if (typeof str !== "string") throw new Error(`utf8ToBytes expected string, got ${typeof str}`);
	return new Uint8Array(new TextEncoder().encode(str));
}
/**
* Normalizes (non-hex) string or Uint8Array to Uint8Array.
* Warning: when Uint8Array is passed, it would NOT get copied.
* Keep in mind for future mutable operations.
*/
function toBytes(data) {
	if (typeof data === "string") data = utf8ToBytes$1(data);
	if (!u8a$1(data)) throw new Error(`expected Uint8Array, got ${typeof data}`);
	return data;
}
/**
* Copies several Uint8Arrays into one.
*/
function concatBytes$1(...arrays) {
	const r = new Uint8Array(arrays.reduce((sum, a) => sum + a.length, 0));
	let pad = 0;
	arrays.forEach((a) => {
		if (!u8a$1(a)) throw new Error("Uint8Array expected");
		r.set(a, pad);
		pad += a.length;
	});
	return r;
}
var Hash = class {
	clone() {
		return this._cloneInto();
	}
};
({}).toString;
function wrapConstructor(hashCons) {
	const hashC = (msg) => hashCons().update(toBytes(msg)).digest();
	const tmp = hashCons();
	hashC.outputLen = tmp.outputLen;
	hashC.blockLen = tmp.blockLen;
	hashC.create = () => hashCons();
	return hashC;
}
/**
* Secure PRNG. Uses `crypto.getRandomValues`, which defers to OS.
*/
function randomBytes(bytesLength = 32) {
	if (crypto && typeof crypto.getRandomValues === "function") return crypto.getRandomValues(new Uint8Array(bytesLength));
	throw new Error("crypto.getRandomValues must be defined");
}
//#endregion
//#region node_modules/@noble/hashes/esm/_sha2.js
function setBigUint64(view, byteOffset, value, isLE) {
	if (typeof view.setBigUint64 === "function") return view.setBigUint64(byteOffset, value, isLE);
	const _32n = BigInt(32);
	const _u32_max = BigInt(4294967295);
	const wh = Number(value >> _32n & _u32_max);
	const wl = Number(value & _u32_max);
	const h = isLE ? 4 : 0;
	const l = isLE ? 0 : 4;
	view.setUint32(byteOffset + h, wh, isLE);
	view.setUint32(byteOffset + l, wl, isLE);
}
var SHA2 = class extends Hash {
	constructor(blockLen, outputLen, padOffset, isLE) {
		super();
		this.blockLen = blockLen;
		this.outputLen = outputLen;
		this.padOffset = padOffset;
		this.isLE = isLE;
		this.finished = false;
		this.length = 0;
		this.pos = 0;
		this.destroyed = false;
		this.buffer = new Uint8Array(blockLen);
		this.view = createView(this.buffer);
	}
	update(data) {
		exists(this);
		const { view, buffer, blockLen } = this;
		data = toBytes(data);
		const len = data.length;
		for (let pos = 0; pos < len;) {
			const take = Math.min(blockLen - this.pos, len - pos);
			if (take === blockLen) {
				const dataView = createView(data);
				for (; blockLen <= len - pos; pos += blockLen) this.process(dataView, pos);
				continue;
			}
			buffer.set(data.subarray(pos, pos + take), this.pos);
			this.pos += take;
			pos += take;
			if (this.pos === blockLen) {
				this.process(view, 0);
				this.pos = 0;
			}
		}
		this.length += data.length;
		this.roundClean();
		return this;
	}
	digestInto(out) {
		exists(this);
		output(out, this);
		this.finished = true;
		const { buffer, view, blockLen, isLE } = this;
		let { pos } = this;
		buffer[pos++] = 128;
		this.buffer.subarray(pos).fill(0);
		if (this.padOffset > blockLen - pos) {
			this.process(view, 0);
			pos = 0;
		}
		for (let i = pos; i < blockLen; i++) buffer[i] = 0;
		setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE);
		this.process(view, 0);
		const oview = createView(out);
		const len = this.outputLen;
		if (len % 4) throw new Error("_sha2: outputLen should be aligned to 32bit");
		const outLen = len / 4;
		const state = this.get();
		if (outLen > state.length) throw new Error("_sha2: outputLen bigger than state");
		for (let i = 0; i < outLen; i++) oview.setUint32(4 * i, state[i], isLE);
	}
	digest() {
		const { buffer, outputLen } = this;
		this.digestInto(buffer);
		const res = buffer.slice(0, outputLen);
		this.destroy();
		return res;
	}
	_cloneInto(to) {
		to || (to = new this.constructor());
		to.set(...this.get());
		const { blockLen, buffer, length, finished, destroyed, pos } = this;
		to.length = length;
		to.pos = pos;
		to.finished = finished;
		to.destroyed = destroyed;
		if (length % blockLen) to.buffer.set(buffer);
		return to;
	}
};
//#endregion
//#region node_modules/@noble/hashes/esm/sha256.js
var Chi = (a, b, c) => a & b ^ ~a & c;
var Maj = (a, b, c) => a & b ^ a & c ^ b & c;
var SHA256_K = /* @__PURE__ */ new Uint32Array([
	1116352408,
	1899447441,
	3049323471,
	3921009573,
	961987163,
	1508970993,
	2453635748,
	2870763221,
	3624381080,
	310598401,
	607225278,
	1426881987,
	1925078388,
	2162078206,
	2614888103,
	3248222580,
	3835390401,
	4022224774,
	264347078,
	604807628,
	770255983,
	1249150122,
	1555081692,
	1996064986,
	2554220882,
	2821834349,
	2952996808,
	3210313671,
	3336571891,
	3584528711,
	113926993,
	338241895,
	666307205,
	773529912,
	1294757372,
	1396182291,
	1695183700,
	1986661051,
	2177026350,
	2456956037,
	2730485921,
	2820302411,
	3259730800,
	3345764771,
	3516065817,
	3600352804,
	4094571909,
	275423344,
	430227734,
	506948616,
	659060556,
	883997877,
	958139571,
	1322822218,
	1537002063,
	1747873779,
	1955562222,
	2024104815,
	2227730452,
	2361852424,
	2428436474,
	2756734187,
	3204031479,
	3329325298
]);
var IV = /* @__PURE__ */ new Uint32Array([
	1779033703,
	3144134277,
	1013904242,
	2773480762,
	1359893119,
	2600822924,
	528734635,
	1541459225
]);
var SHA256_W = /* @__PURE__ */ new Uint32Array(64);
var SHA256 = class extends SHA2 {
	constructor() {
		super(64, 32, 8, false);
		this.A = IV[0] | 0;
		this.B = IV[1] | 0;
		this.C = IV[2] | 0;
		this.D = IV[3] | 0;
		this.E = IV[4] | 0;
		this.F = IV[5] | 0;
		this.G = IV[6] | 0;
		this.H = IV[7] | 0;
	}
	get() {
		const { A, B, C, D, E, F, G, H } = this;
		return [
			A,
			B,
			C,
			D,
			E,
			F,
			G,
			H
		];
	}
	set(A, B, C, D, E, F, G, H) {
		this.A = A | 0;
		this.B = B | 0;
		this.C = C | 0;
		this.D = D | 0;
		this.E = E | 0;
		this.F = F | 0;
		this.G = G | 0;
		this.H = H | 0;
	}
	process(view, offset) {
		for (let i = 0; i < 16; i++, offset += 4) SHA256_W[i] = view.getUint32(offset, false);
		for (let i = 16; i < 64; i++) {
			const W15 = SHA256_W[i - 15];
			const W2 = SHA256_W[i - 2];
			const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
			const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
			SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
		}
		let { A, B, C, D, E, F, G, H } = this;
		for (let i = 0; i < 64; i++) {
			const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
			const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
			const T2 = (rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22)) + Maj(A, B, C) | 0;
			H = G;
			G = F;
			F = E;
			E = D + T1 | 0;
			D = C;
			C = B;
			B = A;
			A = T1 + T2 | 0;
		}
		A = A + this.A | 0;
		B = B + this.B | 0;
		C = C + this.C | 0;
		D = D + this.D | 0;
		E = E + this.E | 0;
		F = F + this.F | 0;
		G = G + this.G | 0;
		H = H + this.H | 0;
		this.set(A, B, C, D, E, F, G, H);
	}
	roundClean() {
		SHA256_W.fill(0);
	}
	destroy() {
		this.set(0, 0, 0, 0, 0, 0, 0, 0);
		this.buffer.fill(0);
	}
};
/**
* SHA2-256 hash function
* @param message - data that would be hashed
*/
var sha256 = /* @__PURE__ */ wrapConstructor(() => new SHA256());
//#endregion
//#region node_modules/@noble/hashes/esm/hmac.js
var HMAC = class extends Hash {
	constructor(hash$1, _key) {
		super();
		this.finished = false;
		this.destroyed = false;
		hash(hash$1);
		const key = toBytes(_key);
		this.iHash = hash$1.create();
		if (typeof this.iHash.update !== "function") throw new Error("Expected instance of class which extends utils.Hash");
		this.blockLen = this.iHash.blockLen;
		this.outputLen = this.iHash.outputLen;
		const blockLen = this.blockLen;
		const pad = new Uint8Array(blockLen);
		pad.set(key.length > blockLen ? hash$1.create().update(key).digest() : key);
		for (let i = 0; i < pad.length; i++) pad[i] ^= 54;
		this.iHash.update(pad);
		this.oHash = hash$1.create();
		for (let i = 0; i < pad.length; i++) pad[i] ^= 106;
		this.oHash.update(pad);
		pad.fill(0);
	}
	update(buf) {
		exists(this);
		this.iHash.update(buf);
		return this;
	}
	digestInto(out) {
		exists(this);
		bytes(out, this.outputLen);
		this.finished = true;
		this.iHash.digestInto(out);
		this.oHash.update(out);
		this.oHash.digestInto(out);
		this.destroy();
	}
	digest() {
		const out = new Uint8Array(this.oHash.outputLen);
		this.digestInto(out);
		return out;
	}
	_cloneInto(to) {
		to || (to = Object.create(Object.getPrototypeOf(this), {}));
		const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
		to = to;
		to.finished = finished;
		to.destroyed = destroyed;
		to.blockLen = blockLen;
		to.outputLen = outputLen;
		to.oHash = oHash._cloneInto(to.oHash);
		to.iHash = iHash._cloneInto(to.iHash);
		return to;
	}
	destroy() {
		this.destroyed = true;
		this.oHash.destroy();
		this.iHash.destroy();
	}
};
/**
* HMAC: RFC2104 message authentication code.
* @param hash - function that would be used e.g. sha256
* @param key - message key
* @param message - message data
*/
var hmac = (hash, key, message) => new HMAC(hash, key).update(message).digest();
hmac.create = (hash, key) => new HMAC(hash, key);
//#endregion
//#region node_modules/@noble/curves/esm/abstract/utils.js
var utils_exports = /* @__PURE__ */ __exportAll({
	bitGet: () => bitGet,
	bitLen: () => bitLen,
	bitMask: () => bitMask,
	bitSet: () => bitSet,
	bytesToHex: () => bytesToHex,
	bytesToNumberBE: () => bytesToNumberBE,
	bytesToNumberLE: () => bytesToNumberLE,
	concatBytes: () => concatBytes,
	createHmacDrbg: () => createHmacDrbg,
	ensureBytes: () => ensureBytes,
	equalBytes: () => equalBytes,
	hexToBytes: () => hexToBytes,
	hexToNumber: () => hexToNumber,
	numberToBytesBE: () => numberToBytesBE,
	numberToBytesLE: () => numberToBytesLE,
	numberToHexUnpadded: () => numberToHexUnpadded,
	numberToVarBytesBE: () => numberToVarBytesBE,
	utf8ToBytes: () => utf8ToBytes,
	validateObject: () => validateObject
});
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
var _0n$3 = BigInt(0);
var _1n$4 = BigInt(1);
var _2n$2 = BigInt(2);
var u8a = (a) => a instanceof Uint8Array;
var hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
/**
* @example bytesToHex(Uint8Array.from([0xca, 0xfe, 0x01, 0x23])) // 'cafe0123'
*/
function bytesToHex(bytes) {
	if (!u8a(bytes)) throw new Error("Uint8Array expected");
	let hex = "";
	for (let i = 0; i < bytes.length; i++) hex += hexes[bytes[i]];
	return hex;
}
function numberToHexUnpadded(num) {
	const hex = num.toString(16);
	return hex.length & 1 ? `0${hex}` : hex;
}
function hexToNumber(hex) {
	if (typeof hex !== "string") throw new Error("hex string expected, got " + typeof hex);
	return BigInt(hex === "" ? "0" : `0x${hex}`);
}
/**
* @example hexToBytes('cafe0123') // Uint8Array.from([0xca, 0xfe, 0x01, 0x23])
*/
function hexToBytes(hex) {
	if (typeof hex !== "string") throw new Error("hex string expected, got " + typeof hex);
	const len = hex.length;
	if (len % 2) throw new Error("padded hex string expected, got unpadded hex of length " + len);
	const array = new Uint8Array(len / 2);
	for (let i = 0; i < array.length; i++) {
		const j = i * 2;
		const hexByte = hex.slice(j, j + 2);
		const byte = Number.parseInt(hexByte, 16);
		if (Number.isNaN(byte) || byte < 0) throw new Error("Invalid byte sequence");
		array[i] = byte;
	}
	return array;
}
function bytesToNumberBE(bytes) {
	return hexToNumber(bytesToHex(bytes));
}
function bytesToNumberLE(bytes) {
	if (!u8a(bytes)) throw new Error("Uint8Array expected");
	return hexToNumber(bytesToHex(Uint8Array.from(bytes).reverse()));
}
function numberToBytesBE(n, len) {
	return hexToBytes(n.toString(16).padStart(len * 2, "0"));
}
function numberToBytesLE(n, len) {
	return numberToBytesBE(n, len).reverse();
}
function numberToVarBytesBE(n) {
	return hexToBytes(numberToHexUnpadded(n));
}
/**
* Takes hex string or Uint8Array, converts to Uint8Array.
* Validates output length.
* Will throw error for other types.
* @param title descriptive title for an error e.g. 'private key'
* @param hex hex string or Uint8Array
* @param expectedLength optional, will compare to result array's length
* @returns
*/
function ensureBytes(title, hex, expectedLength) {
	let res;
	if (typeof hex === "string") try {
		res = hexToBytes(hex);
	} catch (e) {
		throw new Error(`${title} must be valid hex string, got "${hex}". Cause: ${e}`);
	}
	else if (u8a(hex)) res = Uint8Array.from(hex);
	else throw new Error(`${title} must be hex string or Uint8Array`);
	const len = res.length;
	if (typeof expectedLength === "number" && len !== expectedLength) throw new Error(`${title} expected ${expectedLength} bytes, got ${len}`);
	return res;
}
/**
* Copies several Uint8Arrays into one.
*/
function concatBytes(...arrays) {
	const r = new Uint8Array(arrays.reduce((sum, a) => sum + a.length, 0));
	let pad = 0;
	arrays.forEach((a) => {
		if (!u8a(a)) throw new Error("Uint8Array expected");
		r.set(a, pad);
		pad += a.length;
	});
	return r;
}
function equalBytes(b1, b2) {
	if (b1.length !== b2.length) return false;
	for (let i = 0; i < b1.length; i++) if (b1[i] !== b2[i]) return false;
	return true;
}
/**
* @example utf8ToBytes('abc') // new Uint8Array([97, 98, 99])
*/
function utf8ToBytes(str) {
	if (typeof str !== "string") throw new Error(`utf8ToBytes expected string, got ${typeof str}`);
	return new Uint8Array(new TextEncoder().encode(str));
}
/**
* Calculates amount of bits in a bigint.
* Same as `n.toString(2).length`
*/
function bitLen(n) {
	let len = 0;
	for (; n > _0n$3; n >>= _1n$4, len += 1);
	return len;
}
/**
* Gets single bit at position.
* NOTE: first bit position is 0 (same as arrays)
* Same as `!!+Array.from(n.toString(2)).reverse()[pos]`
*/
function bitGet(n, pos) {
	return n >> BigInt(pos) & _1n$4;
}
/**
* Sets single bit at position.
*/
var bitSet = (n, pos, value) => {
	return n | (value ? _1n$4 : _0n$3) << BigInt(pos);
};
/**
* Calculate mask for N bits. Not using ** operator with bigints because of old engines.
* Same as BigInt(`0b${Array(i).fill('1').join('')}`)
*/
var bitMask = (n) => (_2n$2 << BigInt(n - 1)) - _1n$4;
var u8n = (data) => new Uint8Array(data);
var u8fr = (arr) => Uint8Array.from(arr);
/**
* Minimal HMAC-DRBG from NIST 800-90 for RFC6979 sigs.
* @returns function that will call DRBG until 2nd arg returns something meaningful
* @example
*   const drbg = createHmacDRBG<Key>(32, 32, hmac);
*   drbg(seed, bytesToKey); // bytesToKey must return Key or undefined
*/
function createHmacDrbg(hashLen, qByteLen, hmacFn) {
	if (typeof hashLen !== "number" || hashLen < 2) throw new Error("hashLen must be a number");
	if (typeof qByteLen !== "number" || qByteLen < 2) throw new Error("qByteLen must be a number");
	if (typeof hmacFn !== "function") throw new Error("hmacFn must be a function");
	let v = u8n(hashLen);
	let k = u8n(hashLen);
	let i = 0;
	const reset = () => {
		v.fill(1);
		k.fill(0);
		i = 0;
	};
	const h = (...b) => hmacFn(k, v, ...b);
	const reseed = (seed = u8n()) => {
		k = h(u8fr([0]), seed);
		v = h();
		if (seed.length === 0) return;
		k = h(u8fr([1]), seed);
		v = h();
	};
	const gen = () => {
		if (i++ >= 1e3) throw new Error("drbg: tried 1000 values");
		let len = 0;
		const out = [];
		while (len < qByteLen) {
			v = h();
			const sl = v.slice();
			out.push(sl);
			len += v.length;
		}
		return concatBytes(...out);
	};
	const genUntil = (seed, pred) => {
		reset();
		reseed(seed);
		let res = void 0;
		while (!(res = pred(gen()))) reseed();
		reset();
		return res;
	};
	return genUntil;
}
var validatorFns = {
	bigint: (val) => typeof val === "bigint",
	function: (val) => typeof val === "function",
	boolean: (val) => typeof val === "boolean",
	string: (val) => typeof val === "string",
	stringOrUint8Array: (val) => typeof val === "string" || val instanceof Uint8Array,
	isSafeInteger: (val) => Number.isSafeInteger(val),
	array: (val) => Array.isArray(val),
	field: (val, object) => object.Fp.isValid(val),
	hash: (val) => typeof val === "function" && Number.isSafeInteger(val.outputLen)
};
function validateObject(object, validators, optValidators = {}) {
	const checkField = (fieldName, type, isOptional) => {
		const checkVal = validatorFns[type];
		if (typeof checkVal !== "function") throw new Error(`Invalid validator "${type}", expected function`);
		const val = object[fieldName];
		if (isOptional && val === void 0) return;
		if (!checkVal(val, object)) throw new Error(`Invalid param ${String(fieldName)}=${val} (${typeof val}), expected ${type}`);
	};
	for (const [fieldName, type] of Object.entries(validators)) checkField(fieldName, type, false);
	for (const [fieldName, type] of Object.entries(optValidators)) checkField(fieldName, type, true);
	return object;
}
//#endregion
//#region node_modules/@noble/curves/esm/abstract/modular.js
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
var _0n$2 = BigInt(0);
var _1n$3 = BigInt(1);
var _2n$1 = BigInt(2);
var _3n$1 = BigInt(3);
var _4n = BigInt(4);
var _5n = BigInt(5);
var _8n = BigInt(8);
var _9n = BigInt(9);
var _16n = BigInt(16);
function mod(a, b) {
	const result = a % b;
	return result >= _0n$2 ? result : b + result;
}
/**
* Efficiently raise num to power and do modular division.
* Unsafe in some contexts: uses ladder, so can expose bigint bits.
* @example
* pow(2n, 6n, 11n) // 64n % 11n == 9n
*/
function pow(num, power, modulo) {
	if (modulo <= _0n$2 || power < _0n$2) throw new Error("Expected power/modulo > 0");
	if (modulo === _1n$3) return _0n$2;
	let res = _1n$3;
	while (power > _0n$2) {
		if (power & _1n$3) res = res * num % modulo;
		num = num * num % modulo;
		power >>= _1n$3;
	}
	return res;
}
function pow2(x, power, modulo) {
	let res = x;
	while (power-- > _0n$2) {
		res *= res;
		res %= modulo;
	}
	return res;
}
function invert(number, modulo) {
	if (number === _0n$2 || modulo <= _0n$2) throw new Error(`invert: expected positive integers, got n=${number} mod=${modulo}`);
	let a = mod(number, modulo);
	let b = modulo;
	let x = _0n$2, y = _1n$3, u = _1n$3, v = _0n$2;
	while (a !== _0n$2) {
		const q = b / a;
		const r = b % a;
		const m = x - u * q;
		const n = y - v * q;
		b = a, a = r, x = u, y = v, u = m, v = n;
	}
	if (b !== _1n$3) throw new Error("invert: does not exist");
	return mod(x, modulo);
}
/**
* Tonelli-Shanks square root search algorithm.
* 1. https://eprint.iacr.org/2012/685.pdf (page 12)
* 2. Square Roots from 1; 24, 51, 10 to Dan Shanks
* Will start an infinite loop if field order P is not prime.
* @param P field order
* @returns function that takes field Fp (created from P) and number n
*/
function tonelliShanks(P) {
	const legendreC = (P - _1n$3) / _2n$1;
	let Q, S, Z;
	for (Q = P - _1n$3, S = 0; Q % _2n$1 === _0n$2; Q /= _2n$1, S++);
	for (Z = _2n$1; Z < P && pow(Z, legendreC, P) !== P - _1n$3; Z++);
	if (S === 1) {
		const p1div4 = (P + _1n$3) / _4n;
		return function tonelliFast(Fp, n) {
			const root = Fp.pow(n, p1div4);
			if (!Fp.eql(Fp.sqr(root), n)) throw new Error("Cannot find square root");
			return root;
		};
	}
	const Q1div2 = (Q + _1n$3) / _2n$1;
	return function tonelliSlow(Fp, n) {
		if (Fp.pow(n, legendreC) === Fp.neg(Fp.ONE)) throw new Error("Cannot find square root");
		let r = S;
		let g = Fp.pow(Fp.mul(Fp.ONE, Z), Q);
		let x = Fp.pow(n, Q1div2);
		let b = Fp.pow(n, Q);
		while (!Fp.eql(b, Fp.ONE)) {
			if (Fp.eql(b, Fp.ZERO)) return Fp.ZERO;
			let m = 1;
			for (let t2 = Fp.sqr(b); m < r; m++) {
				if (Fp.eql(t2, Fp.ONE)) break;
				t2 = Fp.sqr(t2);
			}
			const ge = Fp.pow(g, _1n$3 << BigInt(r - m - 1));
			g = Fp.sqr(ge);
			x = Fp.mul(x, ge);
			b = Fp.mul(b, g);
			r = m;
		}
		return x;
	};
}
function FpSqrt(P) {
	if (P % _4n === _3n$1) {
		const p1div4 = (P + _1n$3) / _4n;
		return function sqrt3mod4(Fp, n) {
			const root = Fp.pow(n, p1div4);
			if (!Fp.eql(Fp.sqr(root), n)) throw new Error("Cannot find square root");
			return root;
		};
	}
	if (P % _8n === _5n) {
		const c1 = (P - _5n) / _8n;
		return function sqrt5mod8(Fp, n) {
			const n2 = Fp.mul(n, _2n$1);
			const v = Fp.pow(n2, c1);
			const nv = Fp.mul(n, v);
			const i = Fp.mul(Fp.mul(nv, _2n$1), v);
			const root = Fp.mul(nv, Fp.sub(i, Fp.ONE));
			if (!Fp.eql(Fp.sqr(root), n)) throw new Error("Cannot find square root");
			return root;
		};
	}
	if (P % _16n === _9n) {}
	return tonelliShanks(P);
}
var FIELD_FIELDS = [
	"create",
	"isValid",
	"is0",
	"neg",
	"inv",
	"sqrt",
	"sqr",
	"eql",
	"add",
	"sub",
	"mul",
	"pow",
	"div",
	"addN",
	"subN",
	"mulN",
	"sqrN"
];
function validateField(field) {
	return validateObject(field, FIELD_FIELDS.reduce((map, val) => {
		map[val] = "function";
		return map;
	}, {
		ORDER: "bigint",
		MASK: "bigint",
		BYTES: "isSafeInteger",
		BITS: "isSafeInteger"
	}));
}
/**
* Same as `pow` but for Fp: non-constant-time.
* Unsafe in some contexts: uses ladder, so can expose bigint bits.
*/
function FpPow(f, num, power) {
	if (power < _0n$2) throw new Error("Expected power > 0");
	if (power === _0n$2) return f.ONE;
	if (power === _1n$3) return num;
	let p = f.ONE;
	let d = num;
	while (power > _0n$2) {
		if (power & _1n$3) p = f.mul(p, d);
		d = f.sqr(d);
		power >>= _1n$3;
	}
	return p;
}
/**
* Efficiently invert an array of Field elements.
* `inv(0)` will return `undefined` here: make sure to throw an error.
*/
function FpInvertBatch(f, nums) {
	const tmp = new Array(nums.length);
	const lastMultiplied = nums.reduce((acc, num, i) => {
		if (f.is0(num)) return acc;
		tmp[i] = acc;
		return f.mul(acc, num);
	}, f.ONE);
	const inverted = f.inv(lastMultiplied);
	nums.reduceRight((acc, num, i) => {
		if (f.is0(num)) return acc;
		tmp[i] = f.mul(acc, tmp[i]);
		return f.mul(acc, num);
	}, inverted);
	return tmp;
}
function nLength(n, nBitLength) {
	const _nBitLength = nBitLength !== void 0 ? nBitLength : n.toString(2).length;
	return {
		nBitLength: _nBitLength,
		nByteLength: Math.ceil(_nBitLength / 8)
	};
}
/**
* Initializes a finite field over prime. **Non-primes are not supported.**
* Do not init in loop: slow. Very fragile: always run a benchmark on a change.
* Major performance optimizations:
* * a) denormalized operations like mulN instead of mul
* * b) same object shape: never add or remove keys
* * c) Object.freeze
* @param ORDER prime positive bigint
* @param bitLen how many bits the field consumes
* @param isLE (def: false) if encoding / decoding should be in little-endian
* @param redef optional faster redefinitions of sqrt and other methods
*/
function Field(ORDER, bitLen, isLE = false, redef = {}) {
	if (ORDER <= _0n$2) throw new Error(`Expected Field ORDER > 0, got ${ORDER}`);
	const { nBitLength: BITS, nByteLength: BYTES } = nLength(ORDER, bitLen);
	if (BYTES > 2048) throw new Error("Field lengths over 2048 bytes are not supported");
	const sqrtP = FpSqrt(ORDER);
	const f = Object.freeze({
		ORDER,
		BITS,
		BYTES,
		MASK: bitMask(BITS),
		ZERO: _0n$2,
		ONE: _1n$3,
		create: (num) => mod(num, ORDER),
		isValid: (num) => {
			if (typeof num !== "bigint") throw new Error(`Invalid field element: expected bigint, got ${typeof num}`);
			return _0n$2 <= num && num < ORDER;
		},
		is0: (num) => num === _0n$2,
		isOdd: (num) => (num & _1n$3) === _1n$3,
		neg: (num) => mod(-num, ORDER),
		eql: (lhs, rhs) => lhs === rhs,
		sqr: (num) => mod(num * num, ORDER),
		add: (lhs, rhs) => mod(lhs + rhs, ORDER),
		sub: (lhs, rhs) => mod(lhs - rhs, ORDER),
		mul: (lhs, rhs) => mod(lhs * rhs, ORDER),
		pow: (num, power) => FpPow(f, num, power),
		div: (lhs, rhs) => mod(lhs * invert(rhs, ORDER), ORDER),
		sqrN: (num) => num * num,
		addN: (lhs, rhs) => lhs + rhs,
		subN: (lhs, rhs) => lhs - rhs,
		mulN: (lhs, rhs) => lhs * rhs,
		inv: (num) => invert(num, ORDER),
		sqrt: redef.sqrt || ((n) => sqrtP(f, n)),
		invertBatch: (lst) => FpInvertBatch(f, lst),
		cmov: (a, b, c) => c ? b : a,
		toBytes: (num) => isLE ? numberToBytesLE(num, BYTES) : numberToBytesBE(num, BYTES),
		fromBytes: (bytes) => {
			if (bytes.length !== BYTES) throw new Error(`Fp.fromBytes: expected ${BYTES}, got ${bytes.length}`);
			return isLE ? bytesToNumberLE(bytes) : bytesToNumberBE(bytes);
		}
	});
	return Object.freeze(f);
}
/**
* Returns total number of bytes consumed by the field element.
* For example, 32 bytes for usual 256-bit weierstrass curve.
* @param fieldOrder number of field elements, usually CURVE.n
* @returns byte length of field
*/
function getFieldBytesLength(fieldOrder) {
	if (typeof fieldOrder !== "bigint") throw new Error("field order must be bigint");
	const bitLength = fieldOrder.toString(2).length;
	return Math.ceil(bitLength / 8);
}
/**
* Returns minimal amount of bytes that can be safely reduced
* by field order.
* Should be 2^-128 for 128-bit curve such as P256.
* @param fieldOrder number of field elements, usually CURVE.n
* @returns byte length of target hash
*/
function getMinHashLength(fieldOrder) {
	const length = getFieldBytesLength(fieldOrder);
	return length + Math.ceil(length / 2);
}
/**
* "Constant-time" private key generation utility.
* Can take (n + n/2) or more bytes of uniform input e.g. from CSPRNG or KDF
* and convert them into private scalar, with the modulo bias being negligible.
* Needs at least 48 bytes of input for 32-byte private key.
* https://research.kudelskisecurity.com/2020/07/28/the-definitive-guide-to-modulo-bias-and-how-to-avoid-it/
* FIPS 186-5, A.2 https://csrc.nist.gov/publications/detail/fips/186/5/final
* RFC 9380, https://www.rfc-editor.org/rfc/rfc9380#section-5
* @param hash hash output from SHA3 or a similar function
* @param groupOrder size of subgroup - (e.g. secp256k1.CURVE.n)
* @param isLE interpret hash bytes as LE num
* @returns valid private scalar
*/
function mapHashToField(key, fieldOrder, isLE = false) {
	const len = key.length;
	const fieldLen = getFieldBytesLength(fieldOrder);
	const minLen = getMinHashLength(fieldOrder);
	if (len < 16 || len < minLen || len > 1024) throw new Error(`expected ${minLen}-1024 bytes of input, got ${len}`);
	const reduced = mod(isLE ? bytesToNumberBE(key) : bytesToNumberLE(key), fieldOrder - _1n$3) + _1n$3;
	return isLE ? numberToBytesLE(reduced, fieldLen) : numberToBytesBE(reduced, fieldLen);
}
//#endregion
//#region node_modules/@noble/curves/esm/abstract/curve.js
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
var _0n$1 = BigInt(0);
var _1n$2 = BigInt(1);
function wNAF(c, bits) {
	const constTimeNegate = (condition, item) => {
		const neg = item.negate();
		return condition ? neg : item;
	};
	const opts = (W) => {
		return {
			windows: Math.ceil(bits / W) + 1,
			windowSize: 2 ** (W - 1)
		};
	};
	return {
		constTimeNegate,
		unsafeLadder(elm, n) {
			let p = c.ZERO;
			let d = elm;
			while (n > _0n$1) {
				if (n & _1n$2) p = p.add(d);
				d = d.double();
				n >>= _1n$2;
			}
			return p;
		},
		/**
		* Creates a wNAF precomputation window. Used for caching.
		* Default window size is set by `utils.precompute()` and is equal to 8.
		* Number of precomputed points depends on the curve size:
		* 2^(𝑊−1) * (Math.ceil(𝑛 / 𝑊) + 1), where:
		* - 𝑊 is the window size
		* - 𝑛 is the bitlength of the curve order.
		* For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
		* @returns precomputed point tables flattened to a single array
		*/
		precomputeWindow(elm, W) {
			const { windows, windowSize } = opts(W);
			const points = [];
			let p = elm;
			let base = p;
			for (let window = 0; window < windows; window++) {
				base = p;
				points.push(base);
				for (let i = 1; i < windowSize; i++) {
					base = base.add(p);
					points.push(base);
				}
				p = base.double();
			}
			return points;
		},
		/**
		* Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
		* @param W window size
		* @param precomputes precomputed tables
		* @param n scalar (we don't check here, but should be less than curve order)
		* @returns real and fake (for const-time) points
		*/
		wNAF(W, precomputes, n) {
			const { windows, windowSize } = opts(W);
			let p = c.ZERO;
			let f = c.BASE;
			const mask = BigInt(2 ** W - 1);
			const maxNumber = 2 ** W;
			const shiftBy = BigInt(W);
			for (let window = 0; window < windows; window++) {
				const offset = window * windowSize;
				let wbits = Number(n & mask);
				n >>= shiftBy;
				if (wbits > windowSize) {
					wbits -= maxNumber;
					n += _1n$2;
				}
				const offset1 = offset;
				const offset2 = offset + Math.abs(wbits) - 1;
				const cond1 = window % 2 !== 0;
				const cond2 = wbits < 0;
				if (wbits === 0) f = f.add(constTimeNegate(cond1, precomputes[offset1]));
				else p = p.add(constTimeNegate(cond2, precomputes[offset2]));
			}
			return {
				p,
				f
			};
		},
		wNAFCached(P, precomputesMap, n, transform) {
			const W = P._WINDOW_SIZE || 1;
			let comp = precomputesMap.get(P);
			if (!comp) {
				comp = this.precomputeWindow(P, W);
				if (W !== 1) precomputesMap.set(P, transform(comp));
			}
			return this.wNAF(W, comp, n);
		}
	};
}
function validateBasic(curve) {
	validateField(curve.Fp);
	validateObject(curve, {
		n: "bigint",
		h: "bigint",
		Gx: "field",
		Gy: "field"
	}, {
		nBitLength: "isSafeInteger",
		nByteLength: "isSafeInteger"
	});
	return Object.freeze({
		...nLength(curve.n, curve.nBitLength),
		...curve,
		p: curve.Fp.ORDER
	});
}
//#endregion
//#region node_modules/@noble/curves/esm/abstract/weierstrass.js
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
function validatePointOpts(curve) {
	const opts = validateBasic(curve);
	validateObject(opts, {
		a: "field",
		b: "field"
	}, {
		allowedPrivateKeyLengths: "array",
		wrapPrivateKey: "boolean",
		isTorsionFree: "function",
		clearCofactor: "function",
		allowInfinityPoint: "boolean",
		fromBytes: "function",
		toBytes: "function"
	});
	const { endo, Fp, a } = opts;
	if (endo) {
		if (!Fp.eql(a, Fp.ZERO)) throw new Error("Endomorphism can only be defined for Koblitz curves that have a=0");
		if (typeof endo !== "object" || typeof endo.beta !== "bigint" || typeof endo.splitScalar !== "function") throw new Error("Expected endomorphism with beta: bigint and splitScalar: function");
	}
	return Object.freeze({ ...opts });
}
var { bytesToNumberBE: b2n, hexToBytes: h2b } = utils_exports;
var DER = {
	Err: class DERErr extends Error {
		constructor(m = "") {
			super(m);
		}
	},
	_parseInt(data) {
		const { Err: E } = DER;
		if (data.length < 2 || data[0] !== 2) throw new E("Invalid signature integer tag");
		const len = data[1];
		const res = data.subarray(2, len + 2);
		if (!len || res.length !== len) throw new E("Invalid signature integer: wrong length");
		if (res[0] & 128) throw new E("Invalid signature integer: negative");
		if (res[0] === 0 && !(res[1] & 128)) throw new E("Invalid signature integer: unnecessary leading zero");
		return {
			d: b2n(res),
			l: data.subarray(len + 2)
		};
	},
	toSig(hex) {
		const { Err: E } = DER;
		const data = typeof hex === "string" ? h2b(hex) : hex;
		if (!(data instanceof Uint8Array)) throw new Error("ui8a expected");
		let l = data.length;
		if (l < 2 || data[0] != 48) throw new E("Invalid signature tag");
		if (data[1] !== l - 2) throw new E("Invalid signature: incorrect length");
		const { d: r, l: sBytes } = DER._parseInt(data.subarray(2));
		const { d: s, l: rBytesLeft } = DER._parseInt(sBytes);
		if (rBytesLeft.length) throw new E("Invalid signature: left bytes after parsing");
		return {
			r,
			s
		};
	},
	hexFromSig(sig) {
		const slice = (s) => Number.parseInt(s[0], 16) & 8 ? "00" + s : s;
		const h = (num) => {
			const hex = num.toString(16);
			return hex.length & 1 ? `0${hex}` : hex;
		};
		const s = slice(h(sig.s));
		const r = slice(h(sig.r));
		const shl = s.length / 2;
		const rhl = r.length / 2;
		const sl = h(shl);
		const rl = h(rhl);
		return `30${h(rhl + shl + 4)}02${rl}${r}02${sl}${s}`;
	}
};
var _0n = BigInt(0);
var _1n$1 = BigInt(1);
var _3n = BigInt(3);
function weierstrassPoints(opts) {
	const CURVE = validatePointOpts(opts);
	const { Fp } = CURVE;
	const toBytes = CURVE.toBytes || ((_c, point, _isCompressed) => {
		const a = point.toAffine();
		return concatBytes(Uint8Array.from([4]), Fp.toBytes(a.x), Fp.toBytes(a.y));
	});
	const fromBytes = CURVE.fromBytes || ((bytes) => {
		const tail = bytes.subarray(1);
		return {
			x: Fp.fromBytes(tail.subarray(0, Fp.BYTES)),
			y: Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES))
		};
	});
	/**
	* y² = x³ + ax + b: Short weierstrass curve formula
	* @returns y²
	*/
	function weierstrassEquation(x) {
		const { a, b } = CURVE;
		const x2 = Fp.sqr(x);
		const x3 = Fp.mul(x2, x);
		return Fp.add(Fp.add(x3, Fp.mul(x, a)), b);
	}
	if (!Fp.eql(Fp.sqr(CURVE.Gy), weierstrassEquation(CURVE.Gx))) throw new Error("bad generator point: equation left != right");
	function isWithinCurveOrder(num) {
		return typeof num === "bigint" && _0n < num && num < CURVE.n;
	}
	function assertGE(num) {
		if (!isWithinCurveOrder(num)) throw new Error("Expected valid bigint: 0 < bigint < curve.n");
	}
	function normPrivateKeyToScalar(key) {
		const { allowedPrivateKeyLengths: lengths, nByteLength, wrapPrivateKey, n } = CURVE;
		if (lengths && typeof key !== "bigint") {
			if (key instanceof Uint8Array) key = bytesToHex(key);
			if (typeof key !== "string" || !lengths.includes(key.length)) throw new Error("Invalid key");
			key = key.padStart(nByteLength * 2, "0");
		}
		let num;
		try {
			num = typeof key === "bigint" ? key : bytesToNumberBE(ensureBytes("private key", key, nByteLength));
		} catch (error) {
			throw new Error(`private key must be ${nByteLength} bytes, hex or bigint, not ${typeof key}`);
		}
		if (wrapPrivateKey) num = mod(num, n);
		assertGE(num);
		return num;
	}
	const pointPrecomputes = /* @__PURE__ */ new Map();
	function assertPrjPoint(other) {
		if (!(other instanceof Point)) throw new Error("ProjectivePoint expected");
	}
	/**
	* Projective Point works in 3d / projective (homogeneous) coordinates: (x, y, z) ∋ (x=x/z, y=y/z)
	* Default Point works in 2d / affine coordinates: (x, y)
	* We're doing calculations in projective, because its operations don't require costly inversion.
	*/
	class Point {
		constructor(px, py, pz) {
			this.px = px;
			this.py = py;
			this.pz = pz;
			if (px == null || !Fp.isValid(px)) throw new Error("x required");
			if (py == null || !Fp.isValid(py)) throw new Error("y required");
			if (pz == null || !Fp.isValid(pz)) throw new Error("z required");
		}
		static fromAffine(p) {
			const { x, y } = p || {};
			if (!p || !Fp.isValid(x) || !Fp.isValid(y)) throw new Error("invalid affine point");
			if (p instanceof Point) throw new Error("projective point not allowed");
			const is0 = (i) => Fp.eql(i, Fp.ZERO);
			if (is0(x) && is0(y)) return Point.ZERO;
			return new Point(x, y, Fp.ONE);
		}
		get x() {
			return this.toAffine().x;
		}
		get y() {
			return this.toAffine().y;
		}
		/**
		* Takes a bunch of Projective Points but executes only one
		* inversion on all of them. Inversion is very slow operation,
		* so this improves performance massively.
		* Optimization: converts a list of projective points to a list of identical points with Z=1.
		*/
		static normalizeZ(points) {
			const toInv = Fp.invertBatch(points.map((p) => p.pz));
			return points.map((p, i) => p.toAffine(toInv[i])).map(Point.fromAffine);
		}
		/**
		* Converts hash string or Uint8Array to Point.
		* @param hex short/long ECDSA hex
		*/
		static fromHex(hex) {
			const P = Point.fromAffine(fromBytes(ensureBytes("pointHex", hex)));
			P.assertValidity();
			return P;
		}
		static fromPrivateKey(privateKey) {
			return Point.BASE.multiply(normPrivateKeyToScalar(privateKey));
		}
		_setWindowSize(windowSize) {
			this._WINDOW_SIZE = windowSize;
			pointPrecomputes.delete(this);
		}
		assertValidity() {
			if (this.is0()) {
				if (CURVE.allowInfinityPoint && !Fp.is0(this.py)) return;
				throw new Error("bad point: ZERO");
			}
			const { x, y } = this.toAffine();
			if (!Fp.isValid(x) || !Fp.isValid(y)) throw new Error("bad point: x or y not FE");
			const left = Fp.sqr(y);
			const right = weierstrassEquation(x);
			if (!Fp.eql(left, right)) throw new Error("bad point: equation left != right");
			if (!this.isTorsionFree()) throw new Error("bad point: not in prime-order subgroup");
		}
		hasEvenY() {
			const { y } = this.toAffine();
			if (Fp.isOdd) return !Fp.isOdd(y);
			throw new Error("Field doesn't support isOdd");
		}
		/**
		* Compare one point to another.
		*/
		equals(other) {
			assertPrjPoint(other);
			const { px: X1, py: Y1, pz: Z1 } = this;
			const { px: X2, py: Y2, pz: Z2 } = other;
			const U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1));
			const U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1));
			return U1 && U2;
		}
		/**
		* Flips point to one corresponding to (x, -y) in Affine coordinates.
		*/
		negate() {
			return new Point(this.px, Fp.neg(this.py), this.pz);
		}
		double() {
			const { a, b } = CURVE;
			const b3 = Fp.mul(b, _3n);
			const { px: X1, py: Y1, pz: Z1 } = this;
			let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
			let t0 = Fp.mul(X1, X1);
			let t1 = Fp.mul(Y1, Y1);
			let t2 = Fp.mul(Z1, Z1);
			let t3 = Fp.mul(X1, Y1);
			t3 = Fp.add(t3, t3);
			Z3 = Fp.mul(X1, Z1);
			Z3 = Fp.add(Z3, Z3);
			X3 = Fp.mul(a, Z3);
			Y3 = Fp.mul(b3, t2);
			Y3 = Fp.add(X3, Y3);
			X3 = Fp.sub(t1, Y3);
			Y3 = Fp.add(t1, Y3);
			Y3 = Fp.mul(X3, Y3);
			X3 = Fp.mul(t3, X3);
			Z3 = Fp.mul(b3, Z3);
			t2 = Fp.mul(a, t2);
			t3 = Fp.sub(t0, t2);
			t3 = Fp.mul(a, t3);
			t3 = Fp.add(t3, Z3);
			Z3 = Fp.add(t0, t0);
			t0 = Fp.add(Z3, t0);
			t0 = Fp.add(t0, t2);
			t0 = Fp.mul(t0, t3);
			Y3 = Fp.add(Y3, t0);
			t2 = Fp.mul(Y1, Z1);
			t2 = Fp.add(t2, t2);
			t0 = Fp.mul(t2, t3);
			X3 = Fp.sub(X3, t0);
			Z3 = Fp.mul(t2, t1);
			Z3 = Fp.add(Z3, Z3);
			Z3 = Fp.add(Z3, Z3);
			return new Point(X3, Y3, Z3);
		}
		add(other) {
			assertPrjPoint(other);
			const { px: X1, py: Y1, pz: Z1 } = this;
			const { px: X2, py: Y2, pz: Z2 } = other;
			let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
			const a = CURVE.a;
			const b3 = Fp.mul(CURVE.b, _3n);
			let t0 = Fp.mul(X1, X2);
			let t1 = Fp.mul(Y1, Y2);
			let t2 = Fp.mul(Z1, Z2);
			let t3 = Fp.add(X1, Y1);
			let t4 = Fp.add(X2, Y2);
			t3 = Fp.mul(t3, t4);
			t4 = Fp.add(t0, t1);
			t3 = Fp.sub(t3, t4);
			t4 = Fp.add(X1, Z1);
			let t5 = Fp.add(X2, Z2);
			t4 = Fp.mul(t4, t5);
			t5 = Fp.add(t0, t2);
			t4 = Fp.sub(t4, t5);
			t5 = Fp.add(Y1, Z1);
			X3 = Fp.add(Y2, Z2);
			t5 = Fp.mul(t5, X3);
			X3 = Fp.add(t1, t2);
			t5 = Fp.sub(t5, X3);
			Z3 = Fp.mul(a, t4);
			X3 = Fp.mul(b3, t2);
			Z3 = Fp.add(X3, Z3);
			X3 = Fp.sub(t1, Z3);
			Z3 = Fp.add(t1, Z3);
			Y3 = Fp.mul(X3, Z3);
			t1 = Fp.add(t0, t0);
			t1 = Fp.add(t1, t0);
			t2 = Fp.mul(a, t2);
			t4 = Fp.mul(b3, t4);
			t1 = Fp.add(t1, t2);
			t2 = Fp.sub(t0, t2);
			t2 = Fp.mul(a, t2);
			t4 = Fp.add(t4, t2);
			t0 = Fp.mul(t1, t4);
			Y3 = Fp.add(Y3, t0);
			t0 = Fp.mul(t5, t4);
			X3 = Fp.mul(t3, X3);
			X3 = Fp.sub(X3, t0);
			t0 = Fp.mul(t3, t1);
			Z3 = Fp.mul(t5, Z3);
			Z3 = Fp.add(Z3, t0);
			return new Point(X3, Y3, Z3);
		}
		subtract(other) {
			return this.add(other.negate());
		}
		is0() {
			return this.equals(Point.ZERO);
		}
		wNAF(n) {
			return wnaf.wNAFCached(this, pointPrecomputes, n, (comp) => {
				const toInv = Fp.invertBatch(comp.map((p) => p.pz));
				return comp.map((p, i) => p.toAffine(toInv[i])).map(Point.fromAffine);
			});
		}
		/**
		* Non-constant-time multiplication. Uses double-and-add algorithm.
		* It's faster, but should only be used when you don't care about
		* an exposed private key e.g. sig verification, which works over *public* keys.
		*/
		multiplyUnsafe(n) {
			const I = Point.ZERO;
			if (n === _0n) return I;
			assertGE(n);
			if (n === _1n$1) return this;
			const { endo } = CURVE;
			if (!endo) return wnaf.unsafeLadder(this, n);
			let { k1neg, k1, k2neg, k2 } = endo.splitScalar(n);
			let k1p = I;
			let k2p = I;
			let d = this;
			while (k1 > _0n || k2 > _0n) {
				if (k1 & _1n$1) k1p = k1p.add(d);
				if (k2 & _1n$1) k2p = k2p.add(d);
				d = d.double();
				k1 >>= _1n$1;
				k2 >>= _1n$1;
			}
			if (k1neg) k1p = k1p.negate();
			if (k2neg) k2p = k2p.negate();
			k2p = new Point(Fp.mul(k2p.px, endo.beta), k2p.py, k2p.pz);
			return k1p.add(k2p);
		}
		/**
		* Constant time multiplication.
		* Uses wNAF method. Windowed method may be 10% faster,
		* but takes 2x longer to generate and consumes 2x memory.
		* Uses precomputes when available.
		* Uses endomorphism for Koblitz curves.
		* @param scalar by which the point would be multiplied
		* @returns New point
		*/
		multiply(scalar) {
			assertGE(scalar);
			let n = scalar;
			let point, fake;
			const { endo } = CURVE;
			if (endo) {
				const { k1neg, k1, k2neg, k2 } = endo.splitScalar(n);
				let { p: k1p, f: f1p } = this.wNAF(k1);
				let { p: k2p, f: f2p } = this.wNAF(k2);
				k1p = wnaf.constTimeNegate(k1neg, k1p);
				k2p = wnaf.constTimeNegate(k2neg, k2p);
				k2p = new Point(Fp.mul(k2p.px, endo.beta), k2p.py, k2p.pz);
				point = k1p.add(k2p);
				fake = f1p.add(f2p);
			} else {
				const { p, f } = this.wNAF(n);
				point = p;
				fake = f;
			}
			return Point.normalizeZ([point, fake])[0];
		}
		/**
		* Efficiently calculate `aP + bQ`. Unsafe, can expose private key, if used incorrectly.
		* Not using Strauss-Shamir trick: precomputation tables are faster.
		* The trick could be useful if both P and Q are not G (not in our case).
		* @returns non-zero affine point
		*/
		multiplyAndAddUnsafe(Q, a, b) {
			const G = Point.BASE;
			const mul = (P, a) => a === _0n || a === _1n$1 || !P.equals(G) ? P.multiplyUnsafe(a) : P.multiply(a);
			const sum = mul(this, a).add(mul(Q, b));
			return sum.is0() ? void 0 : sum;
		}
		toAffine(iz) {
			const { px: x, py: y, pz: z } = this;
			const is0 = this.is0();
			if (iz == null) iz = is0 ? Fp.ONE : Fp.inv(z);
			const ax = Fp.mul(x, iz);
			const ay = Fp.mul(y, iz);
			const zz = Fp.mul(z, iz);
			if (is0) return {
				x: Fp.ZERO,
				y: Fp.ZERO
			};
			if (!Fp.eql(zz, Fp.ONE)) throw new Error("invZ was invalid");
			return {
				x: ax,
				y: ay
			};
		}
		isTorsionFree() {
			const { h: cofactor, isTorsionFree } = CURVE;
			if (cofactor === _1n$1) return true;
			if (isTorsionFree) return isTorsionFree(Point, this);
			throw new Error("isTorsionFree() has not been declared for the elliptic curve");
		}
		clearCofactor() {
			const { h: cofactor, clearCofactor } = CURVE;
			if (cofactor === _1n$1) return this;
			if (clearCofactor) return clearCofactor(Point, this);
			return this.multiplyUnsafe(CURVE.h);
		}
		toRawBytes(isCompressed = true) {
			this.assertValidity();
			return toBytes(Point, this, isCompressed);
		}
		toHex(isCompressed = true) {
			return bytesToHex(this.toRawBytes(isCompressed));
		}
	}
	Point.BASE = new Point(CURVE.Gx, CURVE.Gy, Fp.ONE);
	Point.ZERO = new Point(Fp.ZERO, Fp.ONE, Fp.ZERO);
	const _bits = CURVE.nBitLength;
	const wnaf = wNAF(Point, CURVE.endo ? Math.ceil(_bits / 2) : _bits);
	return {
		CURVE,
		ProjectivePoint: Point,
		normPrivateKeyToScalar,
		weierstrassEquation,
		isWithinCurveOrder
	};
}
function validateOpts(curve) {
	const opts = validateBasic(curve);
	validateObject(opts, {
		hash: "hash",
		hmac: "function",
		randomBytes: "function"
	}, {
		bits2int: "function",
		bits2int_modN: "function",
		lowS: "boolean"
	});
	return Object.freeze({
		lowS: true,
		...opts
	});
}
function weierstrass(curveDef) {
	const CURVE = validateOpts(curveDef);
	const { Fp, n: CURVE_ORDER } = CURVE;
	const compressedLen = Fp.BYTES + 1;
	const uncompressedLen = 2 * Fp.BYTES + 1;
	function isValidFieldElement(num) {
		return _0n < num && num < Fp.ORDER;
	}
	function modN(a) {
		return mod(a, CURVE_ORDER);
	}
	function invN(a) {
		return invert(a, CURVE_ORDER);
	}
	const { ProjectivePoint: Point, normPrivateKeyToScalar, weierstrassEquation, isWithinCurveOrder } = weierstrassPoints({
		...CURVE,
		toBytes(_c, point, isCompressed) {
			const a = point.toAffine();
			const x = Fp.toBytes(a.x);
			const cat = concatBytes;
			if (isCompressed) return cat(Uint8Array.from([point.hasEvenY() ? 2 : 3]), x);
			else return cat(Uint8Array.from([4]), x, Fp.toBytes(a.y));
		},
		fromBytes(bytes) {
			const len = bytes.length;
			const head = bytes[0];
			const tail = bytes.subarray(1);
			if (len === compressedLen && (head === 2 || head === 3)) {
				const x = bytesToNumberBE(tail);
				if (!isValidFieldElement(x)) throw new Error("Point is not on curve");
				const y2 = weierstrassEquation(x);
				let y = Fp.sqrt(y2);
				const isYOdd = (y & _1n$1) === _1n$1;
				if ((head & 1) === 1 !== isYOdd) y = Fp.neg(y);
				return {
					x,
					y
				};
			} else if (len === uncompressedLen && head === 4) return {
				x: Fp.fromBytes(tail.subarray(0, Fp.BYTES)),
				y: Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES))
			};
			else throw new Error(`Point of length ${len} was invalid. Expected ${compressedLen} compressed bytes or ${uncompressedLen} uncompressed bytes`);
		}
	});
	const numToNByteStr = (num) => bytesToHex(numberToBytesBE(num, CURVE.nByteLength));
	function isBiggerThanHalfOrder(number) {
		return number > CURVE_ORDER >> _1n$1;
	}
	function normalizeS(s) {
		return isBiggerThanHalfOrder(s) ? modN(-s) : s;
	}
	const slcNum = (b, from, to) => bytesToNumberBE(b.slice(from, to));
	/**
	* ECDSA signature with its (r, s) properties. Supports DER & compact representations.
	*/
	class Signature {
		constructor(r, s, recovery) {
			this.r = r;
			this.s = s;
			this.recovery = recovery;
			this.assertValidity();
		}
		static fromCompact(hex) {
			const l = CURVE.nByteLength;
			hex = ensureBytes("compactSignature", hex, l * 2);
			return new Signature(slcNum(hex, 0, l), slcNum(hex, l, 2 * l));
		}
		static fromDER(hex) {
			const { r, s } = DER.toSig(ensureBytes("DER", hex));
			return new Signature(r, s);
		}
		assertValidity() {
			if (!isWithinCurveOrder(this.r)) throw new Error("r must be 0 < r < CURVE.n");
			if (!isWithinCurveOrder(this.s)) throw new Error("s must be 0 < s < CURVE.n");
		}
		addRecoveryBit(recovery) {
			return new Signature(this.r, this.s, recovery);
		}
		recoverPublicKey(msgHash) {
			const { r, s, recovery: rec } = this;
			const h = bits2int_modN(ensureBytes("msgHash", msgHash));
			if (rec == null || ![
				0,
				1,
				2,
				3
			].includes(rec)) throw new Error("recovery id invalid");
			const radj = rec === 2 || rec === 3 ? r + CURVE.n : r;
			if (radj >= Fp.ORDER) throw new Error("recovery id 2 or 3 invalid");
			const prefix = (rec & 1) === 0 ? "02" : "03";
			const R = Point.fromHex(prefix + numToNByteStr(radj));
			const ir = invN(radj);
			const u1 = modN(-h * ir);
			const u2 = modN(s * ir);
			const Q = Point.BASE.multiplyAndAddUnsafe(R, u1, u2);
			if (!Q) throw new Error("point at infinify");
			Q.assertValidity();
			return Q;
		}
		hasHighS() {
			return isBiggerThanHalfOrder(this.s);
		}
		normalizeS() {
			return this.hasHighS() ? new Signature(this.r, modN(-this.s), this.recovery) : this;
		}
		toDERRawBytes() {
			return hexToBytes(this.toDERHex());
		}
		toDERHex() {
			return DER.hexFromSig({
				r: this.r,
				s: this.s
			});
		}
		toCompactRawBytes() {
			return hexToBytes(this.toCompactHex());
		}
		toCompactHex() {
			return numToNByteStr(this.r) + numToNByteStr(this.s);
		}
	}
	const utils = {
		isValidPrivateKey(privateKey) {
			try {
				normPrivateKeyToScalar(privateKey);
				return true;
			} catch (error) {
				return false;
			}
		},
		normPrivateKeyToScalar,
		/**
		* Produces cryptographically secure private key from random of size
		* (groupLen + ceil(groupLen / 2)) with modulo bias being negligible.
		*/
		randomPrivateKey: () => {
			const length = getMinHashLength(CURVE.n);
			return mapHashToField(CURVE.randomBytes(length), CURVE.n);
		},
		/**
		* Creates precompute table for an arbitrary EC point. Makes point "cached".
		* Allows to massively speed-up `point.multiply(scalar)`.
		* @returns cached point
		* @example
		* const fast = utils.precompute(8, ProjectivePoint.fromHex(someonesPubKey));
		* fast.multiply(privKey); // much faster ECDH now
		*/
		precompute(windowSize = 8, point = Point.BASE) {
			point._setWindowSize(windowSize);
			point.multiply(BigInt(3));
			return point;
		}
	};
	/**
	* Computes public key for a private key. Checks for validity of the private key.
	* @param privateKey private key
	* @param isCompressed whether to return compact (default), or full key
	* @returns Public key, full when isCompressed=false; short when isCompressed=true
	*/
	function getPublicKey(privateKey, isCompressed = true) {
		return Point.fromPrivateKey(privateKey).toRawBytes(isCompressed);
	}
	/**
	* Quick and dirty check for item being public key. Does not validate hex, or being on-curve.
	*/
	function isProbPub(item) {
		const arr = item instanceof Uint8Array;
		const str = typeof item === "string";
		const len = (arr || str) && item.length;
		if (arr) return len === compressedLen || len === uncompressedLen;
		if (str) return len === 2 * compressedLen || len === 2 * uncompressedLen;
		if (item instanceof Point) return true;
		return false;
	}
	/**
	* ECDH (Elliptic Curve Diffie Hellman).
	* Computes shared public key from private key and public key.
	* Checks: 1) private key validity 2) shared key is on-curve.
	* Does NOT hash the result.
	* @param privateA private key
	* @param publicB different public key
	* @param isCompressed whether to return compact (default), or full key
	* @returns shared public key
	*/
	function getSharedSecret(privateA, publicB, isCompressed = true) {
		if (isProbPub(privateA)) throw new Error("first arg must be private key");
		if (!isProbPub(publicB)) throw new Error("second arg must be public key");
		return Point.fromHex(publicB).multiply(normPrivateKeyToScalar(privateA)).toRawBytes(isCompressed);
	}
	const bits2int = CURVE.bits2int || function(bytes) {
		const num = bytesToNumberBE(bytes);
		const delta = bytes.length * 8 - CURVE.nBitLength;
		return delta > 0 ? num >> BigInt(delta) : num;
	};
	const bits2int_modN = CURVE.bits2int_modN || function(bytes) {
		return modN(bits2int(bytes));
	};
	const ORDER_MASK = bitMask(CURVE.nBitLength);
	/**
	* Converts to bytes. Checks if num in `[0..ORDER_MASK-1]` e.g.: `[0..2^256-1]`.
	*/
	function int2octets(num) {
		if (typeof num !== "bigint") throw new Error("bigint expected");
		if (!(_0n <= num && num < ORDER_MASK)) throw new Error(`bigint expected < 2^${CURVE.nBitLength}`);
		return numberToBytesBE(num, CURVE.nByteLength);
	}
	function prepSig(msgHash, privateKey, opts = defaultSigOpts) {
		if (["recovered", "canonical"].some((k) => k in opts)) throw new Error("sign() legacy options not supported");
		const { hash, randomBytes } = CURVE;
		let { lowS, prehash, extraEntropy: ent } = opts;
		if (lowS == null) lowS = true;
		msgHash = ensureBytes("msgHash", msgHash);
		if (prehash) msgHash = ensureBytes("prehashed msgHash", hash(msgHash));
		const h1int = bits2int_modN(msgHash);
		const d = normPrivateKeyToScalar(privateKey);
		const seedArgs = [int2octets(d), int2octets(h1int)];
		if (ent != null) {
			const e = ent === true ? randomBytes(Fp.BYTES) : ent;
			seedArgs.push(ensureBytes("extraEntropy", e));
		}
		const seed = concatBytes(...seedArgs);
		const m = h1int;
		function k2sig(kBytes) {
			const k = bits2int(kBytes);
			if (!isWithinCurveOrder(k)) return;
			const ik = invN(k);
			const q = Point.BASE.multiply(k).toAffine();
			const r = modN(q.x);
			if (r === _0n) return;
			const s = modN(ik * modN(m + r * d));
			if (s === _0n) return;
			let recovery = (q.x === r ? 0 : 2) | Number(q.y & _1n$1);
			let normS = s;
			if (lowS && isBiggerThanHalfOrder(s)) {
				normS = normalizeS(s);
				recovery ^= 1;
			}
			return new Signature(r, normS, recovery);
		}
		return {
			seed,
			k2sig
		};
	}
	const defaultSigOpts = {
		lowS: CURVE.lowS,
		prehash: false
	};
	const defaultVerOpts = {
		lowS: CURVE.lowS,
		prehash: false
	};
	/**
	* Signs message hash with a private key.
	* ```
	* sign(m, d, k) where
	*   (x, y) = G × k
	*   r = x mod n
	*   s = (m + dr)/k mod n
	* ```
	* @param msgHash NOT message. msg needs to be hashed to `msgHash`, or use `prehash`.
	* @param privKey private key
	* @param opts lowS for non-malleable sigs. extraEntropy for mixing randomness into k. prehash will hash first arg.
	* @returns signature with recovery param
	*/
	function sign(msgHash, privKey, opts = defaultSigOpts) {
		const { seed, k2sig } = prepSig(msgHash, privKey, opts);
		const C = CURVE;
		return createHmacDrbg(C.hash.outputLen, C.nByteLength, C.hmac)(seed, k2sig);
	}
	Point.BASE._setWindowSize(8);
	/**
	* Verifies a signature against message hash and public key.
	* Rejects lowS signatures by default: to override,
	* specify option `{lowS: false}`. Implements section 4.1.4 from https://www.secg.org/sec1-v2.pdf:
	*
	* ```
	* verify(r, s, h, P) where
	*   U1 = hs^-1 mod n
	*   U2 = rs^-1 mod n
	*   R = U1⋅G - U2⋅P
	*   mod(R.x, n) == r
	* ```
	*/
	function verify(signature, msgHash, publicKey, opts = defaultVerOpts) {
		const sg = signature;
		msgHash = ensureBytes("msgHash", msgHash);
		publicKey = ensureBytes("publicKey", publicKey);
		if ("strict" in opts) throw new Error("options.strict was renamed to lowS");
		const { lowS, prehash } = opts;
		let _sig = void 0;
		let P;
		try {
			if (typeof sg === "string" || sg instanceof Uint8Array) try {
				_sig = Signature.fromDER(sg);
			} catch (derError) {
				if (!(derError instanceof DER.Err)) throw derError;
				_sig = Signature.fromCompact(sg);
			}
			else if (typeof sg === "object" && typeof sg.r === "bigint" && typeof sg.s === "bigint") {
				const { r, s } = sg;
				_sig = new Signature(r, s);
			} else throw new Error("PARSE");
			P = Point.fromHex(publicKey);
		} catch (error) {
			if (error.message === "PARSE") throw new Error(`signature must be Signature instance, Uint8Array or hex string`);
			return false;
		}
		if (lowS && _sig.hasHighS()) return false;
		if (prehash) msgHash = CURVE.hash(msgHash);
		const { r, s } = _sig;
		const h = bits2int_modN(msgHash);
		const is = invN(s);
		const u1 = modN(h * is);
		const u2 = modN(r * is);
		const R = Point.BASE.multiplyAndAddUnsafe(P, u1, u2)?.toAffine();
		if (!R) return false;
		return modN(R.x) === r;
	}
	return {
		CURVE,
		getPublicKey,
		getSharedSecret,
		sign,
		verify,
		ProjectivePoint: Point,
		Signature,
		utils
	};
}
//#endregion
//#region node_modules/@noble/curves/esm/_shortw_utils.js
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
function getHash(hash) {
	return {
		hash,
		hmac: (key, ...msgs) => hmac(hash, key, concatBytes$1(...msgs)),
		randomBytes
	};
}
function createCurve(curveDef, defHash) {
	const create = (hash) => weierstrass({
		...curveDef,
		...getHash(hash)
	});
	return Object.freeze({
		...create(defHash),
		create
	});
}
//#endregion
//#region node_modules/@noble/curves/esm/secp256k1.js
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
var secp256k1P = BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f");
var secp256k1N = BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141");
var _1n = BigInt(1);
var _2n = BigInt(2);
var divNearest = (a, b) => (a + b / _2n) / b;
/**
* √n = n^((p+1)/4) for fields p = 3 mod 4. We unwrap the loop and multiply bit-by-bit.
* (P+1n/4n).toString(2) would produce bits [223x 1, 0, 22x 1, 4x 0, 11, 00]
*/
function sqrtMod(y) {
	const P = secp256k1P;
	const _3n = BigInt(3), _6n = BigInt(6), _11n = BigInt(11), _22n = BigInt(22);
	const _23n = BigInt(23), _44n = BigInt(44), _88n = BigInt(88);
	const b2 = y * y * y % P;
	const b3 = b2 * b2 * y % P;
	const b11 = pow2(pow2(pow2(b3, _3n, P) * b3 % P, _3n, P) * b3 % P, _2n, P) * b2 % P;
	const b22 = pow2(b11, _11n, P) * b11 % P;
	const b44 = pow2(b22, _22n, P) * b22 % P;
	const b88 = pow2(b44, _44n, P) * b44 % P;
	const root = pow2(pow2(pow2(pow2(pow2(pow2(b88, _88n, P) * b88 % P, _44n, P) * b44 % P, _3n, P) * b3 % P, _23n, P) * b22 % P, _6n, P) * b2 % P, _2n, P);
	if (!Fp.eql(Fp.sqr(root), y)) throw new Error("Cannot find square root");
	return root;
}
var Fp = Field(secp256k1P, void 0, void 0, { sqrt: sqrtMod });
var secp256k1 = createCurve({
	a: BigInt(0),
	b: BigInt(7),
	Fp,
	n: secp256k1N,
	Gx: BigInt("55066263022277343669578718895168534326250603453777594175500187360389116729240"),
	Gy: BigInt("32670510020758816978083085130507043184471273380659243275938904335757337482424"),
	h: BigInt(1),
	lowS: true,
	/**
	* secp256k1 belongs to Koblitz curves: it has efficiently computable endomorphism.
	* Endomorphism uses 2x less RAM, speeds up precomputation by 2x and ECDH / key recovery by 20%.
	* For precomputed wNAF it trades off 1/2 init time & 1/3 ram for 20% perf hit.
	* Explanation: https://gist.github.com/paulmillr/eb670806793e84df628a7c434a873066
	*/
	endo: {
		beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
		splitScalar: (k) => {
			const n = secp256k1N;
			const a1 = BigInt("0x3086d221a7d46bcde86c90e49284eb15");
			const b1 = -_1n * BigInt("0xe4437ed6010e88286f547fa90abfe4c3");
			const a2 = BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8");
			const b2 = a1;
			const POW_2_128 = BigInt("0x100000000000000000000000000000000");
			const c1 = divNearest(b2 * k, n);
			const c2 = divNearest(-b1 * k, n);
			let k1 = mod(k - c1 * a1 - c2 * a2, n);
			let k2 = mod(-c1 * b1 - c2 * b2, n);
			const k1neg = k1 > POW_2_128;
			const k2neg = k2 > POW_2_128;
			if (k1neg) k1 = n - k1;
			if (k2neg) k2 = n - k2;
			if (k1 > POW_2_128 || k2 > POW_2_128) throw new Error("splitScalar: Endomorphism failed, k=" + k);
			return {
				k1neg,
				k1,
				k2neg,
				k2
			};
		}
	}
}, sha256);
secp256k1.ProjectivePoint;
//#endregion
export { wrapConstructor as a, number as c, u32 as i, output as l, Hash as n, bytes as o, toBytes as r, exists as s, secp256k1 as t };
