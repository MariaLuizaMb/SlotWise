import { db } from "../config/database.js";
import { usuario } from "../models/schema.js";
import { eq, and, ilike, gte, lte, type SQL } from "drizzle-orm";

export async function buscarUsuario(filtros: {
  id?: number;
  nome?: string;
  telefoneUser?: string;
  apenasAtivos?: boolean;
  criadoEm?: Date;
}) {
  const condicoes: SQL[] = [];

  if (filtros.id) {
    condicoes.push(eq(usuario.id_user, filtros.id));
  }

  if (filtros.nome) {
    condicoes.push(ilike(usuario.nome, `%${filtros.nome}%`));
  }

  if (filtros.telefoneUser) {
    condicoes.push(ilike(usuario.telefone, filtros.telefoneUser));
  }

  if (filtros.apenasAtivos !== false) {
    condicoes.push(eq(usuario.ativo, true));
  }

  if (filtros.criadoEm) {
    condicoes.push(gte(usuario.created_at, filtros.criadoEm));
  }

  return db
    .select()
    .from(usuario)
    .where(condicoes.length > 0 ? and(...condicoes) : undefined);
}

export async function novoUsuario(dados: { nome: string; telefone: string }) {
  const [novoUsuario] = await db.insert(usuario).values(dados).returning();

  return novoUsuario;
}

export async function editarUsuario(dados: {
  nome: string;
  telefone: string;
  ativo: boolean;
}) {
  const [usuarioExistente] = await buscarUsuario({
    nome: dados.nome,
    apenasAtivos: false,
  });

  if (!usuarioExistente) {
    throw new Error("Serviço não encontrado");
  }

  if (!usuarioExistente.ativo) {
    throw new Error("Não é possível editar um serviço desativado");
  }

  const [usuarioEditado] = await db
    .update(usuario)
    .set({
      nome: dados.nome,
      telefone: dados.telefone,
    })
    .where(eq(usuario.nome, dados.nome))
    .returning();

  return usuarioEditado;
}

export async function deletarUsuario(nome: string) {
  const [usuarioExistente] = await buscarUsuario({ nome, apenasAtivos: false });
  if (!usuarioExistente) {
    throw new Error("Usuário não encontrado");
  }

  if (!usuarioExistente.ativo) {
    throw new Error("Usuário já está desativado");
  }
  const [usuarioDesativado] = await db
    .update(usuario)
    .set({ ativo: false })
    .where(eq(usuario.nome, nome))
    .returning();

  return usuarioDesativado;
}
