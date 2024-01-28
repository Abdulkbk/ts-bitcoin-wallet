import express from 'express'
import { rpcWalletBalanceHandler, rpcGetUnspentHandler, rpcCreateRawTrxHandler } from '../controllers/rpc.controller'

const router = express.Router()

router
  .get("/get_balance", rpcWalletBalanceHandler)
  .get("/get_utxos", rpcGetUnspentHandler)
  .post("/create_raw_trx", rpcCreateRawTrxHandler)

export default router
