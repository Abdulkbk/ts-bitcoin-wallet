import { Psbt, networks, payments, address, Transaction } from 'bitcoinjs-lib';
import { generateMnemonic, mnemonicToSeed } from 'bip39'
import { BIP32Factory, BIP32Interface } from 'bip32';
import * as ecc from 'tiny-secp256k1';
const coinselect = require('coinselect')
import { ECPairFactory } from 'ecpair'
import { Address, DecoratedUtxo, SignedTransactionData } from '../types/wallet.types';
import { getTransactionHex, getUtxosFromAddress } from '../utils/blockstream-api';

const { fromSeed, fromBase58 } = BIP32Factory(ecc);
const ECPair = ECPairFactory(ecc)

export const NETWORK = networks.testnet

const validator = (
  pubkey: Buffer,
  msghash: Buffer,
  signature: Buffer,
): boolean => ECPair.fromPublicKey(pubkey).verify(msghash, signature);

export const generateNewMnemonic = async (strength: number = 256): Promise<string> => {
  const mnemonic = generateMnemonic(256)
  return mnemonic
}

/// Generate P2PKH address and P2WPKH
export const getAddressFromChildPubkey = (
  child: BIP32Interface, type: string | unknown = 'p2pkh'
): payments.Payment => {
  let address: payments.Payment;

  if (type === 'p2wpkh') {
    address = payments.p2wpkh({
      pubkey: child.publicKey,
      network: NETWORK,
    });

    return address;
  }
  address = payments.p2pkh({
    pubkey: child.publicKey,
    network: NETWORK,
  });

  return address;
};

export const getMasterPrivateKey = async (mnemonic: string): Promise<BIP32Interface> => {
  const seed = await mnemonicToSeed(mnemonic)
  const privateKey = fromSeed(seed, NETWORK)
  return privateKey
}

export const getXpubFromPrivateKey = (privateKey: BIP32Interface, derivationPath: string): string => {
  const child = privateKey.derivePath(derivationPath).neutered()

  const xpub = child.toBase58()

  return xpub
}

export const deriveChildPublicKey = (xpub: string, derivationPath: string): BIP32Interface => {
  const node = fromBase58(xpub, NETWORK)

  const child = node.derivePath(derivationPath)

  return child
}

export const createTrx = async (utxos: DecoratedUtxo[], recipientAddress: string, amountInSatoshi: number, changeAddress: Address, addrType: string | unknown) => {

  const { inputs, outputs, fee } = coinselect(utxos, [{ address: recipientAddress, value: amountInSatoshi }])

  if (!inputs || !outputs) throw new Error("Unable to construct transaction");
  if (fee > amountInSatoshi) throw new Error("Fee is too high!");

  const psbt = new Psbt({ network: networks.testnet });
  // If it's a P2WPKH 
  if (addrType === 'p2wpkh') {
    for (let input of inputs) {
      psbt.addInput({
        hash: input.txid,
        index: input.vout,
        sequence: 0xfffffffd, // enables RBF
        witnessUtxo: {
          value: input.value,
          script: input.address.output!,
        },
        bip32Derivation: input.bip32Derivation,
      });
    };

    outputs.forEach((output: any) => {
      // coinselect doesnt apply address to change output, so add it here
      if (!output.address) {
        output.address = changeAddress.address!;
      }

      psbt.addOutput({
        address: output.address,
        value: output.value,
      });
    });

    return psbt;
  }

  for (let input of inputs) {
    const txHex = await getTransactionHex(input.txid);

    psbt.addInput({
      hash: input.txid,
      index: input.vout,
      sequence: 0xfffffffd, // enables RBF
      nonWitnessUtxo: Buffer.from(txHex, 'hex'),
      bip32Derivation: input.bip32Derivation,
    });
  };

  outputs.forEach((output: any) => {
    // coinselect doesnt apply address to change output, so add it here
    if (!output.address) {
      output.address = changeAddress.address!;
    }

    psbt.addOutput({
      address: output.address,
      value: output.value,
    });
  });

  return psbt;


}

export const createDecoratedUTXOs = async (addresses: Address[], root: BIP32Interface): Promise<DecoratedUtxo[]> => {
  const deocratedUtxos: DecoratedUtxo[] = [];

  for (let address of addresses) {
    const utxos = await getUtxosFromAddress(address);


    for (let utxo of utxos) {
      deocratedUtxos.push({
        ...utxo,
        address: address,
        bip32Derivation: [
          {
            pubkey: address.pubkey!,
            path: `m/84'/0'/0'/${address.derivationPath}`,
            masterFingerprint: root.fingerprint,
          },
        ],
      });
    }
  }

  return deocratedUtxos;
};

export const createAddressBatch = (xpub: string, root: BIP32Interface, adType: string | unknown): Address[] => {
  const addressBatch: Address[] = [];

  for (let i = 0; i < 10; i++) {
    const derivationPath = `0/${i}`;
    const currentChildPubkey = deriveChildPublicKey(xpub, derivationPath);
    const currentAddress = getAddressFromChildPubkey(currentChildPubkey, adType);

    addressBatch.push({
      ...currentAddress,
      derivationPath,
      masterFingerprint: root.fingerprint,
    });
  }

  return addressBatch;
};

export const changeAddressBatch = (xpub: string, root: BIP32Interface, adType: string | unknown): Address[] => {
  const addressBatch: Address[] = [];

  for (let i = 0; i < 10; i++) {
    const derivationPath = `1/${i}`;
    const currentChildPubkey = deriveChildPublicKey(xpub, derivationPath);
    const currentAddress = getAddressFromChildPubkey(currentChildPubkey, adType);

    addressBatch.push({
      ...currentAddress,
      derivationPath,
      masterFingerprint: root.fingerprint,
    });
  }

  return addressBatch;
};

export const signTransaction = async (
  psbt: Psbt,
  node: BIP32Interface
): Promise<SignedTransactionData> => {

  await psbt.signAllInputsHD(node);
  await psbt.validateSignaturesOfAllInputs(validator);
  await psbt.finalizeAllInputs();

  const tx: Transaction = psbt.extractTransaction();

  const data: SignedTransactionData = {
    txHex: tx.toHex(),
    txId: tx.getId()
  }

  return data;
};