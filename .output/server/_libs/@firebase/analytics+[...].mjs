//#region node_modules/@firebase/util/dist/postinstall.mjs
var getDefaultsFromPostinstall = () => void 0;
//#endregion
//#region node_modules/@firebase/util/dist/node-esm/index.node.esm.js
/**
* @license
* Copyright 2017 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* @fileoverview Firebase constants.  Some of these (@defines) can be overridden at compile-time.
*/
var CONSTANTS = {
	/**
	* @define {boolean} Whether this is the client Node.js SDK.
	*/
	NODE_CLIENT: false,
	/**
	* @define {boolean} Whether this is the Admin Node.js SDK.
	*/
	NODE_ADMIN: false,
	/**
	* Firebase SDK Version
	*/
	SDK_VERSION: "${JSCORE_VERSION}"
};
/**
* @license
* Copyright 2017 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* @license
* Copyright 2017 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var stringToByteArray$1 = function(str) {
	const out = [];
	let p = 0;
	for (let i = 0; i < str.length; i++) {
		let c = str.charCodeAt(i);
		if (c < 128) out[p++] = c;
		else if (c < 2048) {
			out[p++] = c >> 6 | 192;
			out[p++] = c & 63 | 128;
		} else if ((c & 64512) === 55296 && i + 1 < str.length && (str.charCodeAt(i + 1) & 64512) === 56320) {
			c = 65536 + ((c & 1023) << 10) + (str.charCodeAt(++i) & 1023);
			out[p++] = c >> 18 | 240;
			out[p++] = c >> 12 & 63 | 128;
			out[p++] = c >> 6 & 63 | 128;
			out[p++] = c & 63 | 128;
		} else {
			out[p++] = c >> 12 | 224;
			out[p++] = c >> 6 & 63 | 128;
			out[p++] = c & 63 | 128;
		}
	}
	return out;
};
/**
* Turns an array of numbers into the string given by the concatenation of the
* characters to which the numbers correspond.
* @param bytes Array of numbers representing characters.
* @return Stringification of the array.
*/
var byteArrayToString = function(bytes) {
	const out = [];
	let pos = 0, c = 0;
	while (pos < bytes.length) {
		const c1 = bytes[pos++];
		if (c1 < 128) out[c++] = String.fromCharCode(c1);
		else if (c1 > 191 && c1 < 224) {
			const c2 = bytes[pos++];
			out[c++] = String.fromCharCode((c1 & 31) << 6 | c2 & 63);
		} else if (c1 > 239 && c1 < 365) {
			const c2 = bytes[pos++];
			const c3 = bytes[pos++];
			const c4 = bytes[pos++];
			const u = ((c1 & 7) << 18 | (c2 & 63) << 12 | (c3 & 63) << 6 | c4 & 63) - 65536;
			out[c++] = String.fromCharCode(55296 + (u >> 10));
			out[c++] = String.fromCharCode(56320 + (u & 1023));
		} else {
			const c2 = bytes[pos++];
			const c3 = bytes[pos++];
			out[c++] = String.fromCharCode((c1 & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
		}
	}
	return out.join("");
};
var base64 = {
	/**
	* Maps bytes to characters.
	*/
	byteToCharMap_: null,
	/**
	* Maps characters to bytes.
	*/
	charToByteMap_: null,
	/**
	* Maps bytes to websafe characters.
	* @private
	*/
	byteToCharMapWebSafe_: null,
	/**
	* Maps websafe characters to bytes.
	* @private
	*/
	charToByteMapWebSafe_: null,
	/**
	* Our default alphabet, shared between
	* ENCODED_VALS and ENCODED_VALS_WEBSAFE
	*/
	ENCODED_VALS_BASE: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
	/**
	* Our default alphabet. Value 64 (=) is special; it means "nothing."
	*/
	get ENCODED_VALS() {
		return this.ENCODED_VALS_BASE + "+/=";
	},
	/**
	* Our websafe alphabet.
	*/
	get ENCODED_VALS_WEBSAFE() {
		return this.ENCODED_VALS_BASE + "-_.";
	},
	/**
	* Whether this browser supports the atob and btoa functions. This extension
	* started at Mozilla but is now implemented by many browsers. We use the
	* ASSUME_* variables to avoid pulling in the full useragent detection library
	* but still allowing the standard per-browser compilations.
	*
	*/
	HAS_NATIVE_SUPPORT: typeof atob === "function",
	/**
	* Base64-encode an array of bytes.
	*
	* @param input An array of bytes (numbers with
	*     value in [0, 255]) to encode.
	* @param webSafe Boolean indicating we should use the
	*     alternative alphabet.
	* @return The base64 encoded string.
	*/
	encodeByteArray(input, webSafe) {
		if (!Array.isArray(input)) throw Error("encodeByteArray takes an array as a parameter");
		this.init_();
		const byteToCharMap = webSafe ? this.byteToCharMapWebSafe_ : this.byteToCharMap_;
		const output = [];
		for (let i = 0; i < input.length; i += 3) {
			const byte1 = input[i];
			const haveByte2 = i + 1 < input.length;
			const byte2 = haveByte2 ? input[i + 1] : 0;
			const haveByte3 = i + 2 < input.length;
			const byte3 = haveByte3 ? input[i + 2] : 0;
			const outByte1 = byte1 >> 2;
			const outByte2 = (byte1 & 3) << 4 | byte2 >> 4;
			let outByte3 = (byte2 & 15) << 2 | byte3 >> 6;
			let outByte4 = byte3 & 63;
			if (!haveByte3) {
				outByte4 = 64;
				if (!haveByte2) outByte3 = 64;
			}
			output.push(byteToCharMap[outByte1], byteToCharMap[outByte2], byteToCharMap[outByte3], byteToCharMap[outByte4]);
		}
		return output.join("");
	},
	/**
	* Base64-encode a string.
	*
	* @param input A string to encode.
	* @param webSafe If true, we should use the
	*     alternative alphabet.
	* @return The base64 encoded string.
	*/
	encodeString(input, webSafe) {
		if (this.HAS_NATIVE_SUPPORT && !webSafe) return btoa(input);
		return this.encodeByteArray(stringToByteArray$1(input), webSafe);
	},
	/**
	* Base64-decode a string.
	*
	* @param input to decode.
	* @param webSafe True if we should use the
	*     alternative alphabet.
	* @return string representing the decoded value.
	*/
	decodeString(input, webSafe) {
		if (this.HAS_NATIVE_SUPPORT && !webSafe) return atob(input);
		return byteArrayToString(this.decodeStringToByteArray(input, webSafe));
	},
	/**
	* Base64-decode a string.
	*
	* In base-64 decoding, groups of four characters are converted into three
	* bytes.  If the encoder did not apply padding, the input length may not
	* be a multiple of 4.
	*
	* In this case, the last group will have fewer than 4 characters, and
	* padding will be inferred.  If the group has one or two characters, it decodes
	* to one byte.  If the group has three characters, it decodes to two bytes.
	*
	* @param input Input to decode.
	* @param webSafe True if we should use the web-safe alphabet.
	* @return bytes representing the decoded value.
	*/
	decodeStringToByteArray(input, webSafe) {
		this.init_();
		const charToByteMap = webSafe ? this.charToByteMapWebSafe_ : this.charToByteMap_;
		const output = [];
		for (let i = 0; i < input.length;) {
			const byte1 = charToByteMap[input.charAt(i++)];
			const byte2 = i < input.length ? charToByteMap[input.charAt(i)] : 0;
			++i;
			const byte3 = i < input.length ? charToByteMap[input.charAt(i)] : 64;
			++i;
			const byte4 = i < input.length ? charToByteMap[input.charAt(i)] : 64;
			++i;
			if (byte1 == null || byte2 == null || byte3 == null || byte4 == null) throw new DecodeBase64StringError();
			const outByte1 = byte1 << 2 | byte2 >> 4;
			output.push(outByte1);
			if (byte3 !== 64) {
				const outByte2 = byte2 << 4 & 240 | byte3 >> 2;
				output.push(outByte2);
				if (byte4 !== 64) {
					const outByte3 = byte3 << 6 & 192 | byte4;
					output.push(outByte3);
				}
			}
		}
		return output;
	},
	/**
	* Lazy static initialization function. Called before
	* accessing any of the static map variables.
	* @private
	*/
	init_() {
		if (!this.byteToCharMap_) {
			this.byteToCharMap_ = {};
			this.charToByteMap_ = {};
			this.byteToCharMapWebSafe_ = {};
			this.charToByteMapWebSafe_ = {};
			for (let i = 0; i < this.ENCODED_VALS.length; i++) {
				this.byteToCharMap_[i] = this.ENCODED_VALS.charAt(i);
				this.charToByteMap_[this.byteToCharMap_[i]] = i;
				this.byteToCharMapWebSafe_[i] = this.ENCODED_VALS_WEBSAFE.charAt(i);
				this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[i]] = i;
				if (i >= this.ENCODED_VALS_BASE.length) {
					this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(i)] = i;
					this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(i)] = i;
				}
			}
		}
	}
};
/**
* An error encountered while decoding base64 string.
*/
var DecodeBase64StringError = class extends Error {
	constructor() {
		super(...arguments);
		this.name = "DecodeBase64StringError";
	}
};
/**
* URL-safe base64 encoding
*/
var base64Encode = function(str) {
	const utf8Bytes = stringToByteArray$1(str);
	return base64.encodeByteArray(utf8Bytes, true);
};
/**
* URL-safe base64 encoding (without "." padding in the end).
* e.g. Used in JSON Web Token (JWT) parts.
*/
var base64urlEncodeWithoutPadding = function(str) {
	return base64Encode(str).replace(/\./g, "");
};
/**
* URL-safe base64 decoding
*
* NOTE: DO NOT use the global atob() function - it does NOT support the
* base64Url variant encoding.
*
* @param str To be decoded
* @return Decoded result, if possible
*/
var base64Decode = function(str) {
	try {
		return base64.decodeString(str, true);
	} catch (e) {
		console.error("base64Decode failed: ", e);
	}
	return null;
};
/**
* @license
* Copyright 2017 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* @license
* Copyright 2022 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* Polyfill for `globalThis` object.
* @returns the `globalThis` object for the given environment.
* @public
*/
function getGlobal() {
	if (typeof self !== "undefined") return self;
	if (typeof window !== "undefined") return window;
	if (typeof global !== "undefined") return global;
	throw new Error("Unable to locate global object.");
}
/**
* @license
* Copyright 2022 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var getDefaultsFromGlobal = () => getGlobal().__FIREBASE_DEFAULTS__;
/**
* Attempt to read defaults from a JSON string provided to
* process(.)env(.)__FIREBASE_DEFAULTS__ or a JSON file whose path is in
* process(.)env(.)__FIREBASE_DEFAULTS_PATH__
* The dots are in parens because certain compilers (Vite?) cannot
* handle seeing that variable in comments.
* See https://github.com/firebase/firebase-js-sdk/issues/6838
*/
var getDefaultsFromEnvVariable = () => {
	if (typeof process === "undefined" || typeof process.env === "undefined") return;
	const defaultsJsonString = process.env.__FIREBASE_DEFAULTS__;
	if (defaultsJsonString) return JSON.parse(defaultsJsonString);
};
var getDefaultsFromCookie = () => {
	if (typeof document === "undefined") return;
	let match;
	try {
		match = document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/);
	} catch (e) {
		return;
	}
	const decoded = match && base64Decode(match[1]);
	return decoded && JSON.parse(decoded);
};
/**
* Get the __FIREBASE_DEFAULTS__ object. It checks in order:
* (1) if such an object exists as a property of `globalThis`
* (2) if such an object was provided on a shell environment variable
* (3) if such an object exists in a cookie
* @public
*/
var getDefaults = () => {
	try {
		return getDefaultsFromPostinstall() || getDefaultsFromGlobal() || getDefaultsFromEnvVariable() || getDefaultsFromCookie();
	} catch (e) {
		/**
		* Catch-all for being unable to get __FIREBASE_DEFAULTS__ due
		* to any environment case we have not accounted for. Log to
		* info instead of swallowing so we can find these unknown cases
		* and add paths for them if needed.
		*/
		console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${e}`);
		return;
	}
};
/**
* Returns emulator host stored in the __FIREBASE_DEFAULTS__ object
* for the given product.
* @returns a URL host formatted like `127.0.0.1:9999` or `[::1]:4000` if available
* @public
*/
var getDefaultEmulatorHost = (productName) => {
	var _a, _b;
	return (_b = (_a = getDefaults()) === null || _a === void 0 ? void 0 : _a.emulatorHosts) === null || _b === void 0 ? void 0 : _b[productName];
};
/**
* Returns emulator hostname and port stored in the __FIREBASE_DEFAULTS__ object
* for the given product.
* @returns a pair of hostname and port like `["::1", 4000]` if available
* @public
*/
var getDefaultEmulatorHostnameAndPort = (productName) => {
	const host = getDefaultEmulatorHost(productName);
	if (!host) return;
	const separatorIndex = host.lastIndexOf(":");
	if (separatorIndex <= 0 || separatorIndex + 1 === host.length) throw new Error(`Invalid host ${host} with no separate hostname and port!`);
	const port = parseInt(host.substring(separatorIndex + 1), 10);
	if (host[0] === "[") return [host.substring(1, separatorIndex - 1), port];
	else return [host.substring(0, separatorIndex), port];
};
/**
* Returns Firebase app config stored in the __FIREBASE_DEFAULTS__ object.
* @public
*/
var getDefaultAppConfig = () => {
	var _a;
	return (_a = getDefaults()) === null || _a === void 0 ? void 0 : _a.config;
};
/**
* @license
* Copyright 2017 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var Deferred = class {
	constructor() {
		this.reject = () => {};
		this.resolve = () => {};
		this.promise = new Promise((resolve, reject) => {
			this.resolve = resolve;
			this.reject = reject;
		});
	}
	/**
	* Our API internals are not promisified and cannot because our callback APIs have subtle expectations around
	* invoking promises inline, which Promises are forbidden to do. This method accepts an optional node-style callback
	* and returns a node-style callback which will resolve or reject the Deferred's promise.
	*/
	wrapCallback(callback) {
		return (error, value) => {
			if (error) this.reject(error);
			else this.resolve(value);
			if (typeof callback === "function") {
				this.promise.catch(() => {});
				if (callback.length === 1) callback(error);
				else callback(error, value);
			}
		};
	}
};
/**
* @license
* Copyright 2025 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* Checks whether host is a cloud workstation or not.
* @public
*/
function isCloudWorkstation(url) {
	try {
		return (url.startsWith("http://") || url.startsWith("https://") ? new URL(url).hostname : url).endsWith(".cloudworkstations.dev");
	} catch (_a) {
		return false;
	}
}
/**
* Makes a fetch request to the given server.
* Mostly used for forwarding cookies in Firebase Studio.
* @public
*/
async function pingServer(endpoint) {
	return (await fetch(endpoint, { credentials: "include" })).ok;
}
/**
* @license
* Copyright 2021 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
function createMockUserToken(token, projectId) {
	if (token.uid) throw new Error("The \"uid\" field is no longer supported by mockUserToken. Please use \"sub\" instead for Firebase Auth User ID.");
	const header = {
		alg: "none",
		type: "JWT"
	};
	const project = projectId || "demo-project";
	const iat = token.iat || 0;
	const sub = token.sub || token.user_id;
	if (!sub) throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");
	const payload = Object.assign({
		iss: `https://securetoken.google.com/${project}`,
		aud: project,
		iat,
		exp: iat + 3600,
		auth_time: iat,
		sub,
		user_id: sub,
		firebase: {
			sign_in_provider: "custom",
			identities: {}
		}
	}, token);
	return [
		base64urlEncodeWithoutPadding(JSON.stringify(header)),
		base64urlEncodeWithoutPadding(JSON.stringify(payload)),
		""
	].join(".");
}
var emulatorStatus = {};
function getEmulatorSummary() {
	const summary = {
		prod: [],
		emulator: []
	};
	for (const key of Object.keys(emulatorStatus)) if (emulatorStatus[key]) summary.emulator.push(key);
	else summary.prod.push(key);
	return summary;
}
function getOrCreateEl(id) {
	let parentDiv = document.getElementById(id);
	let created = false;
	if (!parentDiv) {
		parentDiv = document.createElement("div");
		parentDiv.setAttribute("id", id);
		created = true;
	}
	return {
		created,
		element: parentDiv
	};
}
var previouslyDismissed = false;
/**
* Updates Emulator Banner. Primarily used for Firebase Studio
* @param name
* @param isRunningEmulator
* @public
*/
function updateEmulatorBanner(name, isRunningEmulator) {
	if (typeof window === "undefined" || typeof document === "undefined" || !isCloudWorkstation(window.location.host) || emulatorStatus[name] === isRunningEmulator || emulatorStatus[name] || previouslyDismissed) return;
	emulatorStatus[name] = isRunningEmulator;
	function prefixedId(id) {
		return `__firebase__banner__${id}`;
	}
	const bannerId = "__firebase__banner";
	const showError = getEmulatorSummary().prod.length > 0;
	function tearDown() {
		const element = document.getElementById(bannerId);
		if (element) element.remove();
	}
	function setupBannerStyles(bannerEl) {
		bannerEl.style.display = "flex";
		bannerEl.style.background = "#7faaf0";
		bannerEl.style.position = "fixed";
		bannerEl.style.bottom = "5px";
		bannerEl.style.left = "5px";
		bannerEl.style.padding = ".5em";
		bannerEl.style.borderRadius = "5px";
		bannerEl.style.alignItems = "center";
	}
	function setupIconStyles(prependIcon, iconId) {
		prependIcon.setAttribute("width", "24");
		prependIcon.setAttribute("id", iconId);
		prependIcon.setAttribute("height", "24");
		prependIcon.setAttribute("viewBox", "0 0 24 24");
		prependIcon.setAttribute("fill", "none");
		prependIcon.style.marginLeft = "-6px";
	}
	function setupCloseBtn() {
		const closeBtn = document.createElement("span");
		closeBtn.style.cursor = "pointer";
		closeBtn.style.marginLeft = "16px";
		closeBtn.style.fontSize = "24px";
		closeBtn.innerHTML = " &times;";
		closeBtn.onclick = () => {
			previouslyDismissed = true;
			tearDown();
		};
		return closeBtn;
	}
	function setupLinkStyles(learnMoreLink, learnMoreId) {
		learnMoreLink.setAttribute("id", learnMoreId);
		learnMoreLink.innerText = "Learn more";
		learnMoreLink.href = "https://firebase.google.com/docs/studio/preview-apps#preview-backend";
		learnMoreLink.setAttribute("target", "__blank");
		learnMoreLink.style.paddingLeft = "5px";
		learnMoreLink.style.textDecoration = "underline";
	}
	function setupDom() {
		const banner = getOrCreateEl(bannerId);
		const firebaseTextId = prefixedId("text");
		const firebaseText = document.getElementById(firebaseTextId) || document.createElement("span");
		const learnMoreId = prefixedId("learnmore");
		const learnMoreLink = document.getElementById(learnMoreId) || document.createElement("a");
		const prependIconId = prefixedId("preprendIcon");
		const prependIcon = document.getElementById(prependIconId) || document.createElementNS("http://www.w3.org/2000/svg", "svg");
		if (banner.created) {
			const bannerEl = banner.element;
			setupBannerStyles(bannerEl);
			setupLinkStyles(learnMoreLink, learnMoreId);
			const closeBtn = setupCloseBtn();
			setupIconStyles(prependIcon, prependIconId);
			bannerEl.append(prependIcon, firebaseText, learnMoreLink, closeBtn);
			document.body.appendChild(bannerEl);
		}
		if (showError) {
			firebaseText.innerText = `Preview backend disconnected.`;
			prependIcon.innerHTML = `<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`;
		} else {
			prependIcon.innerHTML = `<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`;
			firebaseText.innerText = "Preview backend running in this workspace.";
		}
		firebaseText.setAttribute("id", firebaseTextId);
	}
	if (document.readyState === "loading") window.addEventListener("DOMContentLoaded", setupDom);
	else setupDom();
}
/**
* @license
* Copyright 2017 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* Returns navigator.userAgent string or '' if it's not defined.
* @return user agent string
*/
function getUA() {
	if (typeof navigator !== "undefined" && typeof navigator["userAgent"] === "string") return navigator["userAgent"];
	else return "";
}
/**
* Detect Cordova / PhoneGap / Ionic frameworks on a mobile device.
*
* Deliberately does not rely on checking `file://` URLs (as this fails PhoneGap
* in the Ripple emulator) nor Cordova `onDeviceReady`, which would normally
* wait for a callback.
*/
function isMobileCordova() {
	return typeof window !== "undefined" && !!(window["cordova"] || window["phonegap"] || window["PhoneGap"]) && /ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(getUA());
}
/**
* Detect Node.js.
*
* @return true if Node.js environment is detected or specified.
*/
function isNode() {
	var _a;
	const forceEnvironment = (_a = getDefaults()) === null || _a === void 0 ? void 0 : _a.forceEnvironment;
	if (forceEnvironment === "node") return true;
	else if (forceEnvironment === "browser") return false;
	try {
		return Object.prototype.toString.call(global.process) === "[object process]";
	} catch (e) {
		return false;
	}
}
/**
* Detect Cloudflare Worker context.
*/
function isCloudflareWorker() {
	return typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";
}
function isBrowserExtension() {
	const runtime = typeof chrome === "object" ? chrome.runtime : typeof browser === "object" ? browser.runtime : void 0;
	return typeof runtime === "object" && runtime.id !== void 0;
}
/**
* Detect React Native.
*
* @return true if ReactNative environment is detected.
*/
function isReactNative() {
	return typeof navigator === "object" && navigator["product"] === "ReactNative";
}
/** Returns true if we are running in Safari. */
function isSafari() {
	return !isNode() && !!navigator.userAgent && navigator.userAgent.includes("Safari") && !navigator.userAgent.includes("Chrome");
}
/**
* This method checks if indexedDB is supported by current browser/service worker context
* @return true if indexedDB is supported by current browser/service worker context
*/
function isIndexedDBAvailable() {
	try {
		return typeof indexedDB === "object";
	} catch (e) {
		return false;
	}
}
/**
* This method validates browser/sw context for indexedDB by opening a dummy indexedDB database and reject
* if errors occur during the database open operation.
*
* @throws exception if current browser/sw context can't run idb.open (ex: Safari iframe, Firefox
* private browsing)
*/
function validateIndexedDBOpenable() {
	return new Promise((resolve, reject) => {
		try {
			let preExist = true;
			const DB_CHECK_NAME = "validate-browser-context-for-indexeddb-analytics-module";
			const request = self.indexedDB.open(DB_CHECK_NAME);
			request.onsuccess = () => {
				request.result.close();
				if (!preExist) self.indexedDB.deleteDatabase(DB_CHECK_NAME);
				resolve(true);
			};
			request.onupgradeneeded = () => {
				preExist = false;
			};
			request.onerror = () => {
				var _a;
				reject(((_a = request.error) === null || _a === void 0 ? void 0 : _a.message) || "");
			};
		} catch (error) {
			reject(error);
		}
	});
}
/**
*
* This method checks whether cookie is enabled within current browser
* @return true if cookie is enabled within current browser
*/
function areCookiesEnabled() {
	if (typeof navigator === "undefined" || !navigator.cookieEnabled) return false;
	return true;
}
/**
* @license
* Copyright 2017 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* @fileoverview Standardized Firebase Error.
*
* Usage:
*
*   // TypeScript string literals for type-safe codes
*   type Err =
*     'unknown' |
*     'object-not-found'
*     ;
*
*   // Closure enum for type-safe error codes
*   // at-enum {string}
*   var Err = {
*     UNKNOWN: 'unknown',
*     OBJECT_NOT_FOUND: 'object-not-found',
*   }
*
*   let errors: Map<Err, string> = {
*     'generic-error': "Unknown error",
*     'file-not-found': "Could not find file: {$file}",
*   };
*
*   // Type-safe function - must pass a valid error code as param.
*   let error = new ErrorFactory<Err>('service', 'Service', errors);
*
*   ...
*   throw error.create(Err.GENERIC);
*   ...
*   throw error.create(Err.FILE_NOT_FOUND, {'file': fileName});
*   ...
*   // Service: Could not file file: foo.txt (service/file-not-found).
*
*   catch (e) {
*     assert(e.message === "Could not find file: foo.txt.");
*     if ((e as FirebaseError)?.code === 'service/file-not-found') {
*       console.log("Could not read file: " + e['file']);
*     }
*   }
*/
var ERROR_NAME = "FirebaseError";
var FirebaseError = class FirebaseError extends Error {
	constructor(code, message, customData) {
		super(message);
		this.code = code;
		this.customData = customData;
		/** The custom name for all FirebaseErrors. */
		this.name = ERROR_NAME;
		Object.setPrototypeOf(this, FirebaseError.prototype);
		if (Error.captureStackTrace) Error.captureStackTrace(this, ErrorFactory.prototype.create);
	}
};
var ErrorFactory = class {
	constructor(service, serviceName, errors) {
		this.service = service;
		this.serviceName = serviceName;
		this.errors = errors;
	}
	create(code, ...data) {
		const customData = data[0] || {};
		const fullCode = `${this.service}/${code}`;
		const template = this.errors[code];
		const message = template ? replaceTemplate(template, customData) : "Error";
		return new FirebaseError(fullCode, `${this.serviceName}: ${message} (${fullCode}).`, customData);
	}
};
function replaceTemplate(template, data) {
	return template.replace(PATTERN, (_, key) => {
		const value = data[key];
		return value != null ? String(value) : `<${key}?>`;
	});
}
var PATTERN = /\{\$([^}]+)}/g;
/**
* @license
* Copyright 2017 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* @license
* Copyright 2017 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* @license
* Copyright 2017 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* Deep equal two objects. Support Arrays and Objects.
*/
function deepEqual(a, b) {
	if (a === b) return true;
	const aKeys = Object.keys(a);
	const bKeys = Object.keys(b);
	for (const k of aKeys) {
		if (!bKeys.includes(k)) return false;
		const aProp = a[k];
		const bProp = b[k];
		if (isObject(aProp) && isObject(bProp)) {
			if (!deepEqual(aProp, bProp)) return false;
		} else if (aProp !== bProp) return false;
	}
	for (const k of bKeys) if (!aKeys.includes(k)) return false;
	return true;
}
function isObject(thing) {
	return thing !== null && typeof thing === "object";
}
/**
* @license
* Copyright 2022 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* @license
* Copyright 2017 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* Returns a querystring-formatted string (e.g. &arg=val&arg2=val2) from a
* params object (e.g. {arg: 'val', arg2: 'val2'})
* Note: You must prepend it with ? when adding it to a URL.
*/
function querystring(querystringParams) {
	const params = [];
	for (const [key, value] of Object.entries(querystringParams)) if (Array.isArray(value)) value.forEach((arrayVal) => {
		params.push(encodeURIComponent(key) + "=" + encodeURIComponent(arrayVal));
	});
	else params.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
	return params.length ? "&" + params.join("&") : "";
}
/**
* Decodes a querystring (e.g. ?arg=val&arg2=val2) into a params object
* (e.g. {arg: 'val', arg2: 'val2'})
*/
function querystringDecode(querystring) {
	const obj = {};
	querystring.replace(/^\?/, "").split("&").forEach((token) => {
		if (token) {
			const [key, value] = token.split("=");
			obj[decodeURIComponent(key)] = decodeURIComponent(value);
		}
	});
	return obj;
}
/**
* Extract the query string part of a URL, including the leading question mark (if present).
*/
function extractQuerystring(url) {
	const queryStart = url.indexOf("?");
	if (!queryStart) return "";
	const fragmentStart = url.indexOf("#", queryStart);
	return url.substring(queryStart, fragmentStart > 0 ? fragmentStart : void 0);
}
/**
* @license
* Copyright 2017 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* Helper to make a Subscribe function (just like Promise helps make a
* Thenable).
*
* @param executor Function which can make calls to a single Observer
*     as a proxy.
* @param onNoObservers Callback when count of Observers goes to zero.
*/
function createSubscribe(executor, onNoObservers) {
	const proxy = new ObserverProxy(executor, onNoObservers);
	return proxy.subscribe.bind(proxy);
}
/**
* Implement fan-out for any number of Observers attached via a subscribe
* function.
*/
var ObserverProxy = class {
	/**
	* @param executor Function which can make calls to a single Observer
	*     as a proxy.
	* @param onNoObservers Callback when count of Observers goes to zero.
	*/
	constructor(executor, onNoObservers) {
		this.observers = [];
		this.unsubscribes = [];
		this.observerCount = 0;
		this.task = Promise.resolve();
		this.finalized = false;
		this.onNoObservers = onNoObservers;
		this.task.then(() => {
			executor(this);
		}).catch((e) => {
			this.error(e);
		});
	}
	next(value) {
		this.forEachObserver((observer) => {
			observer.next(value);
		});
	}
	error(error) {
		this.forEachObserver((observer) => {
			observer.error(error);
		});
		this.close(error);
	}
	complete() {
		this.forEachObserver((observer) => {
			observer.complete();
		});
		this.close();
	}
	/**
	* Subscribe function that can be used to add an Observer to the fan-out list.
	*
	* - We require that no event is sent to a subscriber synchronously to their
	*   call to subscribe().
	*/
	subscribe(nextOrObserver, error, complete) {
		let observer;
		if (nextOrObserver === void 0 && error === void 0 && complete === void 0) throw new Error("Missing Observer.");
		if (implementsAnyMethods(nextOrObserver, [
			"next",
			"error",
			"complete"
		])) observer = nextOrObserver;
		else observer = {
			next: nextOrObserver,
			error,
			complete
		};
		if (observer.next === void 0) observer.next = noop;
		if (observer.error === void 0) observer.error = noop;
		if (observer.complete === void 0) observer.complete = noop;
		const unsub = this.unsubscribeOne.bind(this, this.observers.length);
		if (this.finalized) this.task.then(() => {
			try {
				if (this.finalError) observer.error(this.finalError);
				else observer.complete();
			} catch (e) {}
		});
		this.observers.push(observer);
		return unsub;
	}
	unsubscribeOne(i) {
		if (this.observers === void 0 || this.observers[i] === void 0) return;
		delete this.observers[i];
		this.observerCount -= 1;
		if (this.observerCount === 0 && this.onNoObservers !== void 0) this.onNoObservers(this);
	}
	forEachObserver(fn) {
		if (this.finalized) return;
		for (let i = 0; i < this.observers.length; i++) this.sendOne(i, fn);
	}
	sendOne(i, fn) {
		this.task.then(() => {
			if (this.observers !== void 0 && this.observers[i] !== void 0) try {
				fn(this.observers[i]);
			} catch (e) {
				if (typeof console !== "undefined" && console.error) console.error(e);
			}
		});
	}
	close(err) {
		if (this.finalized) return;
		this.finalized = true;
		if (err !== void 0) this.finalError = err;
		this.task.then(() => {
			this.observers = void 0;
			this.onNoObservers = void 0;
		});
	}
};
/**
* Return true if the object passed in implements any of the named methods.
*/
function implementsAnyMethods(obj, methods) {
	if (typeof obj !== "object" || obj === null) return false;
	for (const method of methods) if (method in obj && typeof obj[method] === "function") return true;
	return false;
}
function noop() {}
/**
* @license
* Copyright 2017 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* @license
* Copyright 2017 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* The amount of milliseconds to exponentially increase.
*/
var DEFAULT_INTERVAL_MILLIS = 1e3;
/**
* The factor to backoff by.
* Should be a number greater than 1.
*/
var DEFAULT_BACKOFF_FACTOR = 2;
/**
* The maximum milliseconds to increase to.
*
* <p>Visible for testing
*/
var MAX_VALUE_MILLIS = 144e5;
/**
* The percentage of backoff time to randomize by.
* See
* http://go/safe-client-behavior#step-1-determine-the-appropriate-retry-interval-to-handle-spike-traffic
* for context.
*
* <p>Visible for testing
*/
var RANDOM_FACTOR = .5;
/**
* Based on the backoff method from
* https://github.com/google/closure-library/blob/master/closure/goog/math/exponentialbackoff.js.
* Extracted here so we don't need to pass metadata and a stateful ExponentialBackoff object around.
*/
function calculateBackoffMillis(backoffCount, intervalMillis = DEFAULT_INTERVAL_MILLIS, backoffFactor = DEFAULT_BACKOFF_FACTOR) {
	const currBaseValue = intervalMillis * Math.pow(backoffFactor, backoffCount);
	const randomWait = Math.round(RANDOM_FACTOR * currBaseValue * (Math.random() - .5) * 2);
	return Math.min(MAX_VALUE_MILLIS, currBaseValue + randomWait);
}
/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* @license
* Copyright 2021 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
function getModularInstance(service) {
	if (service && service._delegate) return service._delegate;
	else return service;
}
/**
* @license
* Copyright 2017 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
CONSTANTS.NODE_CLIENT = true;
//#endregion
//#region node_modules/@firebase/component/dist/esm/index.esm2017.js
/**
* Component for service name T, e.g. `auth`, `auth-internal`
*/
var Component = class {
	/**
	*
	* @param name The public service name, e.g. app, auth, firestore, database
	* @param instanceFactory Service factory responsible for creating the public interface
	* @param type whether the service provided by the component is public or private
	*/
	constructor(name, instanceFactory, type) {
		this.name = name;
		this.instanceFactory = instanceFactory;
		this.type = type;
		this.multipleInstances = false;
		/**
		* Properties to be added to the service namespace
		*/
		this.serviceProps = {};
		this.instantiationMode = "LAZY";
		this.onInstanceCreated = null;
	}
	setInstantiationMode(mode) {
		this.instantiationMode = mode;
		return this;
	}
	setMultipleInstances(multipleInstances) {
		this.multipleInstances = multipleInstances;
		return this;
	}
	setServiceProps(props) {
		this.serviceProps = props;
		return this;
	}
	setInstanceCreatedCallback(callback) {
		this.onInstanceCreated = callback;
		return this;
	}
};
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var DEFAULT_ENTRY_NAME$1 = "[DEFAULT]";
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* Provider for instance for service name T, e.g. 'auth', 'auth-internal'
* NameServiceMapping[T] is an alias for the type of the instance
*/
var Provider = class {
	constructor(name, container) {
		this.name = name;
		this.container = container;
		this.component = null;
		this.instances = /* @__PURE__ */ new Map();
		this.instancesDeferred = /* @__PURE__ */ new Map();
		this.instancesOptions = /* @__PURE__ */ new Map();
		this.onInitCallbacks = /* @__PURE__ */ new Map();
	}
	/**
	* @param identifier A provider can provide multiple instances of a service
	* if this.component.multipleInstances is true.
	*/
	get(identifier) {
		const normalizedIdentifier = this.normalizeInstanceIdentifier(identifier);
		if (!this.instancesDeferred.has(normalizedIdentifier)) {
			const deferred = new Deferred();
			this.instancesDeferred.set(normalizedIdentifier, deferred);
			if (this.isInitialized(normalizedIdentifier) || this.shouldAutoInitialize()) try {
				const instance = this.getOrInitializeService({ instanceIdentifier: normalizedIdentifier });
				if (instance) deferred.resolve(instance);
			} catch (e) {}
		}
		return this.instancesDeferred.get(normalizedIdentifier).promise;
	}
	getImmediate(options) {
		var _a;
		const normalizedIdentifier = this.normalizeInstanceIdentifier(options === null || options === void 0 ? void 0 : options.identifier);
		const optional = (_a = options === null || options === void 0 ? void 0 : options.optional) !== null && _a !== void 0 ? _a : false;
		if (this.isInitialized(normalizedIdentifier) || this.shouldAutoInitialize()) try {
			return this.getOrInitializeService({ instanceIdentifier: normalizedIdentifier });
		} catch (e) {
			if (optional) return null;
			else throw e;
		}
		else if (optional) return null;
		else throw Error(`Service ${this.name} is not available`);
	}
	getComponent() {
		return this.component;
	}
	setComponent(component) {
		if (component.name !== this.name) throw Error(`Mismatching Component ${component.name} for Provider ${this.name}.`);
		if (this.component) throw Error(`Component for ${this.name} has already been provided`);
		this.component = component;
		if (!this.shouldAutoInitialize()) return;
		if (isComponentEager(component)) try {
			this.getOrInitializeService({ instanceIdentifier: DEFAULT_ENTRY_NAME$1 });
		} catch (e) {}
		for (const [instanceIdentifier, instanceDeferred] of this.instancesDeferred.entries()) {
			const normalizedIdentifier = this.normalizeInstanceIdentifier(instanceIdentifier);
			try {
				const instance = this.getOrInitializeService({ instanceIdentifier: normalizedIdentifier });
				instanceDeferred.resolve(instance);
			} catch (e) {}
		}
	}
	clearInstance(identifier = DEFAULT_ENTRY_NAME$1) {
		this.instancesDeferred.delete(identifier);
		this.instancesOptions.delete(identifier);
		this.instances.delete(identifier);
	}
	async delete() {
		const services = Array.from(this.instances.values());
		await Promise.all([...services.filter((service) => "INTERNAL" in service).map((service) => service.INTERNAL.delete()), ...services.filter((service) => "_delete" in service).map((service) => service._delete())]);
	}
	isComponentSet() {
		return this.component != null;
	}
	isInitialized(identifier = DEFAULT_ENTRY_NAME$1) {
		return this.instances.has(identifier);
	}
	getOptions(identifier = DEFAULT_ENTRY_NAME$1) {
		return this.instancesOptions.get(identifier) || {};
	}
	initialize(opts = {}) {
		const { options = {} } = opts;
		const normalizedIdentifier = this.normalizeInstanceIdentifier(opts.instanceIdentifier);
		if (this.isInitialized(normalizedIdentifier)) throw Error(`${this.name}(${normalizedIdentifier}) has already been initialized`);
		if (!this.isComponentSet()) throw Error(`Component ${this.name} has not been registered yet`);
		const instance = this.getOrInitializeService({
			instanceIdentifier: normalizedIdentifier,
			options
		});
		for (const [instanceIdentifier, instanceDeferred] of this.instancesDeferred.entries()) if (normalizedIdentifier === this.normalizeInstanceIdentifier(instanceIdentifier)) instanceDeferred.resolve(instance);
		return instance;
	}
	/**
	*
	* @param callback - a function that will be invoked  after the provider has been initialized by calling provider.initialize().
	* The function is invoked SYNCHRONOUSLY, so it should not execute any longrunning tasks in order to not block the program.
	*
	* @param identifier An optional instance identifier
	* @returns a function to unregister the callback
	*/
	onInit(callback, identifier) {
		var _a;
		const normalizedIdentifier = this.normalizeInstanceIdentifier(identifier);
		const existingCallbacks = (_a = this.onInitCallbacks.get(normalizedIdentifier)) !== null && _a !== void 0 ? _a : /* @__PURE__ */ new Set();
		existingCallbacks.add(callback);
		this.onInitCallbacks.set(normalizedIdentifier, existingCallbacks);
		const existingInstance = this.instances.get(normalizedIdentifier);
		if (existingInstance) callback(existingInstance, normalizedIdentifier);
		return () => {
			existingCallbacks.delete(callback);
		};
	}
	/**
	* Invoke onInit callbacks synchronously
	* @param instance the service instance`
	*/
	invokeOnInitCallbacks(instance, identifier) {
		const callbacks = this.onInitCallbacks.get(identifier);
		if (!callbacks) return;
		for (const callback of callbacks) try {
			callback(instance, identifier);
		} catch (_a) {}
	}
	getOrInitializeService({ instanceIdentifier, options = {} }) {
		let instance = this.instances.get(instanceIdentifier);
		if (!instance && this.component) {
			instance = this.component.instanceFactory(this.container, {
				instanceIdentifier: normalizeIdentifierForFactory(instanceIdentifier),
				options
			});
			this.instances.set(instanceIdentifier, instance);
			this.instancesOptions.set(instanceIdentifier, options);
			/**
			* Invoke onInit listeners.
			* Note this.component.onInstanceCreated is different, which is used by the component creator,
			* while onInit listeners are registered by consumers of the provider.
			*/
			this.invokeOnInitCallbacks(instance, instanceIdentifier);
			/**
			* Order is important
			* onInstanceCreated() should be called after this.instances.set(instanceIdentifier, instance); which
			* makes `isInitialized()` return true.
			*/
			if (this.component.onInstanceCreated) try {
				this.component.onInstanceCreated(this.container, instanceIdentifier, instance);
			} catch (_a) {}
		}
		return instance || null;
	}
	normalizeInstanceIdentifier(identifier = DEFAULT_ENTRY_NAME$1) {
		if (this.component) return this.component.multipleInstances ? identifier : DEFAULT_ENTRY_NAME$1;
		else return identifier;
	}
	shouldAutoInitialize() {
		return !!this.component && this.component.instantiationMode !== "EXPLICIT";
	}
};
function normalizeIdentifierForFactory(identifier) {
	return identifier === DEFAULT_ENTRY_NAME$1 ? void 0 : identifier;
}
function isComponentEager(component) {
	return component.instantiationMode === "EAGER";
}
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* ComponentContainer that provides Providers for service name T, e.g. `auth`, `auth-internal`
*/
var ComponentContainer = class {
	constructor(name) {
		this.name = name;
		this.providers = /* @__PURE__ */ new Map();
	}
	/**
	*
	* @param component Component being added
	* @param overwrite When a component with the same name has already been registered,
	* if overwrite is true: overwrite the existing component with the new component and create a new
	* provider with the new component. It can be useful in tests where you want to use different mocks
	* for different tests.
	* if overwrite is false: throw an exception
	*/
	addComponent(component) {
		const provider = this.getProvider(component.name);
		if (provider.isComponentSet()) throw new Error(`Component ${component.name} has already been registered with ${this.name}`);
		provider.setComponent(component);
	}
	addOrOverwriteComponent(component) {
		if (this.getProvider(component.name).isComponentSet()) this.providers.delete(component.name);
		this.addComponent(component);
	}
	/**
	* getProvider provides a type safe interface where it can only be called with a field name
	* present in NameServiceMapping interface.
	*
	* Firebase SDKs providing services should extend NameServiceMapping interface to register
	* themselves.
	*/
	getProvider(name) {
		if (this.providers.has(name)) return this.providers.get(name);
		const provider = new Provider(name, this);
		this.providers.set(name, provider);
		return provider;
	}
	getProviders() {
		return Array.from(this.providers.values());
	}
};
//#endregion
//#region node_modules/@firebase/logger/dist/esm/index.esm2017.js
/**
* @license
* Copyright 2017 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* A container for all of the Logger instances
*/
var instances = [];
/**
* The JS SDK supports 5 log levels and also allows a user the ability to
* silence the logs altogether.
*
* The order is a follows:
* DEBUG < VERBOSE < INFO < WARN < ERROR
*
* All of the log types above the current log level will be captured (i.e. if
* you set the log level to `INFO`, errors will still be logged, but `DEBUG` and
* `VERBOSE` logs will not)
*/
var LogLevel;
(function(LogLevel) {
	LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
	LogLevel[LogLevel["VERBOSE"] = 1] = "VERBOSE";
	LogLevel[LogLevel["INFO"] = 2] = "INFO";
	LogLevel[LogLevel["WARN"] = 3] = "WARN";
	LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
	LogLevel[LogLevel["SILENT"] = 5] = "SILENT";
})(LogLevel || (LogLevel = {}));
var levelStringToEnum = {
	"debug": LogLevel.DEBUG,
	"verbose": LogLevel.VERBOSE,
	"info": LogLevel.INFO,
	"warn": LogLevel.WARN,
	"error": LogLevel.ERROR,
	"silent": LogLevel.SILENT
};
/**
* The default log level
*/
var defaultLogLevel = LogLevel.INFO;
/**
* By default, `console.debug` is not displayed in the developer console (in
* chrome). To avoid forcing users to have to opt-in to these logs twice
* (i.e. once for firebase, and once in the console), we are sending `DEBUG`
* logs to the `console.log` function.
*/
var ConsoleMethod = {
	[LogLevel.DEBUG]: "log",
	[LogLevel.VERBOSE]: "log",
	[LogLevel.INFO]: "info",
	[LogLevel.WARN]: "warn",
	[LogLevel.ERROR]: "error"
};
/**
* The default log handler will forward DEBUG, VERBOSE, INFO, WARN, and ERROR
* messages on to their corresponding console counterparts (if the log method
* is supported by the current log level)
*/
var defaultLogHandler = (instance, logType, ...args) => {
	if (logType < instance.logLevel) return;
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const method = ConsoleMethod[logType];
	if (method) console[method](`[${now}]  ${instance.name}:`, ...args);
	else throw new Error(`Attempted to log a message with an invalid logType (value: ${logType})`);
};
var Logger = class {
	/**
	* Gives you an instance of a Logger to capture messages according to
	* Firebase's logging scheme.
	*
	* @param name The name that the logs will be associated with
	*/
	constructor(name) {
		this.name = name;
		/**
		* The log level of the given Logger instance.
		*/
		this._logLevel = defaultLogLevel;
		/**
		* The main (internal) log handler for the Logger instance.
		* Can be set to a new function in internal package code but not by user.
		*/
		this._logHandler = defaultLogHandler;
		/**
		* The optional, additional, user-defined log handler for the Logger instance.
		*/
		this._userLogHandler = null;
		/**
		* Capture the current instance for later use
		*/
		instances.push(this);
	}
	get logLevel() {
		return this._logLevel;
	}
	set logLevel(val) {
		if (!(val in LogLevel)) throw new TypeError(`Invalid value "${val}" assigned to \`logLevel\``);
		this._logLevel = val;
	}
	setLogLevel(val) {
		this._logLevel = typeof val === "string" ? levelStringToEnum[val] : val;
	}
	get logHandler() {
		return this._logHandler;
	}
	set logHandler(val) {
		if (typeof val !== "function") throw new TypeError("Value assigned to `logHandler` must be a function");
		this._logHandler = val;
	}
	get userLogHandler() {
		return this._userLogHandler;
	}
	set userLogHandler(val) {
		this._userLogHandler = val;
	}
	/**
	* The functions below are all based on the `console` interface
	*/
	debug(...args) {
		this._userLogHandler && this._userLogHandler(this, LogLevel.DEBUG, ...args);
		this._logHandler(this, LogLevel.DEBUG, ...args);
	}
	log(...args) {
		this._userLogHandler && this._userLogHandler(this, LogLevel.VERBOSE, ...args);
		this._logHandler(this, LogLevel.VERBOSE, ...args);
	}
	info(...args) {
		this._userLogHandler && this._userLogHandler(this, LogLevel.INFO, ...args);
		this._logHandler(this, LogLevel.INFO, ...args);
	}
	warn(...args) {
		this._userLogHandler && this._userLogHandler(this, LogLevel.WARN, ...args);
		this._logHandler(this, LogLevel.WARN, ...args);
	}
	error(...args) {
		this._userLogHandler && this._userLogHandler(this, LogLevel.ERROR, ...args);
		this._logHandler(this, LogLevel.ERROR, ...args);
	}
};
//#endregion
//#region node_modules/idb/build/wrap-idb-value.js
var instanceOfAny = (object, constructors) => constructors.some((c) => object instanceof c);
var idbProxyableTypes;
var cursorAdvanceMethods;
function getIdbProxyableTypes() {
	return idbProxyableTypes || (idbProxyableTypes = [
		IDBDatabase,
		IDBObjectStore,
		IDBIndex,
		IDBCursor,
		IDBTransaction
	]);
}
function getCursorAdvanceMethods() {
	return cursorAdvanceMethods || (cursorAdvanceMethods = [
		IDBCursor.prototype.advance,
		IDBCursor.prototype.continue,
		IDBCursor.prototype.continuePrimaryKey
	]);
}
var cursorRequestMap = /* @__PURE__ */ new WeakMap();
var transactionDoneMap = /* @__PURE__ */ new WeakMap();
var transactionStoreNamesMap = /* @__PURE__ */ new WeakMap();
var transformCache = /* @__PURE__ */ new WeakMap();
var reverseTransformCache = /* @__PURE__ */ new WeakMap();
function promisifyRequest(request) {
	const promise = new Promise((resolve, reject) => {
		const unlisten = () => {
			request.removeEventListener("success", success);
			request.removeEventListener("error", error);
		};
		const success = () => {
			resolve(wrap(request.result));
			unlisten();
		};
		const error = () => {
			reject(request.error);
			unlisten();
		};
		request.addEventListener("success", success);
		request.addEventListener("error", error);
	});
	promise.then((value) => {
		if (value instanceof IDBCursor) cursorRequestMap.set(value, request);
	}).catch(() => {});
	reverseTransformCache.set(promise, request);
	return promise;
}
function cacheDonePromiseForTransaction(tx) {
	if (transactionDoneMap.has(tx)) return;
	const done = new Promise((resolve, reject) => {
		const unlisten = () => {
			tx.removeEventListener("complete", complete);
			tx.removeEventListener("error", error);
			tx.removeEventListener("abort", error);
		};
		const complete = () => {
			resolve();
			unlisten();
		};
		const error = () => {
			reject(tx.error || new DOMException("AbortError", "AbortError"));
			unlisten();
		};
		tx.addEventListener("complete", complete);
		tx.addEventListener("error", error);
		tx.addEventListener("abort", error);
	});
	transactionDoneMap.set(tx, done);
}
var idbProxyTraps = {
	get(target, prop, receiver) {
		if (target instanceof IDBTransaction) {
			if (prop === "done") return transactionDoneMap.get(target);
			if (prop === "objectStoreNames") return target.objectStoreNames || transactionStoreNamesMap.get(target);
			if (prop === "store") return receiver.objectStoreNames[1] ? void 0 : receiver.objectStore(receiver.objectStoreNames[0]);
		}
		return wrap(target[prop]);
	},
	set(target, prop, value) {
		target[prop] = value;
		return true;
	},
	has(target, prop) {
		if (target instanceof IDBTransaction && (prop === "done" || prop === "store")) return true;
		return prop in target;
	}
};
function replaceTraps(callback) {
	idbProxyTraps = callback(idbProxyTraps);
}
function wrapFunction(func) {
	if (func === IDBDatabase.prototype.transaction && !("objectStoreNames" in IDBTransaction.prototype)) return function(storeNames, ...args) {
		const tx = func.call(unwrap(this), storeNames, ...args);
		transactionStoreNamesMap.set(tx, storeNames.sort ? storeNames.sort() : [storeNames]);
		return wrap(tx);
	};
	if (getCursorAdvanceMethods().includes(func)) return function(...args) {
		func.apply(unwrap(this), args);
		return wrap(cursorRequestMap.get(this));
	};
	return function(...args) {
		return wrap(func.apply(unwrap(this), args));
	};
}
function transformCachableValue(value) {
	if (typeof value === "function") return wrapFunction(value);
	if (value instanceof IDBTransaction) cacheDonePromiseForTransaction(value);
	if (instanceOfAny(value, getIdbProxyableTypes())) return new Proxy(value, idbProxyTraps);
	return value;
}
function wrap(value) {
	if (value instanceof IDBRequest) return promisifyRequest(value);
	if (transformCache.has(value)) return transformCache.get(value);
	const newValue = transformCachableValue(value);
	if (newValue !== value) {
		transformCache.set(value, newValue);
		reverseTransformCache.set(newValue, value);
	}
	return newValue;
}
var unwrap = (value) => reverseTransformCache.get(value);
//#endregion
//#region node_modules/idb/build/index.js
/**
* Open a database.
*
* @param name Name of the database.
* @param version Schema version.
* @param callbacks Additional callbacks.
*/
function openDB(name, version, { blocked, upgrade, blocking, terminated } = {}) {
	const request = indexedDB.open(name, version);
	const openPromise = wrap(request);
	if (upgrade) request.addEventListener("upgradeneeded", (event) => {
		upgrade(wrap(request.result), event.oldVersion, event.newVersion, wrap(request.transaction), event);
	});
	if (blocked) request.addEventListener("blocked", (event) => blocked(event.oldVersion, event.newVersion, event));
	openPromise.then((db) => {
		if (terminated) db.addEventListener("close", () => terminated());
		if (blocking) db.addEventListener("versionchange", (event) => blocking(event.oldVersion, event.newVersion, event));
	}).catch(() => {});
	return openPromise;
}
var readMethods = [
	"get",
	"getKey",
	"getAll",
	"getAllKeys",
	"count"
];
var writeMethods = [
	"put",
	"add",
	"delete",
	"clear"
];
var cachedMethods = /* @__PURE__ */ new Map();
function getMethod(target, prop) {
	if (!(target instanceof IDBDatabase && !(prop in target) && typeof prop === "string")) return;
	if (cachedMethods.get(prop)) return cachedMethods.get(prop);
	const targetFuncName = prop.replace(/FromIndex$/, "");
	const useIndex = prop !== targetFuncName;
	const isWrite = writeMethods.includes(targetFuncName);
	if (!(targetFuncName in (useIndex ? IDBIndex : IDBObjectStore).prototype) || !(isWrite || readMethods.includes(targetFuncName))) return;
	const method = async function(storeName, ...args) {
		const tx = this.transaction(storeName, isWrite ? "readwrite" : "readonly");
		let target = tx.store;
		if (useIndex) target = target.index(args.shift());
		return (await Promise.all([target[targetFuncName](...args), isWrite && tx.done]))[0];
	};
	cachedMethods.set(prop, method);
	return method;
}
replaceTraps((oldTraps) => ({
	...oldTraps,
	get: (target, prop, receiver) => getMethod(target, prop) || oldTraps.get(target, prop, receiver),
	has: (target, prop) => !!getMethod(target, prop) || oldTraps.has(target, prop)
}));
//#endregion
//#region node_modules/@firebase/app/dist/esm/index.esm2017.js
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var PlatformLoggerServiceImpl = class {
	constructor(container) {
		this.container = container;
	}
	getPlatformInfoString() {
		return this.container.getProviders().map((provider) => {
			if (isVersionServiceProvider(provider)) {
				const service = provider.getImmediate();
				return `${service.library}/${service.version}`;
			} else return null;
		}).filter((logString) => logString).join(" ");
	}
};
/**
*
* @param provider check if this provider provides a VersionService
*
* NOTE: Using Provider<'app-version'> is a hack to indicate that the provider
* provides VersionService. The provider is not necessarily a 'app-version'
* provider.
*/
function isVersionServiceProvider(provider) {
	const component = provider.getComponent();
	return (component === null || component === void 0 ? void 0 : component.type) === "VERSION";
}
var name$q = "@firebase/app";
var version$1$1 = "0.13.2";
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var logger$1 = new Logger("@firebase/app");
var name$p = "@firebase/app-compat";
var name$o = "@firebase/analytics-compat";
var name$n = "@firebase/analytics";
var name$m = "@firebase/app-check-compat";
var name$l = "@firebase/app-check";
var name$k = "@firebase/auth";
var name$j = "@firebase/auth-compat";
var name$i = "@firebase/database";
var name$h = "@firebase/data-connect";
var name$g = "@firebase/database-compat";
var name$f = "@firebase/functions";
var name$e = "@firebase/functions-compat";
var name$d = "@firebase/installations";
var name$c = "@firebase/installations-compat";
var name$b = "@firebase/messaging";
var name$a = "@firebase/messaging-compat";
var name$9 = "@firebase/performance";
var name$8 = "@firebase/performance-compat";
var name$7 = "@firebase/remote-config";
var name$6 = "@firebase/remote-config-compat";
var name$5 = "@firebase/storage";
var name$4 = "@firebase/storage-compat";
var name$3 = "@firebase/firestore";
var name$2 = "@firebase/ai";
var name$1$1 = "@firebase/firestore-compat";
var name$10 = "firebase";
var version$2 = "11.10.0";
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* The default app name
*
* @internal
*/
var DEFAULT_ENTRY_NAME = "[DEFAULT]";
var PLATFORM_LOG_STRING = {
	[name$q]: "fire-core",
	[name$p]: "fire-core-compat",
	[name$n]: "fire-analytics",
	[name$o]: "fire-analytics-compat",
	[name$l]: "fire-app-check",
	[name$m]: "fire-app-check-compat",
	[name$k]: "fire-auth",
	[name$j]: "fire-auth-compat",
	[name$i]: "fire-rtdb",
	[name$h]: "fire-data-connect",
	[name$g]: "fire-rtdb-compat",
	[name$f]: "fire-fn",
	[name$e]: "fire-fn-compat",
	[name$d]: "fire-iid",
	[name$c]: "fire-iid-compat",
	[name$b]: "fire-fcm",
	[name$a]: "fire-fcm-compat",
	[name$9]: "fire-perf",
	[name$8]: "fire-perf-compat",
	[name$7]: "fire-rc",
	[name$6]: "fire-rc-compat",
	[name$5]: "fire-gcs",
	[name$4]: "fire-gcs-compat",
	[name$3]: "fire-fst",
	[name$1$1]: "fire-fst-compat",
	[name$2]: "fire-vertex",
	"fire-js": "fire-js",
	[name$10]: "fire-js-all"
};
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* @internal
*/
var _apps = /* @__PURE__ */ new Map();
/**
* @internal
*/
var _serverApps = /* @__PURE__ */ new Map();
/**
* Registered components.
*
* @internal
*/
var _components = /* @__PURE__ */ new Map();
/**
* @param component - the component being added to this app's container
*
* @internal
*/
function _addComponent(app, component) {
	try {
		app.container.addComponent(component);
	} catch (e) {
		logger$1.debug(`Component ${component.name} failed to register with FirebaseApp ${app.name}`, e);
	}
}
/**
*
* @param component - the component to register
* @returns whether or not the component is registered successfully
*
* @internal
*/
function _registerComponent(component) {
	const componentName = component.name;
	if (_components.has(componentName)) {
		logger$1.debug(`There were multiple attempts to register component ${componentName}.`);
		return false;
	}
	_components.set(componentName, component);
	for (const app of _apps.values()) _addComponent(app, component);
	for (const serverApp of _serverApps.values()) _addComponent(serverApp, component);
	return true;
}
/**
*
* @param app - FirebaseApp instance
* @param name - service name
*
* @returns the provider for the service with the matching name
*
* @internal
*/
function _getProvider(app, name) {
	const heartbeatController = app.container.getProvider("heartbeat").getImmediate({ optional: true });
	if (heartbeatController) heartbeatController.triggerHeartbeat();
	return app.container.getProvider(name);
}
/**
*
* @param obj - an object of type FirebaseApp.
*
* @returns true if the provided object is of type FirebaseServerAppImpl.
*
* @internal
*/
function _isFirebaseServerApp(obj) {
	if (obj === null || obj === void 0) return false;
	return obj.settings !== void 0;
}
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var ERROR_FACTORY$2 = new ErrorFactory("app", "Firebase", {
	["no-app"]: "No Firebase App '{$appName}' has been created - call initializeApp() first",
	["bad-app-name"]: "Illegal App name: '{$appName}'",
	["duplicate-app"]: "Firebase App named '{$appName}' already exists with different options or config",
	["app-deleted"]: "Firebase App named '{$appName}' already deleted",
	["server-app-deleted"]: "Firebase Server App has been deleted",
	["no-options"]: "Need to provide options, when not being deployed to hosting via source.",
	["invalid-app-argument"]: "firebase.{$appName}() takes either no argument or a Firebase App instance.",
	["invalid-log-argument"]: "First argument to `onLog` must be null or a function.",
	["idb-open"]: "Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.",
	["idb-get"]: "Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.",
	["idb-set"]: "Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.",
	["idb-delete"]: "Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.",
	["finalization-registry-not-supported"]: "FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.",
	["invalid-server-app-environment"]: "FirebaseServerApp is not for use in browser environments."
});
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var FirebaseAppImpl = class {
	constructor(options, config, container) {
		this._isDeleted = false;
		this._options = Object.assign({}, options);
		this._config = Object.assign({}, config);
		this._name = config.name;
		this._automaticDataCollectionEnabled = config.automaticDataCollectionEnabled;
		this._container = container;
		this.container.addComponent(new Component("app", () => this, "PUBLIC"));
	}
	get automaticDataCollectionEnabled() {
		this.checkDestroyed();
		return this._automaticDataCollectionEnabled;
	}
	set automaticDataCollectionEnabled(val) {
		this.checkDestroyed();
		this._automaticDataCollectionEnabled = val;
	}
	get name() {
		this.checkDestroyed();
		return this._name;
	}
	get options() {
		this.checkDestroyed();
		return this._options;
	}
	get config() {
		this.checkDestroyed();
		return this._config;
	}
	get container() {
		return this._container;
	}
	get isDeleted() {
		return this._isDeleted;
	}
	set isDeleted(val) {
		this._isDeleted = val;
	}
	/**
	* This function will throw an Error if the App has already been deleted -
	* use before performing API actions on the App.
	*/
	checkDestroyed() {
		if (this.isDeleted) throw ERROR_FACTORY$2.create("app-deleted", { appName: this._name });
	}
};
/**
* @license
* Copyright 2023 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* The current SDK version.
*
* @public
*/
var SDK_VERSION = version$2;
function initializeApp(_options, rawConfig = {}) {
	let options = _options;
	if (typeof rawConfig !== "object") rawConfig = { name: rawConfig };
	const config = Object.assign({
		name: DEFAULT_ENTRY_NAME,
		automaticDataCollectionEnabled: true
	}, rawConfig);
	const name = config.name;
	if (typeof name !== "string" || !name) throw ERROR_FACTORY$2.create("bad-app-name", { appName: String(name) });
	options || (options = getDefaultAppConfig());
	if (!options) throw ERROR_FACTORY$2.create("no-options");
	const existingApp = _apps.get(name);
	if (existingApp) {
		if (deepEqual(options, existingApp.options) && deepEqual(config, existingApp.config)) return existingApp;
		else throw ERROR_FACTORY$2.create("duplicate-app", { appName: name });
	}
	const container = new ComponentContainer(name);
	for (const component of _components.values()) container.addComponent(component);
	const newApp = new FirebaseAppImpl(options, config, container);
	_apps.set(name, newApp);
	return newApp;
}
/**
* Retrieves a {@link @firebase/app#FirebaseApp} instance.
*
* When called with no arguments, the default app is returned. When an app name
* is provided, the app corresponding to that name is returned.
*
* An exception is thrown if the app being retrieved has not yet been
* initialized.
*
* @example
* ```javascript
* // Return the default app
* const app = getApp();
* ```
*
* @example
* ```javascript
* // Return a named app
* const otherApp = getApp("otherApp");
* ```
*
* @param name - Optional name of the app to return. If no name is
*   provided, the default is `"[DEFAULT]"`.
*
* @returns The app corresponding to the provided app name.
*   If no app name is provided, the default app is returned.
*
* @public
*/
function getApp(name = DEFAULT_ENTRY_NAME) {
	const app = _apps.get(name);
	if (!app && name === "[DEFAULT]" && getDefaultAppConfig()) return initializeApp();
	if (!app) throw ERROR_FACTORY$2.create("no-app", { appName: name });
	return app;
}
/**
* A (read-only) array of all initialized apps.
* @public
*/
function getApps() {
	return Array.from(_apps.values());
}
/**
* Registers a library's name and version for platform logging purposes.
* @param library - Name of 1p or 3p library (e.g. firestore, angularfire)
* @param version - Current version of that library.
* @param variant - Bundle variant, e.g., node, rn, etc.
*
* @public
*/
function registerVersion(libraryKeyOrName, version, variant) {
	var _a;
	let library = (_a = PLATFORM_LOG_STRING[libraryKeyOrName]) !== null && _a !== void 0 ? _a : libraryKeyOrName;
	if (variant) library += `-${variant}`;
	const libraryMismatch = library.match(/\s|\//);
	const versionMismatch = version.match(/\s|\//);
	if (libraryMismatch || versionMismatch) {
		const warning = [`Unable to register library "${library}" with version "${version}":`];
		if (libraryMismatch) warning.push(`library name "${library}" contains illegal characters (whitespace or "/")`);
		if (libraryMismatch && versionMismatch) warning.push("and");
		if (versionMismatch) warning.push(`version name "${version}" contains illegal characters (whitespace or "/")`);
		logger$1.warn(warning.join(" "));
		return;
	}
	_registerComponent(new Component(`${library}-version`, () => ({
		library,
		version
	}), "VERSION"));
}
/**
* @license
* Copyright 2021 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var DB_NAME = "firebase-heartbeat-database";
var DB_VERSION = 1;
var STORE_NAME = "firebase-heartbeat-store";
var dbPromise$1 = null;
function getDbPromise$1() {
	if (!dbPromise$1) dbPromise$1 = openDB(DB_NAME, DB_VERSION, { upgrade: (db, oldVersion) => {
		switch (oldVersion) {
			case 0: try {
				db.createObjectStore(STORE_NAME);
			} catch (e) {
				console.warn(e);
			}
		}
	} }).catch((e) => {
		throw ERROR_FACTORY$2.create("idb-open", { originalErrorMessage: e.message });
	});
	return dbPromise$1;
}
async function readHeartbeatsFromIndexedDB(app) {
	try {
		const tx = (await getDbPromise$1()).transaction(STORE_NAME);
		const result = await tx.objectStore(STORE_NAME).get(computeKey(app));
		await tx.done;
		return result;
	} catch (e) {
		if (e instanceof FirebaseError) logger$1.warn(e.message);
		else {
			const idbGetError = ERROR_FACTORY$2.create("idb-get", { originalErrorMessage: e === null || e === void 0 ? void 0 : e.message });
			logger$1.warn(idbGetError.message);
		}
	}
}
async function writeHeartbeatsToIndexedDB(app, heartbeatObject) {
	try {
		const tx = (await getDbPromise$1()).transaction(STORE_NAME, "readwrite");
		await tx.objectStore(STORE_NAME).put(heartbeatObject, computeKey(app));
		await tx.done;
	} catch (e) {
		if (e instanceof FirebaseError) logger$1.warn(e.message);
		else {
			const idbGetError = ERROR_FACTORY$2.create("idb-set", { originalErrorMessage: e === null || e === void 0 ? void 0 : e.message });
			logger$1.warn(idbGetError.message);
		}
	}
}
function computeKey(app) {
	return `${app.name}!${app.options.appId}`;
}
/**
* @license
* Copyright 2021 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var MAX_HEADER_BYTES = 1024;
var MAX_NUM_STORED_HEARTBEATS = 30;
var HeartbeatServiceImpl = class {
	constructor(container) {
		this.container = container;
		/**
		* In-memory cache for heartbeats, used by getHeartbeatsHeader() to generate
		* the header string.
		* Stores one record per date. This will be consolidated into the standard
		* format of one record per user agent string before being sent as a header.
		* Populated from indexedDB when the controller is instantiated and should
		* be kept in sync with indexedDB.
		* Leave public for easier testing.
		*/
		this._heartbeatsCache = null;
		const app = this.container.getProvider("app").getImmediate();
		this._storage = new HeartbeatStorageImpl(app);
		this._heartbeatsCachePromise = this._storage.read().then((result) => {
			this._heartbeatsCache = result;
			return result;
		});
	}
	/**
	* Called to report a heartbeat. The function will generate
	* a HeartbeatsByUserAgent object, update heartbeatsCache, and persist it
	* to IndexedDB.
	* Note that we only store one heartbeat per day. So if a heartbeat for today is
	* already logged, subsequent calls to this function in the same day will be ignored.
	*/
	async triggerHeartbeat() {
		var _a, _b;
		try {
			const agent = this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString();
			const date = getUTCDateString();
			if (((_a = this._heartbeatsCache) === null || _a === void 0 ? void 0 : _a.heartbeats) == null) {
				this._heartbeatsCache = await this._heartbeatsCachePromise;
				if (((_b = this._heartbeatsCache) === null || _b === void 0 ? void 0 : _b.heartbeats) == null) return;
			}
			if (this._heartbeatsCache.lastSentHeartbeatDate === date || this._heartbeatsCache.heartbeats.some((singleDateHeartbeat) => singleDateHeartbeat.date === date)) return;
			else {
				this._heartbeatsCache.heartbeats.push({
					date,
					agent
				});
				if (this._heartbeatsCache.heartbeats.length > MAX_NUM_STORED_HEARTBEATS) {
					const earliestHeartbeatIdx = getEarliestHeartbeatIdx(this._heartbeatsCache.heartbeats);
					this._heartbeatsCache.heartbeats.splice(earliestHeartbeatIdx, 1);
				}
			}
			return this._storage.overwrite(this._heartbeatsCache);
		} catch (e) {
			logger$1.warn(e);
		}
	}
	/**
	* Returns a base64 encoded string which can be attached to the heartbeat-specific header directly.
	* It also clears all heartbeats from memory as well as in IndexedDB.
	*
	* NOTE: Consuming product SDKs should not send the header if this method
	* returns an empty string.
	*/
	async getHeartbeatsHeader() {
		var _a;
		try {
			if (this._heartbeatsCache === null) await this._heartbeatsCachePromise;
			if (((_a = this._heartbeatsCache) === null || _a === void 0 ? void 0 : _a.heartbeats) == null || this._heartbeatsCache.heartbeats.length === 0) return "";
			const date = getUTCDateString();
			const { heartbeatsToSend, unsentEntries } = extractHeartbeatsForHeader(this._heartbeatsCache.heartbeats);
			const headerString = base64urlEncodeWithoutPadding(JSON.stringify({
				version: 2,
				heartbeats: heartbeatsToSend
			}));
			this._heartbeatsCache.lastSentHeartbeatDate = date;
			if (unsentEntries.length > 0) {
				this._heartbeatsCache.heartbeats = unsentEntries;
				await this._storage.overwrite(this._heartbeatsCache);
			} else {
				this._heartbeatsCache.heartbeats = [];
				this._storage.overwrite(this._heartbeatsCache);
			}
			return headerString;
		} catch (e) {
			logger$1.warn(e);
			return "";
		}
	}
};
function getUTCDateString() {
	return (/* @__PURE__ */ new Date()).toISOString().substring(0, 10);
}
function extractHeartbeatsForHeader(heartbeatsCache, maxSize = MAX_HEADER_BYTES) {
	const heartbeatsToSend = [];
	let unsentEntries = heartbeatsCache.slice();
	for (const singleDateHeartbeat of heartbeatsCache) {
		const heartbeatEntry = heartbeatsToSend.find((hb) => hb.agent === singleDateHeartbeat.agent);
		if (!heartbeatEntry) {
			heartbeatsToSend.push({
				agent: singleDateHeartbeat.agent,
				dates: [singleDateHeartbeat.date]
			});
			if (countBytes(heartbeatsToSend) > maxSize) {
				heartbeatsToSend.pop();
				break;
			}
		} else {
			heartbeatEntry.dates.push(singleDateHeartbeat.date);
			if (countBytes(heartbeatsToSend) > maxSize) {
				heartbeatEntry.dates.pop();
				break;
			}
		}
		unsentEntries = unsentEntries.slice(1);
	}
	return {
		heartbeatsToSend,
		unsentEntries
	};
}
var HeartbeatStorageImpl = class {
	constructor(app) {
		this.app = app;
		this._canUseIndexedDBPromise = this.runIndexedDBEnvironmentCheck();
	}
	async runIndexedDBEnvironmentCheck() {
		if (!isIndexedDBAvailable()) return false;
		else return validateIndexedDBOpenable().then(() => true).catch(() => false);
	}
	/**
	* Read all heartbeats.
	*/
	async read() {
		if (!await this._canUseIndexedDBPromise) return { heartbeats: [] };
		else {
			const idbHeartbeatObject = await readHeartbeatsFromIndexedDB(this.app);
			if (idbHeartbeatObject === null || idbHeartbeatObject === void 0 ? void 0 : idbHeartbeatObject.heartbeats) return idbHeartbeatObject;
			else return { heartbeats: [] };
		}
	}
	async overwrite(heartbeatsObject) {
		var _a;
		if (!await this._canUseIndexedDBPromise) return;
		else {
			const existingHeartbeatsObject = await this.read();
			return writeHeartbeatsToIndexedDB(this.app, {
				lastSentHeartbeatDate: (_a = heartbeatsObject.lastSentHeartbeatDate) !== null && _a !== void 0 ? _a : existingHeartbeatsObject.lastSentHeartbeatDate,
				heartbeats: heartbeatsObject.heartbeats
			});
		}
	}
	async add(heartbeatsObject) {
		var _a;
		if (!await this._canUseIndexedDBPromise) return;
		else {
			const existingHeartbeatsObject = await this.read();
			return writeHeartbeatsToIndexedDB(this.app, {
				lastSentHeartbeatDate: (_a = heartbeatsObject.lastSentHeartbeatDate) !== null && _a !== void 0 ? _a : existingHeartbeatsObject.lastSentHeartbeatDate,
				heartbeats: [...existingHeartbeatsObject.heartbeats, ...heartbeatsObject.heartbeats]
			});
		}
	}
};
/**
* Calculate bytes of a HeartbeatsByUserAgent array after being wrapped
* in a platform logging header JSON object, stringified, and converted
* to base 64.
*/
function countBytes(heartbeatsCache) {
	return base64urlEncodeWithoutPadding(JSON.stringify({
		version: 2,
		heartbeats: heartbeatsCache
	})).length;
}
/**
* Returns the index of the heartbeat with the earliest date.
* If the heartbeats array is empty, -1 is returned.
*/
function getEarliestHeartbeatIdx(heartbeats) {
	if (heartbeats.length === 0) return -1;
	let earliestHeartbeatIdx = 0;
	let earliestHeartbeatDate = heartbeats[0].date;
	for (let i = 1; i < heartbeats.length; i++) if (heartbeats[i].date < earliestHeartbeatDate) {
		earliestHeartbeatDate = heartbeats[i].date;
		earliestHeartbeatIdx = i;
	}
	return earliestHeartbeatIdx;
}
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
function registerCoreComponents(variant) {
	_registerComponent(new Component("platform-logger", (container) => new PlatformLoggerServiceImpl(container), "PRIVATE"));
	_registerComponent(new Component("heartbeat", (container) => new HeartbeatServiceImpl(container), "PRIVATE"));
	registerVersion(name$q, version$1$1, variant);
	registerVersion(name$q, version$1$1, "esm2017");
	registerVersion("fire-js", "");
}
/**
* Firebase App
*
* @remarks This package coordinates the communication between the different Firebase components
* @packageDocumentation
*/
registerCoreComponents("");
//#endregion
//#region node_modules/@firebase/installations/dist/esm/index.esm2017.js
var name$1 = "@firebase/installations";
var version$1 = "0.6.18";
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var PENDING_TIMEOUT_MS = 1e4;
var PACKAGE_VERSION = `w:${version$1}`;
var INTERNAL_AUTH_VERSION = "FIS_v2";
var INSTALLATIONS_API_URL = "https://firebaseinstallations.googleapis.com/v1";
var TOKEN_EXPIRATION_BUFFER = 36e5;
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var ERROR_FACTORY$1 = new ErrorFactory("installations", "Installations", {
	["missing-app-config-values"]: "Missing App configuration value: \"{$valueName}\"",
	["not-registered"]: "Firebase Installation is not registered.",
	["installation-not-found"]: "Firebase Installation not found.",
	["request-failed"]: "{$requestName} request failed with error \"{$serverCode} {$serverStatus}: {$serverMessage}\"",
	["app-offline"]: "Could not process request. Application offline.",
	["delete-pending-registration"]: "Can't delete installation while there is a pending registration request."
});
/** Returns true if error is a FirebaseError that is based on an error from the server. */
function isServerError(error) {
	return error instanceof FirebaseError && error.code.includes("request-failed");
}
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
function getInstallationsEndpoint({ projectId }) {
	return `${INSTALLATIONS_API_URL}/projects/${projectId}/installations`;
}
function extractAuthTokenInfoFromResponse(response) {
	return {
		token: response.token,
		requestStatus: 2,
		expiresIn: getExpiresInFromResponseExpiresIn(response.expiresIn),
		creationTime: Date.now()
	};
}
async function getErrorFromResponse(requestName, response) {
	const errorData = (await response.json()).error;
	return ERROR_FACTORY$1.create("request-failed", {
		requestName,
		serverCode: errorData.code,
		serverMessage: errorData.message,
		serverStatus: errorData.status
	});
}
function getHeaders$1({ apiKey }) {
	return new Headers({
		"Content-Type": "application/json",
		Accept: "application/json",
		"x-goog-api-key": apiKey
	});
}
function getHeadersWithAuth(appConfig, { refreshToken }) {
	const headers = getHeaders$1(appConfig);
	headers.append("Authorization", getAuthorizationHeader(refreshToken));
	return headers;
}
/**
* Calls the passed in fetch wrapper and returns the response.
* If the returned response has a status of 5xx, re-runs the function once and
* returns the response.
*/
async function retryIfServerError(fn) {
	const result = await fn();
	if (result.status >= 500 && result.status < 600) return fn();
	return result;
}
function getExpiresInFromResponseExpiresIn(responseExpiresIn) {
	return Number(responseExpiresIn.replace("s", "000"));
}
function getAuthorizationHeader(refreshToken) {
	return `${INTERNAL_AUTH_VERSION} ${refreshToken}`;
}
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
async function createInstallationRequest({ appConfig, heartbeatServiceProvider }, { fid }) {
	const endpoint = getInstallationsEndpoint(appConfig);
	const headers = getHeaders$1(appConfig);
	const heartbeatService = heartbeatServiceProvider.getImmediate({ optional: true });
	if (heartbeatService) {
		const heartbeatsHeader = await heartbeatService.getHeartbeatsHeader();
		if (heartbeatsHeader) headers.append("x-firebase-client", heartbeatsHeader);
	}
	const body = {
		fid,
		authVersion: INTERNAL_AUTH_VERSION,
		appId: appConfig.appId,
		sdkVersion: PACKAGE_VERSION
	};
	const request = {
		method: "POST",
		headers,
		body: JSON.stringify(body)
	};
	const response = await retryIfServerError(() => fetch(endpoint, request));
	if (response.ok) {
		const responseValue = await response.json();
		return {
			fid: responseValue.fid || fid,
			registrationStatus: 2,
			refreshToken: responseValue.refreshToken,
			authToken: extractAuthTokenInfoFromResponse(responseValue.authToken)
		};
	} else throw await getErrorFromResponse("Create Installation", response);
}
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/** Returns a promise that resolves after given time passes. */
function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
function bufferToBase64UrlSafe(array) {
	return btoa(String.fromCharCode(...array)).replace(/\+/g, "-").replace(/\//g, "_");
}
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var VALID_FID_PATTERN = /^[cdef][\w-]{21}$/;
var INVALID_FID = "";
/**
* Generates a new FID using random values from Web Crypto API.
* Returns an empty string if FID generation fails for any reason.
*/
function generateFid() {
	try {
		const fidByteArray = /* @__PURE__ */ new Uint8Array(17);
		(self.crypto || self.msCrypto).getRandomValues(fidByteArray);
		fidByteArray[0] = 112 + fidByteArray[0] % 16;
		const fid = encode(fidByteArray);
		return VALID_FID_PATTERN.test(fid) ? fid : INVALID_FID;
	} catch (_a) {
		return INVALID_FID;
	}
}
/** Converts a FID Uint8Array to a base64 string representation. */
function encode(fidByteArray) {
	return bufferToBase64UrlSafe(fidByteArray).substr(0, 22);
}
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/** Returns a string key that can be used to identify the app. */
function getKey(appConfig) {
	return `${appConfig.appName}!${appConfig.appId}`;
}
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var fidChangeCallbacks = /* @__PURE__ */ new Map();
/**
* Calls the onIdChange callbacks with the new FID value, and broadcasts the
* change to other tabs.
*/
function fidChanged(appConfig, fid) {
	const key = getKey(appConfig);
	callFidChangeCallbacks(key, fid);
	broadcastFidChange(key, fid);
}
function callFidChangeCallbacks(key, fid) {
	const callbacks = fidChangeCallbacks.get(key);
	if (!callbacks) return;
	for (const callback of callbacks) callback(fid);
}
function broadcastFidChange(key, fid) {
	const channel = getBroadcastChannel();
	if (channel) channel.postMessage({
		key,
		fid
	});
	closeBroadcastChannel();
}
var broadcastChannel = null;
/** Opens and returns a BroadcastChannel if it is supported by the browser. */
function getBroadcastChannel() {
	if (!broadcastChannel && "BroadcastChannel" in self) {
		broadcastChannel = new BroadcastChannel("[Firebase] FID Change");
		broadcastChannel.onmessage = (e) => {
			callFidChangeCallbacks(e.data.key, e.data.fid);
		};
	}
	return broadcastChannel;
}
function closeBroadcastChannel() {
	if (fidChangeCallbacks.size === 0 && broadcastChannel) {
		broadcastChannel.close();
		broadcastChannel = null;
	}
}
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var DATABASE_NAME = "firebase-installations-database";
var DATABASE_VERSION = 1;
var OBJECT_STORE_NAME = "firebase-installations-store";
var dbPromise = null;
function getDbPromise() {
	if (!dbPromise) dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, { upgrade: (db, oldVersion) => {
		switch (oldVersion) {
			case 0: db.createObjectStore(OBJECT_STORE_NAME);
		}
	} });
	return dbPromise;
}
/** Assigns or overwrites the record for the given key with the given value. */
async function set(appConfig, value) {
	const key = getKey(appConfig);
	const tx = (await getDbPromise()).transaction(OBJECT_STORE_NAME, "readwrite");
	const objectStore = tx.objectStore(OBJECT_STORE_NAME);
	const oldValue = await objectStore.get(key);
	await objectStore.put(value, key);
	await tx.done;
	if (!oldValue || oldValue.fid !== value.fid) fidChanged(appConfig, value.fid);
	return value;
}
/** Removes record(s) from the objectStore that match the given key. */
async function remove(appConfig) {
	const key = getKey(appConfig);
	const tx = (await getDbPromise()).transaction(OBJECT_STORE_NAME, "readwrite");
	await tx.objectStore(OBJECT_STORE_NAME).delete(key);
	await tx.done;
}
/**
* Atomically updates a record with the result of updateFn, which gets
* called with the current value. If newValue is undefined, the record is
* deleted instead.
* @return Updated value
*/
async function update(appConfig, updateFn) {
	const key = getKey(appConfig);
	const tx = (await getDbPromise()).transaction(OBJECT_STORE_NAME, "readwrite");
	const store = tx.objectStore(OBJECT_STORE_NAME);
	const oldValue = await store.get(key);
	const newValue = updateFn(oldValue);
	if (newValue === void 0) await store.delete(key);
	else await store.put(newValue, key);
	await tx.done;
	if (newValue && (!oldValue || oldValue.fid !== newValue.fid)) fidChanged(appConfig, newValue.fid);
	return newValue;
}
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* Updates and returns the InstallationEntry from the database.
* Also triggers a registration request if it is necessary and possible.
*/
async function getInstallationEntry(installations) {
	let registrationPromise;
	const installationEntry = await update(installations.appConfig, (oldEntry) => {
		const entryWithPromise = triggerRegistrationIfNecessary(installations, updateOrCreateInstallationEntry(oldEntry));
		registrationPromise = entryWithPromise.registrationPromise;
		return entryWithPromise.installationEntry;
	});
	if (installationEntry.fid === INVALID_FID) return { installationEntry: await registrationPromise };
	return {
		installationEntry,
		registrationPromise
	};
}
/**
* Creates a new Installation Entry if one does not exist.
* Also clears timed out pending requests.
*/
function updateOrCreateInstallationEntry(oldEntry) {
	return clearTimedOutRequest(oldEntry || {
		fid: generateFid(),
		registrationStatus: 0
	});
}
/**
* If the Firebase Installation is not registered yet, this will trigger the
* registration and return an InProgressInstallationEntry.
*
* If registrationPromise does not exist, the installationEntry is guaranteed
* to be registered.
*/
function triggerRegistrationIfNecessary(installations, installationEntry) {
	if (installationEntry.registrationStatus === 0) {
		if (!navigator.onLine) return {
			installationEntry,
			registrationPromise: Promise.reject(ERROR_FACTORY$1.create("app-offline"))
		};
		const inProgressEntry = {
			fid: installationEntry.fid,
			registrationStatus: 1,
			registrationTime: Date.now()
		};
		return {
			installationEntry: inProgressEntry,
			registrationPromise: registerInstallation(installations, inProgressEntry)
		};
	} else if (installationEntry.registrationStatus === 1) return {
		installationEntry,
		registrationPromise: waitUntilFidRegistration(installations)
	};
	else return { installationEntry };
}
/** This will be executed only once for each new Firebase Installation. */
async function registerInstallation(installations, installationEntry) {
	try {
		const registeredInstallationEntry = await createInstallationRequest(installations, installationEntry);
		return set(installations.appConfig, registeredInstallationEntry);
	} catch (e) {
		if (isServerError(e) && e.customData.serverCode === 409) await remove(installations.appConfig);
		else await set(installations.appConfig, {
			fid: installationEntry.fid,
			registrationStatus: 0
		});
		throw e;
	}
}
/** Call if FID registration is pending in another request. */
async function waitUntilFidRegistration(installations) {
	let entry = await updateInstallationRequest(installations.appConfig);
	while (entry.registrationStatus === 1) {
		await sleep(100);
		entry = await updateInstallationRequest(installations.appConfig);
	}
	if (entry.registrationStatus === 0) {
		const { installationEntry, registrationPromise } = await getInstallationEntry(installations);
		if (registrationPromise) return registrationPromise;
		else return installationEntry;
	}
	return entry;
}
/**
* Called only if there is a CreateInstallation request in progress.
*
* Updates the InstallationEntry in the DB based on the status of the
* CreateInstallation request.
*
* Returns the updated InstallationEntry.
*/
function updateInstallationRequest(appConfig) {
	return update(appConfig, (oldEntry) => {
		if (!oldEntry) throw ERROR_FACTORY$1.create("installation-not-found");
		return clearTimedOutRequest(oldEntry);
	});
}
function clearTimedOutRequest(entry) {
	if (hasInstallationRequestTimedOut(entry)) return {
		fid: entry.fid,
		registrationStatus: 0
	};
	return entry;
}
function hasInstallationRequestTimedOut(installationEntry) {
	return installationEntry.registrationStatus === 1 && installationEntry.registrationTime + PENDING_TIMEOUT_MS < Date.now();
}
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
async function generateAuthTokenRequest({ appConfig, heartbeatServiceProvider }, installationEntry) {
	const endpoint = getGenerateAuthTokenEndpoint(appConfig, installationEntry);
	const headers = getHeadersWithAuth(appConfig, installationEntry);
	const heartbeatService = heartbeatServiceProvider.getImmediate({ optional: true });
	if (heartbeatService) {
		const heartbeatsHeader = await heartbeatService.getHeartbeatsHeader();
		if (heartbeatsHeader) headers.append("x-firebase-client", heartbeatsHeader);
	}
	const body = { installation: {
		sdkVersion: PACKAGE_VERSION,
		appId: appConfig.appId
	} };
	const request = {
		method: "POST",
		headers,
		body: JSON.stringify(body)
	};
	const response = await retryIfServerError(() => fetch(endpoint, request));
	if (response.ok) return extractAuthTokenInfoFromResponse(await response.json());
	else throw await getErrorFromResponse("Generate Auth Token", response);
}
function getGenerateAuthTokenEndpoint(appConfig, { fid }) {
	return `${getInstallationsEndpoint(appConfig)}/${fid}/authTokens:generate`;
}
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* Returns a valid authentication token for the installation. Generates a new
* token if one doesn't exist, is expired or about to expire.
*
* Should only be called if the Firebase Installation is registered.
*/
async function refreshAuthToken(installations, forceRefresh = false) {
	let tokenPromise;
	const entry = await update(installations.appConfig, (oldEntry) => {
		if (!isEntryRegistered(oldEntry)) throw ERROR_FACTORY$1.create("not-registered");
		const oldAuthToken = oldEntry.authToken;
		if (!forceRefresh && isAuthTokenValid(oldAuthToken)) return oldEntry;
		else if (oldAuthToken.requestStatus === 1) {
			tokenPromise = waitUntilAuthTokenRequest(installations, forceRefresh);
			return oldEntry;
		} else {
			if (!navigator.onLine) throw ERROR_FACTORY$1.create("app-offline");
			const inProgressEntry = makeAuthTokenRequestInProgressEntry(oldEntry);
			tokenPromise = fetchAuthTokenFromServer(installations, inProgressEntry);
			return inProgressEntry;
		}
	});
	return tokenPromise ? await tokenPromise : entry.authToken;
}
/**
* Call only if FID is registered and Auth Token request is in progress.
*
* Waits until the current pending request finishes. If the request times out,
* tries once in this thread as well.
*/
async function waitUntilAuthTokenRequest(installations, forceRefresh) {
	let entry = await updateAuthTokenRequest(installations.appConfig);
	while (entry.authToken.requestStatus === 1) {
		await sleep(100);
		entry = await updateAuthTokenRequest(installations.appConfig);
	}
	const authToken = entry.authToken;
	if (authToken.requestStatus === 0) return refreshAuthToken(installations, forceRefresh);
	else return authToken;
}
/**
* Called only if there is a GenerateAuthToken request in progress.
*
* Updates the InstallationEntry in the DB based on the status of the
* GenerateAuthToken request.
*
* Returns the updated InstallationEntry.
*/
function updateAuthTokenRequest(appConfig) {
	return update(appConfig, (oldEntry) => {
		if (!isEntryRegistered(oldEntry)) throw ERROR_FACTORY$1.create("not-registered");
		const oldAuthToken = oldEntry.authToken;
		if (hasAuthTokenRequestTimedOut(oldAuthToken)) return Object.assign(Object.assign({}, oldEntry), { authToken: { requestStatus: 0 } });
		return oldEntry;
	});
}
async function fetchAuthTokenFromServer(installations, installationEntry) {
	try {
		const authToken = await generateAuthTokenRequest(installations, installationEntry);
		const updatedInstallationEntry = Object.assign(Object.assign({}, installationEntry), { authToken });
		await set(installations.appConfig, updatedInstallationEntry);
		return authToken;
	} catch (e) {
		if (isServerError(e) && (e.customData.serverCode === 401 || e.customData.serverCode === 404)) await remove(installations.appConfig);
		else {
			const updatedInstallationEntry = Object.assign(Object.assign({}, installationEntry), { authToken: { requestStatus: 0 } });
			await set(installations.appConfig, updatedInstallationEntry);
		}
		throw e;
	}
}
function isEntryRegistered(installationEntry) {
	return installationEntry !== void 0 && installationEntry.registrationStatus === 2;
}
function isAuthTokenValid(authToken) {
	return authToken.requestStatus === 2 && !isAuthTokenExpired(authToken);
}
function isAuthTokenExpired(authToken) {
	const now = Date.now();
	return now < authToken.creationTime || authToken.creationTime + authToken.expiresIn < now + TOKEN_EXPIRATION_BUFFER;
}
/** Returns an updated InstallationEntry with an InProgressAuthToken. */
function makeAuthTokenRequestInProgressEntry(oldEntry) {
	const inProgressAuthToken = {
		requestStatus: 1,
		requestTime: Date.now()
	};
	return Object.assign(Object.assign({}, oldEntry), { authToken: inProgressAuthToken });
}
function hasAuthTokenRequestTimedOut(authToken) {
	return authToken.requestStatus === 1 && authToken.requestTime + PENDING_TIMEOUT_MS < Date.now();
}
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* Creates a Firebase Installation if there isn't one for the app and
* returns the Installation ID.
* @param installations - The `Installations` instance.
*
* @public
*/
async function getId(installations) {
	const installationsImpl = installations;
	const { installationEntry, registrationPromise } = await getInstallationEntry(installationsImpl);
	if (registrationPromise) registrationPromise.catch(console.error);
	else refreshAuthToken(installationsImpl).catch(console.error);
	return installationEntry.fid;
}
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* Returns a Firebase Installations auth token, identifying the current
* Firebase Installation.
* @param installations - The `Installations` instance.
* @param forceRefresh - Force refresh regardless of token expiration.
*
* @public
*/
async function getToken(installations, forceRefresh = false) {
	const installationsImpl = installations;
	await completeInstallationRegistration(installationsImpl);
	return (await refreshAuthToken(installationsImpl, forceRefresh)).token;
}
async function completeInstallationRegistration(installations) {
	const { registrationPromise } = await getInstallationEntry(installations);
	if (registrationPromise) await registrationPromise;
}
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
function extractAppConfig(app) {
	if (!app || !app.options) throw getMissingValueError("App Configuration");
	if (!app.name) throw getMissingValueError("App Name");
	for (const keyName of [
		"projectId",
		"apiKey",
		"appId"
	]) if (!app.options[keyName]) throw getMissingValueError(keyName);
	return {
		appName: app.name,
		projectId: app.options.projectId,
		apiKey: app.options.apiKey,
		appId: app.options.appId
	};
}
function getMissingValueError(valueName) {
	return ERROR_FACTORY$1.create("missing-app-config-values", { valueName });
}
/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var INSTALLATIONS_NAME = "installations";
var INSTALLATIONS_NAME_INTERNAL = "installations-internal";
var publicFactory = (container) => {
	const app = container.getProvider("app").getImmediate();
	return {
		app,
		appConfig: extractAppConfig(app),
		heartbeatServiceProvider: _getProvider(app, "heartbeat"),
		_delete: () => Promise.resolve()
	};
};
var internalFactory = (container) => {
	const installations = _getProvider(container.getProvider("app").getImmediate(), INSTALLATIONS_NAME).getImmediate();
	return {
		getId: () => getId(installations),
		getToken: (forceRefresh) => getToken(installations, forceRefresh)
	};
};
function registerInstallations() {
	_registerComponent(new Component(INSTALLATIONS_NAME, publicFactory, "PUBLIC"));
	_registerComponent(new Component(INSTALLATIONS_NAME_INTERNAL, internalFactory, "PRIVATE"));
}
/**
* The Firebase Installations Web SDK.
* This SDK does not work in a Node.js environment.
*
* @packageDocumentation
*/
registerInstallations();
registerVersion(name$1, version$1);
registerVersion(name$1, version$1, "esm2017");
//#endregion
//#region node_modules/@firebase/analytics/dist/esm/index.esm2017.js
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* Type constant for Firebase Analytics.
*/
var ANALYTICS_TYPE = "analytics";
var GA_FID_KEY = "firebase_id";
var ORIGIN_KEY = "origin";
var FETCH_TIMEOUT_MILLIS = 6e4;
var DYNAMIC_CONFIG_URL = "https://firebase.googleapis.com/v1alpha/projects/-/apps/{app-id}/webConfig";
var GTAG_URL = "https://www.googletagmanager.com/gtag/js";
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var logger = new Logger("@firebase/analytics");
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var ERROR_FACTORY = new ErrorFactory("analytics", "Analytics", {
	["already-exists"]: "A Firebase Analytics instance with the appId {$id}  already exists. Only one Firebase Analytics instance can be created for each appId.",
	["already-initialized"]: "initializeAnalytics() cannot be called again with different options than those it was initially called with. It can be called again with the same options to return the existing instance, or getAnalytics() can be used to get a reference to the already-initialized instance.",
	["already-initialized-settings"]: "Firebase Analytics has already been initialized.settings() must be called before initializing any Analytics instanceor it will have no effect.",
	["interop-component-reg-failed"]: "Firebase Analytics Interop Component failed to instantiate: {$reason}",
	["invalid-analytics-context"]: "Firebase Analytics is not supported in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}",
	["indexeddb-unavailable"]: "IndexedDB unavailable or restricted in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}",
	["fetch-throttle"]: "The config fetch request timed out while in an exponential backoff state. Unix timestamp in milliseconds when fetch request throttling ends: {$throttleEndTimeMillis}.",
	["config-fetch-failed"]: "Dynamic config fetch failed: [{$httpStatus}] {$responseMessage}",
	["no-api-key"]: "The \"apiKey\" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid API key.",
	["no-app-id"]: "The \"appId\" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid app ID.",
	["no-client-id"]: "The \"client_id\" field is empty.",
	["invalid-gtag-resource"]: "Trusted Types detected an invalid gtag resource: {$gtagURL}."
});
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* Verifies and creates a TrustedScriptURL.
*/
function createGtagTrustedTypesScriptURL(url) {
	if (!url.startsWith(GTAG_URL)) {
		const err = ERROR_FACTORY.create("invalid-gtag-resource", { gtagURL: url });
		logger.warn(err.message);
		return "";
	}
	return url;
}
/**
* Makeshift polyfill for Promise.allSettled(). Resolves when all promises
* have either resolved or rejected.
*
* @param promises Array of promises to wait for.
*/
function promiseAllSettled(promises) {
	return Promise.all(promises.map((promise) => promise.catch((e) => e)));
}
/**
* Creates a TrustedTypePolicy object that implements the rules passed as policyOptions.
*
* @param policyName A string containing the name of the policy
* @param policyOptions Object containing implementations of instance methods for TrustedTypesPolicy, see {@link https://developer.mozilla.org/en-US/docs/Web/API/TrustedTypePolicy#instance_methods
* | the TrustedTypePolicy reference documentation}.
*/
function createTrustedTypesPolicy(policyName, policyOptions) {
	let trustedTypesPolicy;
	if (window.trustedTypes) trustedTypesPolicy = window.trustedTypes.createPolicy(policyName, policyOptions);
	return trustedTypesPolicy;
}
/**
* Inserts gtag script tag into the page to asynchronously download gtag.
* @param dataLayerName Name of datalayer (most often the default, "_dataLayer").
*/
function insertScriptTag(dataLayerName, measurementId) {
	const trustedTypesPolicy = createTrustedTypesPolicy("firebase-js-sdk-policy", { createScriptURL: createGtagTrustedTypesScriptURL });
	const script = document.createElement("script");
	const gtagScriptURL = `${GTAG_URL}?l=${dataLayerName}&id=${measurementId}`;
	script.src = trustedTypesPolicy ? trustedTypesPolicy === null || trustedTypesPolicy === void 0 ? void 0 : trustedTypesPolicy.createScriptURL(gtagScriptURL) : gtagScriptURL;
	script.async = true;
	document.head.appendChild(script);
}
/**
* Get reference to, or create, global datalayer.
* @param dataLayerName Name of datalayer (most often the default, "_dataLayer").
*/
function getOrCreateDataLayer(dataLayerName) {
	let dataLayer = [];
	if (Array.isArray(window[dataLayerName])) dataLayer = window[dataLayerName];
	else window[dataLayerName] = dataLayer;
	return dataLayer;
}
/**
* Wrapped gtag logic when gtag is called with 'config' command.
*
* @param gtagCore Basic gtag function that just appends to dataLayer.
* @param initializationPromisesMap Map of appIds to their initialization promises.
* @param dynamicConfigPromisesList Array of dynamic config fetch promises.
* @param measurementIdToAppId Map of GA measurementIDs to corresponding Firebase appId.
* @param measurementId GA Measurement ID to set config for.
* @param gtagParams Gtag config params to set.
*/
async function gtagOnConfig(gtagCore, initializationPromisesMap, dynamicConfigPromisesList, measurementIdToAppId, measurementId, gtagParams) {
	const correspondingAppId = measurementIdToAppId[measurementId];
	try {
		if (correspondingAppId) await initializationPromisesMap[correspondingAppId];
		else {
			const foundConfig = (await promiseAllSettled(dynamicConfigPromisesList)).find((config) => config.measurementId === measurementId);
			if (foundConfig) await initializationPromisesMap[foundConfig.appId];
		}
	} catch (e) {
		logger.error(e);
	}
	gtagCore("config", measurementId, gtagParams);
}
/**
* Wrapped gtag logic when gtag is called with 'event' command.
*
* @param gtagCore Basic gtag function that just appends to dataLayer.
* @param initializationPromisesMap Map of appIds to their initialization promises.
* @param dynamicConfigPromisesList Array of dynamic config fetch promises.
* @param measurementId GA Measurement ID to log event to.
* @param gtagParams Params to log with this event.
*/
async function gtagOnEvent(gtagCore, initializationPromisesMap, dynamicConfigPromisesList, measurementId, gtagParams) {
	try {
		let initializationPromisesToWaitFor = [];
		if (gtagParams && gtagParams["send_to"]) {
			let gaSendToList = gtagParams["send_to"];
			if (!Array.isArray(gaSendToList)) gaSendToList = [gaSendToList];
			const dynamicConfigResults = await promiseAllSettled(dynamicConfigPromisesList);
			for (const sendToId of gaSendToList) {
				const foundConfig = dynamicConfigResults.find((config) => config.measurementId === sendToId);
				const initializationPromise = foundConfig && initializationPromisesMap[foundConfig.appId];
				if (initializationPromise) initializationPromisesToWaitFor.push(initializationPromise);
				else {
					initializationPromisesToWaitFor = [];
					break;
				}
			}
		}
		if (initializationPromisesToWaitFor.length === 0) initializationPromisesToWaitFor = Object.values(initializationPromisesMap);
		await Promise.all(initializationPromisesToWaitFor);
		gtagCore("event", measurementId, gtagParams || {});
	} catch (e) {
		logger.error(e);
	}
}
/**
* Wraps a standard gtag function with extra code to wait for completion of
* relevant initialization promises before sending requests.
*
* @param gtagCore Basic gtag function that just appends to dataLayer.
* @param initializationPromisesMap Map of appIds to their initialization promises.
* @param dynamicConfigPromisesList Array of dynamic config fetch promises.
* @param measurementIdToAppId Map of GA measurementIDs to corresponding Firebase appId.
*/
function wrapGtag(gtagCore, initializationPromisesMap, dynamicConfigPromisesList, measurementIdToAppId) {
	/**
	* Wrapper around gtag that ensures FID is sent with gtag calls.
	* @param command Gtag command type.
	* @param idOrNameOrParams Measurement ID if command is EVENT/CONFIG, params if command is SET.
	* @param gtagParams Params if event is EVENT/CONFIG.
	*/
	async function gtagWrapper(command, ...args) {
		try {
			if (command === "event") {
				const [measurementId, gtagParams] = args;
				await gtagOnEvent(gtagCore, initializationPromisesMap, dynamicConfigPromisesList, measurementId, gtagParams);
			} else if (command === "config") {
				const [measurementId, gtagParams] = args;
				await gtagOnConfig(gtagCore, initializationPromisesMap, dynamicConfigPromisesList, measurementIdToAppId, measurementId, gtagParams);
			} else if (command === "consent") {
				const [consentAction, gtagParams] = args;
				gtagCore("consent", consentAction, gtagParams);
			} else if (command === "get") {
				const [measurementId, fieldName, callback] = args;
				gtagCore("get", measurementId, fieldName, callback);
			} else if (command === "set") {
				const [customParams] = args;
				gtagCore("set", customParams);
			} else gtagCore(command, ...args);
		} catch (e) {
			logger.error(e);
		}
	}
	return gtagWrapper;
}
/**
* Creates global gtag function or wraps existing one if found.
* This wrapped function attaches Firebase instance ID (FID) to gtag 'config' and
* 'event' calls that belong to the GAID associated with this Firebase instance.
*
* @param initializationPromisesMap Map of appIds to their initialization promises.
* @param dynamicConfigPromisesList Array of dynamic config fetch promises.
* @param measurementIdToAppId Map of GA measurementIDs to corresponding Firebase appId.
* @param dataLayerName Name of global GA datalayer array.
* @param gtagFunctionName Name of global gtag function ("gtag" if not user-specified).
*/
function wrapOrCreateGtag(initializationPromisesMap, dynamicConfigPromisesList, measurementIdToAppId, dataLayerName, gtagFunctionName) {
	let gtagCore = function(..._args) {
		window[dataLayerName].push(arguments);
	};
	if (window[gtagFunctionName] && typeof window[gtagFunctionName] === "function") gtagCore = window[gtagFunctionName];
	window[gtagFunctionName] = wrapGtag(gtagCore, initializationPromisesMap, dynamicConfigPromisesList, measurementIdToAppId);
	return {
		gtagCore,
		wrappedGtag: window[gtagFunctionName]
	};
}
/**
* Returns the script tag in the DOM matching both the gtag url pattern
* and the provided data layer name.
*/
function findGtagScriptOnPage(dataLayerName) {
	const scriptTags = window.document.getElementsByTagName("script");
	for (const tag of Object.values(scriptTags)) if (tag.src && tag.src.includes(GTAG_URL) && tag.src.includes(dataLayerName)) return tag;
	return null;
}
/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* Backoff factor for 503 errors, which we want to be conservative about
* to avoid overloading servers. Each retry interval will be
* BASE_INTERVAL_MILLIS * LONG_RETRY_FACTOR ^ retryCount, so the second one
* will be ~30 seconds (with fuzzing).
*/
var LONG_RETRY_FACTOR = 30;
/**
* Base wait interval to multiplied by backoffFactor^backoffCount.
*/
var BASE_INTERVAL_MILLIS = 1e3;
/**
* Stubbable retry data storage class.
*/
var RetryData = class {
	constructor(throttleMetadata = {}, intervalMillis = BASE_INTERVAL_MILLIS) {
		this.throttleMetadata = throttleMetadata;
		this.intervalMillis = intervalMillis;
	}
	getThrottleMetadata(appId) {
		return this.throttleMetadata[appId];
	}
	setThrottleMetadata(appId, metadata) {
		this.throttleMetadata[appId] = metadata;
	}
	deleteThrottleMetadata(appId) {
		delete this.throttleMetadata[appId];
	}
};
var defaultRetryData = new RetryData();
/**
* Set GET request headers.
* @param apiKey App API key.
*/
function getHeaders(apiKey) {
	return new Headers({
		Accept: "application/json",
		"x-goog-api-key": apiKey
	});
}
/**
* Fetches dynamic config from backend.
* @param app Firebase app to fetch config for.
*/
async function fetchDynamicConfig(appFields) {
	var _a;
	const { appId, apiKey } = appFields;
	const request = {
		method: "GET",
		headers: getHeaders(apiKey)
	};
	const appUrl = DYNAMIC_CONFIG_URL.replace("{app-id}", appId);
	const response = await fetch(appUrl, request);
	if (response.status !== 200 && response.status !== 304) {
		let errorMessage = "";
		try {
			const jsonResponse = await response.json();
			if ((_a = jsonResponse.error) === null || _a === void 0 ? void 0 : _a.message) errorMessage = jsonResponse.error.message;
		} catch (_ignored) {}
		throw ERROR_FACTORY.create("config-fetch-failed", {
			httpStatus: response.status,
			responseMessage: errorMessage
		});
	}
	return response.json();
}
/**
* Fetches dynamic config from backend, retrying if failed.
* @param app Firebase app to fetch config for.
*/
async function fetchDynamicConfigWithRetry(app, retryData = defaultRetryData, timeoutMillis) {
	const { appId, apiKey, measurementId } = app.options;
	if (!appId) throw ERROR_FACTORY.create("no-app-id");
	if (!apiKey) {
		if (measurementId) return {
			measurementId,
			appId
		};
		throw ERROR_FACTORY.create("no-api-key");
	}
	const throttleMetadata = retryData.getThrottleMetadata(appId) || {
		backoffCount: 0,
		throttleEndTimeMillis: Date.now()
	};
	const signal = new AnalyticsAbortSignal();
	setTimeout(async () => {
		signal.abort();
	}, timeoutMillis !== void 0 ? timeoutMillis : FETCH_TIMEOUT_MILLIS);
	return attemptFetchDynamicConfigWithRetry({
		appId,
		apiKey,
		measurementId
	}, throttleMetadata, signal, retryData);
}
/**
* Runs one retry attempt.
* @param appFields Necessary app config fields.
* @param throttleMetadata Ongoing metadata to determine throttling times.
* @param signal Abort signal.
*/
async function attemptFetchDynamicConfigWithRetry(appFields, { throttleEndTimeMillis, backoffCount }, signal, retryData = defaultRetryData) {
	var _a;
	const { appId, measurementId } = appFields;
	try {
		await setAbortableTimeout(signal, throttleEndTimeMillis);
	} catch (e) {
		if (measurementId) {
			logger.warn(`Timed out fetching this Firebase app's measurement ID from the server. Falling back to the measurement ID ${measurementId} provided in the "measurementId" field in the local Firebase config. [${e === null || e === void 0 ? void 0 : e.message}]`);
			return {
				appId,
				measurementId
			};
		}
		throw e;
	}
	try {
		const response = await fetchDynamicConfig(appFields);
		retryData.deleteThrottleMetadata(appId);
		return response;
	} catch (e) {
		const error = e;
		if (!isRetriableError(error)) {
			retryData.deleteThrottleMetadata(appId);
			if (measurementId) {
				logger.warn(`Failed to fetch this Firebase app's measurement ID from the server. Falling back to the measurement ID ${measurementId} provided in the "measurementId" field in the local Firebase config. [${error === null || error === void 0 ? void 0 : error.message}]`);
				return {
					appId,
					measurementId
				};
			} else throw e;
		}
		const backoffMillis = Number((_a = error === null || error === void 0 ? void 0 : error.customData) === null || _a === void 0 ? void 0 : _a.httpStatus) === 503 ? calculateBackoffMillis(backoffCount, retryData.intervalMillis, LONG_RETRY_FACTOR) : calculateBackoffMillis(backoffCount, retryData.intervalMillis);
		const throttleMetadata = {
			throttleEndTimeMillis: Date.now() + backoffMillis,
			backoffCount: backoffCount + 1
		};
		retryData.setThrottleMetadata(appId, throttleMetadata);
		logger.debug(`Calling attemptFetch again in ${backoffMillis} millis`);
		return attemptFetchDynamicConfigWithRetry(appFields, throttleMetadata, signal, retryData);
	}
}
/**
* Supports waiting on a backoff by:
*
* <ul>
*   <li>Promisifying setTimeout, so we can set a timeout in our Promise chain</li>
*   <li>Listening on a signal bus for abort events, just like the Fetch API</li>
*   <li>Failing in the same way the Fetch API fails, so timing out a live request and a throttled
*       request appear the same.</li>
* </ul>
*
* <p>Visible for testing.
*/
function setAbortableTimeout(signal, throttleEndTimeMillis) {
	return new Promise((resolve, reject) => {
		const backoffMillis = Math.max(throttleEndTimeMillis - Date.now(), 0);
		const timeout = setTimeout(resolve, backoffMillis);
		signal.addEventListener(() => {
			clearTimeout(timeout);
			reject(ERROR_FACTORY.create("fetch-throttle", { throttleEndTimeMillis }));
		});
	});
}
/**
* Returns true if the {@link Error} indicates a fetch request may succeed later.
*/
function isRetriableError(e) {
	if (!(e instanceof FirebaseError) || !e.customData) return false;
	const httpStatus = Number(e.customData["httpStatus"]);
	return httpStatus === 429 || httpStatus === 500 || httpStatus === 503 || httpStatus === 504;
}
/**
* Shims a minimal AbortSignal (copied from Remote Config).
*
* <p>AbortController's AbortSignal conveniently decouples fetch timeout logic from other aspects
* of networking, such as retries. Firebase doesn't use AbortController enough to justify a
* polyfill recommendation, like we do with the Fetch API, but this minimal shim can easily be
* swapped out if/when we do.
*/
var AnalyticsAbortSignal = class {
	constructor() {
		this.listeners = [];
	}
	addEventListener(listener) {
		this.listeners.push(listener);
	}
	abort() {
		this.listeners.forEach((listener) => listener());
	}
};
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* Event parameters to set on 'gtag' during initialization.
*/
var defaultEventParametersForInit;
/**
* Logs an analytics event through the Firebase SDK.
*
* @param gtagFunction Wrapped gtag function that waits for fid to be set before sending an event
* @param eventName Google Analytics event name, choose from standard list or use a custom string.
* @param eventParams Analytics event parameters.
*/
async function logEvent$1(gtagFunction, initializationPromise, eventName, eventParams, options) {
	if (options && options.global) {
		gtagFunction("event", eventName, eventParams);
		return;
	} else {
		const measurementId = await initializationPromise;
		gtagFunction("event", eventName, Object.assign(Object.assign({}, eventParams), { "send_to": measurementId }));
	}
}
/**
* Consent parameters to default to during 'gtag' initialization.
*/
var defaultConsentSettingsForInit;
/**
* Sets the variable {@link defaultConsentSettingsForInit} for use in the initialization of
* analytics.
*
* @param consentSettings Maps the applicable end user consent state for gtag.js.
*/
function _setConsentDefaultForInit(consentSettings) {
	defaultConsentSettingsForInit = consentSettings;
}
/**
* Sets the variable `defaultEventParametersForInit` for use in the initialization of
* analytics.
*
* @param customParams Any custom params the user may pass to gtag.js.
*/
function _setDefaultEventParametersForInit(customParams) {
	defaultEventParametersForInit = customParams;
}
/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
async function validateIndexedDB() {
	if (!isIndexedDBAvailable()) {
		logger.warn(ERROR_FACTORY.create("indexeddb-unavailable", { errorInfo: "IndexedDB is not available in this environment." }).message);
		return false;
	} else try {
		await validateIndexedDBOpenable();
	} catch (e) {
		logger.warn(ERROR_FACTORY.create("indexeddb-unavailable", { errorInfo: e === null || e === void 0 ? void 0 : e.toString() }).message);
		return false;
	}
	return true;
}
/**
* Initialize the analytics instance in gtag.js by calling config command with fid.
*
* NOTE: We combine analytics initialization and setting fid together because we want fid to be
* part of the `page_view` event that's sent during the initialization
* @param app Firebase app
* @param gtagCore The gtag function that's not wrapped.
* @param dynamicConfigPromisesList Array of all dynamic config promises.
* @param measurementIdToAppId Maps measurementID to appID.
* @param installations _FirebaseInstallationsInternal instance.
*
* @returns Measurement ID.
*/
async function _initializeAnalytics(app, dynamicConfigPromisesList, measurementIdToAppId, installations, gtagCore, dataLayerName, options) {
	var _a;
	const dynamicConfigPromise = fetchDynamicConfigWithRetry(app);
	dynamicConfigPromise.then((config) => {
		measurementIdToAppId[config.measurementId] = config.appId;
		if (app.options.measurementId && config.measurementId !== app.options.measurementId) logger.warn(`The measurement ID in the local Firebase config (${app.options.measurementId}) does not match the measurement ID fetched from the server (${config.measurementId}). To ensure analytics events are always sent to the correct Analytics property, update the measurement ID field in the local config or remove it from the local config.`);
	}).catch((e) => logger.error(e));
	dynamicConfigPromisesList.push(dynamicConfigPromise);
	const fidPromise = validateIndexedDB().then((envIsValid) => {
		if (envIsValid) return installations.getId();
		else return;
	});
	const [dynamicConfig, fid] = await Promise.all([dynamicConfigPromise, fidPromise]);
	if (!findGtagScriptOnPage(dataLayerName)) insertScriptTag(dataLayerName, dynamicConfig.measurementId);
	if (defaultConsentSettingsForInit) {
		gtagCore("consent", "default", defaultConsentSettingsForInit);
		_setConsentDefaultForInit(void 0);
	}
	gtagCore("js", /* @__PURE__ */ new Date());
	const configProperties = (_a = options === null || options === void 0 ? void 0 : options.config) !== null && _a !== void 0 ? _a : {};
	configProperties[ORIGIN_KEY] = "firebase";
	configProperties.update = true;
	if (fid != null) configProperties[GA_FID_KEY] = fid;
	gtagCore("config", dynamicConfig.measurementId, configProperties);
	if (defaultEventParametersForInit) {
		gtagCore("set", defaultEventParametersForInit);
		_setDefaultEventParametersForInit(void 0);
	}
	return dynamicConfig.measurementId;
}
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* Analytics Service class.
*/
var AnalyticsService = class {
	constructor(app) {
		this.app = app;
	}
	_delete() {
		delete initializationPromisesMap[this.app.options.appId];
		return Promise.resolve();
	}
};
/**
* Maps appId to full initialization promise. Wrapped gtag calls must wait on
* all or some of these, depending on the call's `send_to` param and the status
* of the dynamic config fetches (see below).
*/
var initializationPromisesMap = {};
/**
* List of dynamic config fetch promises. In certain cases, wrapped gtag calls
* wait on all these to be complete in order to determine if it can selectively
* wait for only certain initialization (FID) promises or if it must wait for all.
*/
var dynamicConfigPromisesList = [];
/**
* Maps fetched measurementIds to appId. Populated when the app's dynamic config
* fetch completes. If already populated, gtag config calls can use this to
* selectively wait for only this app's initialization promise (FID) instead of all
* initialization promises.
*/
var measurementIdToAppId = {};
/**
* Name for window global data layer array used by GA: defaults to 'dataLayer'.
*/
var dataLayerName = "dataLayer";
/**
* Name for window global gtag function used by GA: defaults to 'gtag'.
*/
var gtagName = "gtag";
/**
* Reproduction of standard gtag function or reference to existing
* gtag function on window object.
*/
var gtagCoreFunction;
/**
* Wrapper around gtag function that ensures FID is sent with all
* relevant event and config calls.
*/
var wrappedGtagFunction;
/**
* Flag to ensure page initialization steps (creation or wrapping of
* dataLayer and gtag script) are only run once per page load.
*/
var globalInitDone = false;
/**
* Returns true if no environment mismatch is found.
* If environment mismatches are found, throws an INVALID_ANALYTICS_CONTEXT
* error that also lists details for each mismatch found.
*/
function warnOnBrowserContextMismatch() {
	const mismatchedEnvMessages = [];
	if (isBrowserExtension()) mismatchedEnvMessages.push("This is a browser extension environment.");
	if (!areCookiesEnabled()) mismatchedEnvMessages.push("Cookies are not available.");
	if (mismatchedEnvMessages.length > 0) {
		const details = mismatchedEnvMessages.map((message, index) => `(${index + 1}) ${message}`).join(" ");
		const err = ERROR_FACTORY.create("invalid-analytics-context", { errorInfo: details });
		logger.warn(err.message);
	}
}
/**
* Analytics instance factory.
* @internal
*/
function factory(app, installations, options) {
	warnOnBrowserContextMismatch();
	const appId = app.options.appId;
	if (!appId) throw ERROR_FACTORY.create("no-app-id");
	if (!app.options.apiKey) {
		if (app.options.measurementId) logger.warn(`The "apiKey" field is empty in the local Firebase config. This is needed to fetch the latest measurement ID for this Firebase app. Falling back to the measurement ID ${app.options.measurementId} provided in the "measurementId" field in the local Firebase config.`);
		else throw ERROR_FACTORY.create("no-api-key");
	}
	if (initializationPromisesMap[appId] != null) throw ERROR_FACTORY.create("already-exists", { id: appId });
	if (!globalInitDone) {
		getOrCreateDataLayer(dataLayerName);
		const { wrappedGtag, gtagCore } = wrapOrCreateGtag(initializationPromisesMap, dynamicConfigPromisesList, measurementIdToAppId, dataLayerName, gtagName);
		wrappedGtagFunction = wrappedGtag;
		gtagCoreFunction = gtagCore;
		globalInitDone = true;
	}
	initializationPromisesMap[appId] = _initializeAnalytics(app, dynamicConfigPromisesList, measurementIdToAppId, installations, gtagCoreFunction, dataLayerName, options);
	return new AnalyticsService(app);
}
/**
* Returns an {@link Analytics} instance for the given app.
*
* @public
*
* @param app - The {@link @firebase/app#FirebaseApp} to use.
*/
function getAnalytics(app = getApp()) {
	app = getModularInstance(app);
	const analyticsProvider = _getProvider(app, ANALYTICS_TYPE);
	if (analyticsProvider.isInitialized()) return analyticsProvider.getImmediate();
	return initializeAnalytics(app);
}
/**
* Returns an {@link Analytics} instance for the given app.
*
* @public
*
* @param app - The {@link @firebase/app#FirebaseApp} to use.
*/
function initializeAnalytics(app, options = {}) {
	const analyticsProvider = _getProvider(app, ANALYTICS_TYPE);
	if (analyticsProvider.isInitialized()) {
		const existingInstance = analyticsProvider.getImmediate();
		if (deepEqual(options, analyticsProvider.getOptions())) return existingInstance;
		else throw ERROR_FACTORY.create("already-initialized");
	}
	return analyticsProvider.initialize({ options });
}
/**
* This is a public static method provided to users that wraps four different checks:
*
* 1. Check if it's not a browser extension environment.
* 2. Check if cookies are enabled in current browser.
* 3. Check if IndexedDB is supported by the browser environment.
* 4. Check if the current browser context is valid for using `IndexedDB.open()`.
*
* @public
*
*/
async function isSupported() {
	if (isBrowserExtension()) return false;
	if (!areCookiesEnabled()) return false;
	if (!isIndexedDBAvailable()) return false;
	try {
		return await validateIndexedDBOpenable();
	} catch (error) {
		return false;
	}
}
/**
* Sends a Google Analytics event with given `eventParams`. This method
* automatically associates this logged event with this Firebase web
* app instance on this device.
* List of official event parameters can be found in the gtag.js
* reference documentation:
* {@link https://developers.google.com/gtagjs/reference/ga4-events
* | the GA4 reference documentation}.
*
* @public
*/
function logEvent(analyticsInstance, eventName, eventParams, options) {
	analyticsInstance = getModularInstance(analyticsInstance);
	logEvent$1(wrappedGtagFunction, initializationPromisesMap[analyticsInstance.app.options.appId], eventName, eventParams, options).catch((e) => logger.error(e));
}
var name = "@firebase/analytics";
var version = "0.10.17";
/**
* The Firebase Analytics Web SDK.
* This SDK does not work in a Node.js environment.
*
* @packageDocumentation
*/
function registerAnalytics() {
	_registerComponent(new Component(ANALYTICS_TYPE, (container, { options: analyticsOptions }) => {
		return factory(container.getProvider("app").getImmediate(), container.getProvider("installations-internal").getImmediate(), analyticsOptions);
	}, "PUBLIC"));
	_registerComponent(new Component("analytics-internal", internalFactory, "PRIVATE"));
	registerVersion(name, version);
	registerVersion(name, version, "esm2017");
	function internalFactory(container) {
		try {
			const analytics = container.getProvider(ANALYTICS_TYPE).getImmediate();
			return { logEvent: (eventName, eventParams, options) => logEvent(analytics, eventName, eventParams, options) };
		} catch (e) {
			throw ERROR_FACTORY.create("interop-component-reg-failed", { reason: e });
		}
	}
}
registerAnalytics();
//#endregion
export { isSafari as A, getModularInstance as C, isCloudflareWorker as D, isCloudWorkstation as E, querystring as M, querystringDecode as N, isMobileCordova as O, updateEmulatorBanner as P, getDefaultEmulatorHostnameAndPort as S, isBrowserExtension as T, createMockUserToken as _, _isFirebaseServerApp as a, extractQuerystring as b, getApps as c, LogLevel as d, Logger as f, base64Decode as g, FirebaseError as h, _getProvider as i, pingServer as j, isReactNative as k, initializeApp as l, ErrorFactory as m, isSupported as n, _registerComponent as o, Component as p, SDK_VERSION as r, getApp as s, getAnalytics as t, registerVersion as u, createSubscribe as v, getUA as w, getDefaultEmulatorHost as x, deepEqual as y };
