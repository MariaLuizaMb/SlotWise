import type { Request, Response } from "express";
import * as horarioFuncionamentoService from "../service/horarioFuncionamento.service.js";

export async function buscarHorarioFuncionamento(req: Request, res: Response) {
  const { id, dia_semana } = req.query;

  const filtros: Parameters<
    typeof horarioFuncionamentoService.buscarHorarioFuncionamento
  >[0] = {};

  if (id) filtros.id = Number(id);
  if (dia_semana) filtros.dia_semana = dia_semana as string;
}

export async function novoHorarioFuncionamento(req: Request, res: Response) {
  const novoHorarioFuncionamento =
    await horarioFuncionamentoService.novoHorarioFuncionamento(req.body);
  res.status(200).json(novoHorarioFuncionamento);
}

export async function editarHorarioFuncionamento(req: Request, res: Response) {
  try {
    const horarioFuncionamentoInformacoesNovas =
      await horarioFuncionamentoService.editarHorarioFuncionamento({
        id: Number(req.params.id),
        ...req.body,
      });
    res.status(200).json(horarioFuncionamentoInformacoesNovas);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Horário de funcionamento não encontrado"
    ) {
      return res.status(404).json({ error: error.message });
    }
    res.status(409).json({ error: (error as Error).message });
  }
}

export async function deletarHorarioFuncionamento(req: Request, res: Response) {
  const id = Number(req.params.id);

  try {
    await horarioFuncionamentoService.deletarHorarioFuncionamento(id);
    res.status(200).send();
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Horário de funcionamento não encontrado"
    ) {
      res.status(404).json({ error: error.message });
    }
    res.status(409).json({ error: (error as Error).message });
  }
}
