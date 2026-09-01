import Router from "express";
import * as horarioFuncionamentoController from "../controllers/horarioFuncionamento.controller.js";

const router = Router();

router.get("/", horarioFuncionamentoController.buscarHorarioFuncionamento);
router.post("/", horarioFuncionamentoController.novoHorarioFuncionamento);
router.put("/:id", horarioFuncionamentoController.editarHorarioFuncionamento);
router.delete(
  "/:id",
  horarioFuncionamentoController.deletarHorarioFuncionamento,
);
export default router;
