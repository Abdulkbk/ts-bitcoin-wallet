import express from 'express'
import { generateAddressHandler, generateMnemonicHandler, generateMasterKeysHandler, getUtxosHandler, createTransactionHandler, broadcastTransactionHandler } from '../controllers/wallet.controller'

const router = express.Router()

router
  .get('/mnemonics', generateMnemonicHandler)
  .get('/get-address', generateAddressHandler)
  .post('/master-keys', generateMasterKeysHandler)
  .get('/utxos', getUtxosHandler)
  .post('/create-transaction', createTransactionHandler)
  .post('/broadcast-transaction', broadcastTransactionHandler)

export default router

