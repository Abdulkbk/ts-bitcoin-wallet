import axios from "axios"
import { Address, BlockstreamAPIUtxoResponse } from "../types/wallet.types"
import config from "config"

const BASE_URL = config.get<number>("bitcoin_url")


export const getUtxosFromAddress = async (address: Address): Promise<BlockstreamAPIUtxoResponse[]> => {
  const { data }: { data: BlockstreamAPIUtxoResponse[] } = await axios.get(`${BASE_URL}/address/${address.address}/utxo`)

  return data
}

export const getTransactionHex = async (txid: string): Promise<string> => {
  const { data } = await axios.get(
    `${BASE_URL}/tx/${txid}/hex`
  );

  return data;
};

export const broadcastTx = async (txHex: string): Promise<string> => {
  const { data } = await axios.post(`${BASE_URL}/tx`, txHex)

  return data
}