import type { Request, Response } from "express";
import * as servicosService from "../service/servicos.service.js";

export async function listarServicos(req: Request, res: Response) {
  const servicos = await servicosService.listarServicos();
  res.status(200).json(servicos);
}

export async function testarRota(req: Request, res: Response) {
  res.status(201).json("ok");
}

export async function buscarServicos(req: Request, res: Response) {
  const { nome, precoMin, precoMax, duracaoMin, duracaoMax } = req.query;

  const filtros: Parameters<typeof servicosService.buscarServicos>[0] = {};

  if (nome) filtros.nome = nome as string;
  if (precoMin) filtros.precoMin = precoMin as string;
  if (precoMax) filtros.precoMax = precoMax as string;
  if (duracaoMin) filtros.duracaoMin = Number(duracaoMin);
  if (duracaoMax) filtros.duracaoMax = Number(duracaoMax);

  const resultado = await servicosService.buscarServicos(filtros);
  res.status(200).json(resultado);
}

export async function criarServico(req: Request, res: Response) {
  const novoServico = await servicosService.criarServico(req.body);
  res.status(201).json(novoServico);
}

export async function atualizarServico(req: Request, res: Response) {
  try {
    const servicoEditado = await servicosService.atualizarServico({
      id: Number(req.params.id),
      ...req.body,
    });
    res.status(200).json(servicoEditado);
  } catch (error) {
    if (error instanceof Error && error.message === "Serviço não encontrado") {
      return res.status(404).json({ error: error.message });
    }
    res.status(409).json({ error: (error as Error).message });
  }
}

export async function desativarServico(req: Request, res: Response) {
  const id = Number(req.params.id);

  try {
    await servicosService.desativarServico(id);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message === "Serviço não encontrado") {
      return res.status(404).json({ error: error.message });
    }
    res.status(409).json({ error: (error as Error).message });
  }
}
