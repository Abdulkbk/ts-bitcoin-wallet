import { Response } from "express"
import { RpcGetWalletBlance, RpcGetUnspent, rpcCreateRawTrx } from "../services/rpc.services"
export const rpcWalletBalanceHandler = async (req: any, res: Response) => {
  const data = await RpcGetWalletBlance()

  res.status(200).json({ success: true, data })
}

export const rpcGetUnspentHandler = async (req: any, res: Response) => {
  const data = await RpcGetUnspent()

  res.status(200).json({ success: true, data })
}


export const rpcCreateRawTrxHandler = async (req: any, res: Response) => {

  try {
    const { txid, vout, recipientAddr, amount } = req.body
    const data = await rpcCreateRawTrx(txid, vout, recipientAddr, amount)

    res.status(200).json({ success: true, data })
  } catch (error) {
    throw error
    return
  }
}