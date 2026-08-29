import { Router } from "express";
import * as servicosController from "../controllers/servicos.controller.js";

const router = Router();

router.get("/", servicosController.buscarServicos); // GET /servicos?nome=corte
router.post("/", servicosController.criarServico);
router.put("/:id", servicosController.atualizarServico);
router.delete("/:id", servicosController.desativarServico);

export default router;
