import { db } from "../config/database.js";
import { servicos } from "../models/schema.js";
import { eq, and, ilike, gte, lte, type SQL } from "drizzle-orm";

export async function listarServicos() {
  return db.select().from(servicos).where(eq(servicos.ativo, true));
}

export async function buscarServicos(filtros: {
  id?: number;
  nome?: string;
  precoMin?: string;
  precoMax?: string;
  duracaoMin?: number;
  duracaoMax?: number;
  apenasAtivos?: boolean;
}) {
  const condicoes: SQL[] = [];

  if (filtros.id) {
    condicoes.push(eq(servicos.id_servico, filtros.id));
  }

  if (filtros.nome) {
    condicoes.push(ilike(servicos.nome, `%${filtros.nome}%`));
  }

  if (filtros.precoMin) {
    condicoes.push(gte(servicos.preco, filtros.precoMin));
  }

  if (filtros.precoMax) {
    condicoes.push(lte(servicos.preco, filtros.precoMax));
  }

  if (filtros.duracaoMin) {
    condicoes.push(gte(servicos.duracao, filtros.duracaoMin));
  }

  if (filtros.duracaoMax) {
    condicoes.push(lte(servicos.duracao, filtros.duracaoMax));
  }

  if (filtros.apenasAtivos !== false) {
    condicoes.push(eq(servicos.ativo, true));
  }

  return db
    .select()
    .from(servicos)
    .where(condicoes.length > 0 ? and(...condicoes) : undefined);
}

export async function criarServico(dados: {
  nome: string;
  duracao: number;
  preco: string;
  descricao?: string;
}) {
  const [novoServico] = await db.insert(servicos).values(dados).returning();
  return novoServico;
}

export async function atualizarServico(dados: {
  id: number;
  nome: string;
  duracao: number;
  preco: string;
  descricao?: string;
}) {
  const [servicoExistente] = await buscarServicos({
    id: dados.id,
    apenasAtivos: false,
  });

  if (!servicoExistente) {
    throw new Error("Serviço não encontrado");
  }

  if (!servicoExistente.ativo) {
    throw new Error("Não é possível editar um serviço desativado");
  }

  const [servicoEditado] = await db
    .update(servicos)
    .set({
      nome: dados.nome,
      duracao: dados.duracao,
      preco: dados.preco,
      descricao: dados.descricao,
    })
    .where(eq(servicos.id_servico, dados.id))
    .returning();

  return servicoEditado;
}

export async function desativarServico(id: number) {
  const [servicoExistente] = await buscarServicos({ id, apenasAtivos: false });

  if (!servicoExistente) {
    throw new Error("Serviço não encontrado");
  }

  if (!servicoExistente.ativo) {
    throw new Error("Serviço já está desativado");
  }

  const [servicoDesativado] = await db
    .update(servicos)
    .set({ ativo: false })
    .where(eq(servicos.id_servico, id))
    .returning();

  return servicoDesativado;
}
