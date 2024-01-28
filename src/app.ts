import express from "express"
import config from "config";
import createServer from "./utils/server";
import router from "./routes";

const port = config.get<number>("port")

const app = createServer()

app.use(router)

app.listen(port, async () => {
  console.log(`App is running at http://localhost:${port}`);
})