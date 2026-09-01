import Router from "express";
import * as funcionariosController from "../controllers/funcionarios.controller.js";

const router = Router();

router.get("/", funcionariosController.buscarFuncionario);
router.post("/", funcionariosController.novoFuncionario);
router.put("/:id", funcionariosController.editarFuncionario);
router.delete("/:id", funcionariosController.deletarFuncionario);
