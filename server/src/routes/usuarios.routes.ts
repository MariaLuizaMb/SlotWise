import { Router } from "express";
import * as usuarioController from "../controllers/usuarios.controller.js";

const router = Router();

router.get("/", usuarioController.buscarUsuario);
router.post("/", usuarioController.novoUsuario);
router.put("/:id", usuarioController.editarUsuario);
router.delete("/:id", usuarioController.deletarUsuario);

export default router;
