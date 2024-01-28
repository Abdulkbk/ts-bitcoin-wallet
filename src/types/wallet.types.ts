import { payments } from "bitcoinjs-lib";

export interface Address extends payments.Payment {
  derivationPath: string
  masterFingerprint: Buffer
  type?: "used" | "unused"
}

export interface BlockstreamAPIUtxoResponse {
  txid: string;
  vout: number;
  status: {
    confirmed: boolean;
    block_height: number;
    block_hash: string;
    block_time: number;
  };
  value: number;
}

export interface DecoratedUtxo extends BlockstreamAPIUtxoResponse {
  address: Address;
  bip32Derivation: {
    masterFingerprint: Buffer;
    pubkey: Buffer;
    path: string;
  }[];
}

export interface SignedTransactionData {
  txHex: string;
  txId: string;
}