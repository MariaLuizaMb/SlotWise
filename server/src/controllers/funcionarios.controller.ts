import type { Request, Response } from "express";
import * as funcionariosService from "../service/funcionarios.service.js";

export async function buscarFuncionario(req: Request, res: Response) {
  const { id, nome, email, telefone, isAdmin, apenasAtivos, criadoEm } =
    req.query;

  const filtros: Parameters<typeof funcionariosService.buscarFuncionario>[0] =
    {};

  if (id) filtros.id = Number(id);
  if (nome) filtros.nome = nome as string;
  if (email) filtros.email = email as string;
  if (telefone) filtros.telefone = telefone as string;
  if (isAdmin !== undefined) filtros.isAdmin = isAdmin === "true";

  const funcionario = await funcionariosService.buscarFuncionario(filtros);
  res.status(200).json(funcionario);
}

export async function novoFuncionario(req: Request, res: Response) {
  const novoFuncionario = await funcionariosService.novoFuncionario(req.body);
  res.status(200).json(novoFuncionario);
}

export async function editarFuncionario(req: Request, res: Response) {
  try {
    const funcionarioInformacoesNovas =
      await funcionariosService.editarFuncionario({
        id: Number(req.params.id),
        ...req.body,
      });
    res.status(200).json(funcionarioInformacoesNovas);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Funcionário não encontrado"
    ) {
      return res.status(404).json({ error: error.message });
    }
    res.status(409).json({ error: (error as Error).message });
  }
}

export async function deletarFuncionario(req: Request, res: Response) {
  const id = Number(req.params.id);

  try {
    await funcionariosService.deletarFuncionario(id);
    res.status(200).send();
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Funcionário não encontrado"
    ) {
      res.status(404).json({ error: error.message });
    }
    res.status(409).json({ error: (error as Error).message });
  }
}
