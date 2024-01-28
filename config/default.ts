import "dotenv/config"

export default {
  port: process.env.port,
  keyName: process.env.SECRET_KEY,
  salt: process.env.SALT,
  accessTokenPrivateKey: process.env.SECRET_KEY,
  accessTokenPublicKey: process.env.SECRET_KEY,
  bitcoin_url: process.env.BITCOIN_BASE_URL,
  rpc_user: process.env.RPC_USER,
  rpc_password: process.env.RPC_PASSWORD,
  signet_port: process.env.SIGNET_PORT,
}

