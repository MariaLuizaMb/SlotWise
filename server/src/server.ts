import express from "express";
import type { Request, Response } from "express";
import dotenv from "dotenv";
import { redisClient } from "./config/redis.js";
import servicosRoutes from "./routes/servicos.routes.js";
import usuariosRoutes from "./routes/usuarios.routes.js";

dotenv.config({ quiet: true });

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.get("/test", async (req: Request, res: Response) => {
  await redisClient.set("healthcheck", "ok");
  const redisPing = await redisClient.get("healthcheck");
  res.status(200).json({ status: "ok", redis: redisPing });
});

app.use("/servicos", servicosRoutes);
app.use("/usuarios", usuariosRoutes);

app.listen(PORT, () => {
  console.log(`Server rodando na porta ${PORT}`);
});
