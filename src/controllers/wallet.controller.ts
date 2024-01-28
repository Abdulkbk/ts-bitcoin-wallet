import { NETWORK, changeAddressBatch, createAddressBatch, createDecoratedUTXOs, generateNewMnemonic, createTrx, signTransaction } from "../services/wallet.service"
import { Request, Response, } from "express";
import { mnemonicToSeed } from 'bip39'
import { BIP32Factory, BIP32Interface } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { Address, DecoratedUtxo, SignedTransactionData } from "../types/wallet.types";
import { broadcastTx } from "../utils/blockstream-api";


const { fromSeed, fromBase58 } = BIP32Factory(ecc);
const derivationPath = "m/84'/0'/0'";




// Generate Mnemonics /  wallet phrase
export const generateMnemonicHandler = async (req: any, res: Response) => {
  try {
    const mnemonic = await generateNewMnemonic()

    return res.status(201).json({ success: true, mnemonic })
  } catch (error) {
    throw error
  }
}

export const generateMasterKeysHandler = async (req: any, res: Response) => {
  try {
    const { password, phrase } = req.body

    if (!password || !phrase) {
      return res.status(403).json({ success: false, message: 'Password or Phrase not provided' })
    }
    const seed = await mnemonicToSeed(phrase, password)
    const node = fromSeed(seed, NETWORK)

    const xpriv = node.toBase58()
    const xpub = node.derivePath(derivationPath).neutered().toBase58()

    const data = { mnemonics: phrase, privateKey: xpriv, publicKey: xpub }

    return res.status(201).json({ success: true, data })

  } catch (error) {
    throw error
  }
}


export const generateAddressHandler = async (req: any, res: Response) => {
  try {
    const { addressType, pubKey } = req.query

    const node: BIP32Interface = fromBase58(pubKey, NETWORK).derivePath("0/0")

    const currentAddressBatch: Address[] = createAddressBatch(pubKey, node, addressType)
    const currentChangeAddressBatch: Address[] = changeAddressBatch(pubKey, node, addressType)

    const data = { address: currentAddressBatch, changeAddress: currentChangeAddressBatch }
    return res.status(200).json({ success: true, data })


  } catch (error) {
    throw error
  }
}

export const getUtxosHandler = async (req: any, res: Response) => {
  try {
    const { addressType, pubKey } = req.query

    const node: BIP32Interface = fromBase58(pubKey, NETWORK).derivePath("0/0")

    const currentAddressBatch: Address[] = createAddressBatch(pubKey, node, addressType)
    const currentChangeAddressBatch: Address[] = changeAddressBatch(pubKey, node, addressType)

    const addresses: Address[] = [...currentAddressBatch, ...currentChangeAddressBatch]

    const decoratedUtxo: DecoratedUtxo[] = await createDecoratedUTXOs(addresses, node)

    res.status(200).json({ success: true, decoratedUtxo })
  } catch (error) {

  }
}

export const createTransactionHandler = async (req: any, res: Response) => {
  try {
    const { recipientAddress, amountInSatoshi } = req.body
    const { addressType, pubKey } = req.query



    const root = fromBase58(pubKey, NETWORK)

    const currentAddressBatch: Address[] = createAddressBatch(pubKey, root, addressType)
    const currentChangeAddressBatch: Address[] = changeAddressBatch(pubKey, root, addressType)

    const addresses: Address[] = [...currentAddressBatch, ...currentChangeAddressBatch]


    const decoratedUtxo: DecoratedUtxo[] = await createDecoratedUTXOs(addresses, root)



    const transaction = await createTrx(decoratedUtxo, recipientAddress, amountInSatoshi, currentChangeAddressBatch[0], addressType)

    const signTransactionHex: SignedTransactionData = await signTransaction(transaction, root)

    const data = {
      tHex: signTransactionHex,
      transaction
    }

    return res.status(201).json({ success: true, data })


  } catch (error) {
    throw error
  }
}

export const broadcastTransactionHandler = async (req: any, res: Response) => {
  try {
    const { tHex } = req.body

    const data = await broadcastTx(tHex)
    return res.status(201).json({ success: true, data })
  } catch (error) {
    return
  }
}

export const getAddressHandler = async (req: any, res: Response) => {

}