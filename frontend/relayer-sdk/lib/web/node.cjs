'use strict';

var TFHEPkg = require('node-tfhe');
var TKMSPkg = require('node-tkms');
var ethers = require('ethers');
var createHash = require('keccak');
var fetchRetry = require('fetch-retry');

function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n.default = e;
    return Object.freeze(n);
}

var TFHEPkg__namespace = /*#__PURE__*/_interopNamespaceDefault(TFHEPkg);
var TKMSPkg__namespace = /*#__PURE__*/_interopNamespaceDefault(TKMSPkg);

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
        return new ethers.JsonRpcProvider(config.network);
    }
    else if (config.network) {
        return new ethers.BrowserProvider(config.network);
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
    const kmsContract = new ethers.Contract(config.kmsContractAddress, abiKmsVerifier, provider);
    const signers = await kmsContract.getKmsSigners();
    return signers;
};
const getKMSSignersThreshold = async (provider, config) => {
    const kmsContract = new ethers.Contract(config.kmsContractAddress, abiKmsVerifier, provider);
    const threshold = await kmsContract.getThreshold();
    return Number(threshold); // threshold is always supposed to fit in a number
};
const getCoprocessorSigners = async (provider, config) => {
    const inputContract = new ethers.Contract(config.inputVerifierContractAddress, abiInputVerifier, provider);
    const signers = await inputContract.getCoprocessorSigners();
    return signers;
};
const getCoprocessorSignersThreshold = async (provider, config) => {
    const inputContract = new ethers.Contract(config.inputVerifierContractAddress, abiInputVerifier, provider);
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
const getAddress$1 = (value) => ethers.getAddress(value);
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
    const acl = new ethers.ethers.Contract(aclContractAddress, aclABI$1, provider);
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
    if (!ethers.isAddress(contractAddress)) {
        throw new Error('Contract address is not a valid address.');
    }
    if (!ethers.isAddress(userAddress)) {
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
            if (!ethers.isAddress(value)) {
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
const getAddress = (value) => ethers.getAddress(value);
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
    if (!ethers.isAddress(contractAddress)) {
        throw new Error('Contract address is not a valid address.');
    }
    if (!ethers.isAddress(userAddress)) {
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
                const recoveredAddress = ethers.ethers.verifyTypedData(domain, types, {
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
    const coder = new ethers.AbiCoder();
    const decoded = coder.decode(['uint256', ...abiTypes, 'bytes[]'], restoredEncoded);
    // strip dummy first/last element
    const rawValues = decoded.slice(1, 1 + typesList.length);
    let results = {};
    handles.forEach((handle, idx) => (results[handle] = rawValues[idx]));
    return results;
}
const publicDecryptRequest = (kmsSigners, thresholdSigners, gatewayChainId, verifyingContractAddress, aclContractAddress, relayerUrl, provider, options) => async (_handles) => {
    const acl = new ethers.ethers.Contract(aclContractAddress, aclABI, provider);
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
        const recoveredAddress = ethers.ethers.verifyTypedData(domain, types, { ctHandles: handles, decryptedResult }, sig);
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
    if (delegatedAccount && !ethers.isAddress(delegatedAccount))
        throw new Error('Invalid delegated account.');
    if (!ethers.isAddress(verifyingContract)) {
        throw new Error('Invalid verifying contract address.');
    }
    if (!contractAddresses.every((c) => ethers.isAddress(c))) {
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
    if (!kmsContractAddress || !ethers.isAddress(kmsContractAddress)) {
        throw new Error('KMS contract address is not valid or empty');
    }
    if (!verifyingContractAddressDecryption ||
        !ethers.isAddress(verifyingContractAddressDecryption)) {
        throw new Error('Verifying contract for Decryption address is not valid or empty');
    }
    if (!verifyingContractAddressInputVerification ||
        !ethers.isAddress(verifyingContractAddressInputVerification)) {
        throw new Error('Verifying contract for InputVerification address is not valid or empty');
    }
    if (!aclContractAddress || !ethers.isAddress(aclContractAddress)) {
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

const createTfheKeypair = () => {
    const block_params = new TFHEPkg.ShortintParameters(TFHEPkg.ShortintParametersName.PARAM_MESSAGE_2_CARRY_2_KS_PBS_TUNIFORM_2M128);
    const casting_params = new TFHEPkg.ShortintCompactPublicKeyEncryptionParameters(TFHEPkg.ShortintCompactPublicKeyEncryptionParametersName.V1_0_PARAM_PKE_MESSAGE_2_CARRY_2_KS_PBS_TUNIFORM_2M128);
    const config = TFHEPkg.TfheConfigBuilder.default()
        .use_custom_parameters(block_params)
        .use_dedicated_compact_public_key_parameters(casting_params)
        .build();
    let clientKey = TFHEPkg.TfheClientKey.generate(config);
    let publicKey = TFHEPkg.TfheCompactPublicKey.new(clientKey);
    const crs = TFHEPkg.CompactPkeCrs.from_config(config, 4 * 512);
    return { clientKey, publicKey, crs };
};
const createTfhePublicKey = () => {
    const { publicKey } = createTfheKeypair();
    return toHexString(publicKey.serialize());
};

global.TFHE = TFHEPkg__namespace;
global.TKMS = TKMSPkg__namespace;

exports.ENCRYPTION_TYPES = ENCRYPTION_TYPES;
exports.SepoliaConfig = SepoliaConfig;
exports.createEIP712 = createEIP712;
exports.createInstance = createInstance;
exports.createTfheKeypair = createTfheKeypair;
exports.createTfhePublicKey = createTfhePublicKey;
exports.generateKeypair = generateKeypair;
exports.getErrorCauseCode = getErrorCauseCode;
exports.getErrorCauseStatus = getErrorCauseStatus;
