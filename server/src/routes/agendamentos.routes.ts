import Router from "express";
import * as agendamentosController from "../controllers/agendamentos.controller.js";

const router = Router();

router.get("/", agendamentosController.buscarAgendamentos);
router.post("/", agendamentosController.criarAgendamento);
router.put("/atribuirFuncionario", agendamentosController.atribuirFuncionario);
router.put(
  "/atualizarAgendamento",
  agendamentosController.atualizarAgendamento,
);
router.delete(
  "/cancelarAgendamento",
  agendamentosController.cancelarAgendamento,
);

export default router;
