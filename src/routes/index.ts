import express from 'express'
import wallet from './wallet.route'
const router = express.Router()

router.get('/api/v1/healthcheck', (_, res) => res.sendStatus(200))

router.use('/api/v1/wallet', wallet)


export default router