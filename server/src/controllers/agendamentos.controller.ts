import type { Request, Response } from "express";
import * as agendamentosService from "../service/agendamento.service.js";
import { agendamento } from "../models/schema.js";

export async function buscarAgendamentos(req: Request, res: Response) {
  const {
    id,
    idUsuario,
    idFunc,
    status,
    dataAgendamento,
    dataAgendamentoInicio,
    dataAgendamentoFim,
    horarioAgendamento,
    horarioAgendamentoInicio,
    horarioAgendamentoFim,
    semFuncionario,
    apenasAtivos,
  } = req.query;

  const filtros: Parameters<typeof agendamentosService.buscarAgendamentos>[0] =
    {};

  if (id) filtros.id = Number(id);
  if (idUsuario) filtros.idUsuario = Number(idUsuario);
  if (idFunc) filtros.idFunc = Number(idFunc);
  if (filtros.status != undefined) {
    const statusValido = agendamento.status.enumValues.includes(
      status as (typeof agendamento.status.enumValues)[number],
    );

    if (!statusValido) {
      return res.status(400).json({
        error: `Status inválido. Valores aceitos: ${agendamento.status.enumValues.join(", ")}`,
      });
    }

    filtros.status = status as typeof filtros.status;
  }

  if (dataAgendamento) filtros.dataAgendamento = dataAgendamento as string;
  if (dataAgendamentoInicio)
    filtros.dataAgendamentoInicio = dataAgendamentoInicio as string;
  if (dataAgendamentoFim)
    filtros.dataAgendamentoFim = dataAgendamentoFim as string;
  if (horarioAgendamento)
    filtros.horarioAgendamento = horarioAgendamento as string;
  if (horarioAgendamentoInicio)
    filtros.horarioAgendamentoInicio = horarioAgendamentoInicio as string;
  if (horarioAgendamentoFim)
    filtros.horarioAgendamentoFim = horarioAgendamentoFim as string;
  if (semFuncionario) filtros.semFuncionario = semFuncionario === "true";
  if (apenasAtivos !== undefined)
    filtros.apenasAtivos = apenasAtivos === "true";

  const agendamentos = await agendamentosService.buscarAgendamentos(filtros);
  res.status(200).json(agendamentos);
}

export async function criarAgendamento(req: Request, res: Response) {
  const { idUsuario, dataAgendamento, horarioAgendamento, servicosIds } =
    req.body;

  if (!idUsuario || typeof idUsuario !== "number") {
    return res
      .status(400)
      .json({ error: "Este campo é obrigatório e deve ser um número." });
  }

  if (!dataAgendamento || typeof dataAgendamento !== "string") {
    return res.status(400).json({ error: "Este campo é obrigatório." });
  }

  if (!horarioAgendamento || typeof horarioAgendamento !== "string") {
    return res.status(400).json({ error: "Este campo é obrigatório." });
  }

  if (!Array.isArray(servicosIds) || servicosIds.length === 0) {
    return res.status(400).json({ error: "Escolha ao menos um serviço." });
  }

  try {
    const novoAgendamento = await agendamentosService.criarAgendamento({
      idUsuario,
      dataAgendamento,
      horarioAgendamento,
      servicosIds,
    });
    res.status(201).json(novoAgendamento);
  } catch (error) {
    res
      .status(409)
      .json(
        error instanceof Error
          ? { error: error.message }
          : { error: "Erro ao criar agendamento." },
      );
  }
}

export async function atribuirFuncionario(req: Request, res: Response) {
  const idAgendamento = Number(req.params.idAgendamento);
  const { idFuncionario } = req.body;

  if (!idFuncionario || typeof idFuncionario !== "number") {
    return res
      .status(400)
      .json({ error: "Este campo é obrigatório e deve ser um número." });
  }

  try {
    const funcionarioAtribuido = await agendamentosService.atribuirFuncionario({
      idAgendamento,
      idFuncionario,
    });
    res.status(200).json(funcionarioAtribuido);
  } catch (error) {
    res
      .status(409)
      .json(
        error instanceof Error
          ? { error: error.message }
          : { error: "Erro ao atribuir funcionário ao agendamento." },
      );
  }
}

export async function atualizarAgendamento(req: Request, res: Response) {
  const idAgendamento = Number(req.params.idAgendamento);
  const { dataAgendamento, horarioAgendamento } = req.body;

  if (!dataAgendamento || typeof dataAgendamento !== "string") {
    return res.status(400).json({ error: "Este campo é obrigatório." });
  }

  if (!horarioAgendamento || typeof horarioAgendamento !== "string") {
    return res.status(400).json({ error: "Este campo é obrigatório." });
  }

  try {
    const agendamentoAtualizado =
      await agendamentosService.atualizarAgendamento({
        idAgendamento,
        dataAgendamento,
        horarioAgendamento,
      });
    res.status(200).json(agendamentoAtualizado);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Agendamento não encontrado."
    ) {
      return res.status(404).json({ error: error.message });
    }
    res
      .status(409)
      .json(
        error instanceof Error
          ? { error: error.message }
          : { error: "Erro ao atualizar agendamento." },
      );
  }
}

export async function cancelarAgendamento(req: Request, res: Response) {
  const idAgendamento = Number(req.params.id);

  try {
    const agendamentoCancelado =
      await agendamentosService.cancelarAgendamento(idAgendamento);
    res.status(200).json(agendamentoCancelado);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Agendamento não encontrado."
    ) {
      return res.status(404).json({ error: error.message });
    }
    res.status(409).json({ error: (error as Error).message });
  }
}
