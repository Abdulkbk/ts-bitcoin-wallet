import express from 'express'
import wallet from './wallet.route'
import rpc from "./rpc.route"
const router = express.Router()

router.get('/api/v1/healthcheck', (_, res) => res.sendStatus(200))

router.use('/api/v1/wallet', wallet)
router.use('/api/v1/rpc', rpc)


export default router