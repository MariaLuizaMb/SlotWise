import type { Request, Response } from "express";
import * as usuariosService from "../service/usuarios.service.js";

export async function buscarUsuario(req: Request, res: Response) {
  const { nome, telefoneUser, apenasAtivos, criadoEm } = req.query;

  const filtros: Parameters<typeof usuariosService.buscarUsuario>[0] = {};

  if (nome) filtros.nome = nome as string;
  if (telefoneUser) filtros.telefoneUser = telefoneUser as string;
  if (apenasAtivos !== undefined)
    filtros.apenasAtivos = apenasAtivos === "true";
  if (criadoEm) filtros.criadoEm = new Date(criadoEm as string);

  const usuario = await usuariosService.buscarUsuario(filtros);
  res.status(200).json(usuario);
}

export async function novoUsuario(req: Request, res: Response) {
  const novoUsuario = await usuariosService.novoUsuario(req.body);
  res.status(200).json(novoUsuario);
}

export async function editarUsuario(req: Request, res: Response) {
  try {
    const usuarioInformacoesNovas = await usuariosService.editarUsuario({
      id: Number(req.params.id),
      ...req.body,
    });
    res.status(200).json(usuarioInformacoesNovas);
  } catch (error) {
    if (error instanceof Error && error.message === "Usuário não encontrado") {
      return res.status(404).json({ error: error.message });
    }
    res.status(409).json({ error: (error as Error).message });
  }
}

export async function deletarUsuario(req: Request, res: Response) {
  const id = Number(req.params.id);

  try {
    await usuariosService.deletarUsuario(id);
    res.status(200).send;
  } catch (error) {
    if (error instanceof Error && error.message === "Usuário não encontrado") {
      res.status(404).json({ error: error.message });
    }
    res.status(409).json({ error: (error as Error).message });
  }
}
