import { db } from "../config/database.js";
import { funcionario } from "../models/schema.js";
import { eq, and, ilike, gte, lt, type SQL } from "drizzle-orm";

export async function buscarFuncionario(filtros: {
  id?: number;
  nome?: string;
  email?: string;
  telefone?: string;
  isAdmin?: boolean;
  apenasAtivos?: boolean;
  criadoEm?: Date;
}) {
  const condicoes: SQL[] = [];

  if (filtros.id) {
    condicoes.push(eq(funcionario.id_func, filtros.id));
  }

  if (filtros.nome) {
    condicoes.push(ilike(funcionario.nome, `%${filtros.nome}%`));
  }

  if (filtros.email) {
    condicoes.push(ilike(funcionario.email, `%${filtros.email}%`));
  }

  if (filtros.telefone) {
    condicoes.push(ilike(funcionario.telefone, filtros.telefone));
  }

  if (filtros.apenasAtivos !== false) {
    condicoes.push(eq(funcionario.ativo, true));
  }

  if (filtros.apenasAtivos !== false) {
    condicoes.push(eq(funcionario.ativo, true));
  }

  if (filtros.criadoEm) {
    const inicioDia = new Date(filtros.criadoEm);
    inicioDia.setHours(0, 0, 0, 0);

    const inicioDiaSeguinte = new Date(inicioDia);
    inicioDiaSeguinte.setDate(inicioDiaSeguinte.getDate() + 1);

    condicoes.push(gte(funcionario.created_at, inicioDia));
    condicoes.push(lt(funcionario.created_at, inicioDiaSeguinte));
  }

  return db
    .select()
    .from(funcionario)
    .where(condicoes.length > 0 ? and(...condicoes) : undefined);
}

export async function novoFuncionario(dados: {
  nome: string;
  email: string;
  senha_hash: string;
  telefone?: string;
}) {
  const [novoFuncionario] = await db
    .insert(funcionario)
    .values(dados)
    .returning();

  return novoFuncionario;
}

export async function editarFuncionario(dados: {
  id: number;
  nome: string;
  email: string;
  senha_hash: string;
  telefone: string;
  isAdmin: boolean;
  ativo: boolean;
}) {
  const [funcionarioExistente] = await buscarFuncionario({
    id: dados.id,
    apenasAtivos: false,
  });

  if (!funcionarioExistente) {
    throw new Error("Usuário não econtrado");
  }

  if (!funcionarioExistente.ativo) {
    throw new Error("Não é possível editar um usuário desativado");
  }

  const [funcionarioEditado] = await db
    .update(funcionario)
    .set({
      nome: dados.nome,
      telefone: dados.telefone,
    })
    .where(eq(funcionario.id_func, dados.id))
    .returning();

  return funcionarioEditado;
}

export async function deletarFuncionario(id: number) {
  const [funcionarioExistente] = await buscarFuncionario({
    id,
    apenasAtivos: false,
  });

  if (!funcionarioExistente) {
    throw new Error("Funcionário não encontrado");
  }

  if (!funcionarioExistente.ativo) {
    throw new Error("Funcionário já está desativado");
  }

  const [funcionarioDesativado] = await db
    .update(funcionario)
    .set({ ativo: false })
    .where(eq(funcionario.id_func, id))
    .returning();
}
