import { CompactPkeCrs } from 'node-tfhe';
import { Eip1193Provider } from 'ethers';
import { TfheClientKey } from 'node-tfhe';
import { TfheCompactPublicKey } from 'node-tfhe';

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
export declare const createEIP712: (verifyingContract: string, contractsChainId: number) => (publicKey: string | Uint8Array, contractAddresses: string[], startTimestamp: string | number, durationDays: string | number, delegatedAccount?: string) => EIP712;

export declare const createInstance: (config: FhevmInstanceConfig) => Promise<FhevmInstance>;

export declare const createTfheKeypair: () => {
    clientKey: TfheClientKey;
    publicKey: TfheCompactPublicKey;
    crs: CompactPkeCrs;
};

export declare const createTfhePublicKey: () => string;

export declare type DecryptedResults = Record<string, bigint | boolean | string>;

export declare type EIP712 = {
    domain: {
        chainId: number;
        name: string;
        verifyingContract: string;
        version: string;
    };
    message: any;
    primaryType: string;
    types: {
        [key: string]: EIP712Type[];
    };
};

export declare type EIP712Type = {
    name: string;
    type: string;
};

export declare const ENCRYPTION_TYPES: {
    1: number;
    8: number;
    16: number;
    32: number;
    64: number;
    128: number;
    160: number;
    256: number;
    512: number;
    1024: number;
    2048: number;
};

export declare type EncryptionTypes = keyof typeof ENCRYPTION_TYPES;

export declare type FhevmInstance = {
    createEncryptedInput: (contractAddress: string, userAddress: string) => RelayerEncryptedInput;
    generateKeypair: () => {
        publicKey: string;
        privateKey: string;
    };
    createEIP712: (publicKey: string, contractAddresses: string[], startTimestamp: string | number, durationDays: string | number) => EIP712;
    publicDecrypt: (handles: (string | Uint8Array)[]) => Promise<DecryptedResults>;
    userDecrypt: (handles: HandleContractPair[], privateKey: string, publicKey: string, signature: string, contractAddresses: string[], userAddress: string, startTimestamp: string | number, durationDays: string | number) => Promise<DecryptedResults>;
    getPublicKey: () => {
        publicKeyId: string;
        publicKey: Uint8Array;
    } | null;
    getPublicParams: (bits: keyof PublicParams) => {
        publicParams: Uint8Array;
        publicParamsId: string;
    } | null;
};

export declare type FhevmInstanceConfig = {
    verifyingContractAddressDecryption: string;
    verifyingContractAddressInputVerification: string;
    kmsContractAddress: string;
    inputVerifierContractAddress: string;
    aclContractAddress: string;
    gatewayChainId: number;
    chainId?: number;
    relayerUrl?: string;
    network?: Eip1193Provider | string;
    publicParams?: PublicParams<Uint8Array> | null;
    publicKey?: {
        data: Uint8Array | null;
        id: string | null;
    };
};

export declare const generateKeypair: () => {
    publicKey: string;
    privateKey: string;
};

export declare function getErrorCauseCode(e: unknown): string | undefined;

export declare function getErrorCauseStatus(e: unknown): number | undefined;

export declare type HandleContractPair = {
    handle: Uint8Array | string;
    contractAddress: string;
};

export declare type PublicParams<T = TFHEType['CompactPkeCrs']> = {
    [key in EncryptionTypes]?: {
        publicParams: T;
        publicParamsId: string;
    };
};

export declare type RelayerEncryptedInput = {
    addBool: (value: boolean | number | bigint) => RelayerEncryptedInput;
    add8: (value: number | bigint) => RelayerEncryptedInput;
    add16: (value: number | bigint) => RelayerEncryptedInput;
    add32: (value: number | bigint) => RelayerEncryptedInput;
    add64: (value: number | bigint) => RelayerEncryptedInput;
    add128: (value: number | bigint) => RelayerEncryptedInput;
    add256: (value: number | bigint) => RelayerEncryptedInput;
    addAddress: (value: string) => RelayerEncryptedInput;
    getBits: () => EncryptionTypes[];
    encrypt: (options?: {
        apiKey?: string;
    }) => Promise<{
        handles: Uint8Array[];
        inputProof: Uint8Array;
    }>;
};

export declare const SepoliaConfig: FhevmInstanceConfig;

export declare type TFHEType = {
    default?: any;
    TFHEInput?: any;
    TfheCompactPublicKey: any;
    CompactPkeCrs: any;
    initThreadPool?: any;
    init_panic_hook: any;
    CompactCiphertextList: any;
    ZkComputeLoad: any;
};

export { }
