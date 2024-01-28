import axios from 'axios'
import config from 'config'


const bitcoin_port = config.get<number>("signet_port")
const user = config.get<string>("rpc_user")
const password = config.get<string>("rpc_password")

const rpc_url = `http://127.0.0.1:${bitcoin_port}`

export const RpcClient = async (method: string, parameters: any) => {
  const body = {
    jsonrpc: "1.0",
    id: "curltext",
    method,
    parameter: parameters
  }

  try {
    const response = await axios.post(rpc_url, JSON.stringify(body), {
      auth: {
        username: user,
        password: password
      }
    })

    // console.log('done');
    // console.log(response.data);



    return response.data
  } catch (error) {
    console.log(error);

    throw error
  }
}