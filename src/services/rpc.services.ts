import { RpcClient } from "../utils/rpc.util";

export const rpcCreateRawTrx = async (txid: string, vout: number, to: string, amount: number) => {
  try {
    const data = await RpcClient("createrawtransaction", [
      [
        {
          txid,
          vout
        }
      ],
      [
        {
          [to]: amount,
        }
      ]
    ])
    return data
  } catch (error) {
    throw error
    return
  }
}

export const RpcGetWalletBlance = async () => {
  try {
    const data = await RpcClient("getbalance", ["*"])
    return data
  } catch (error) {
    throw error
    return
  }
}

export const RpcGetUnspent = async () => {
  try {
    const data = await RpcClient("listunspent", ["*"])
    return data
  } catch (error) {
    throw error
    return
  }
}