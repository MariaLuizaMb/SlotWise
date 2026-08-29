import { db } from "../config/database.js";
import { usuario } from "../models/schema.js";
import { eq, and, ilike, gte, lt, type SQL } from "drizzle-orm";

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
    const inicioDia = new Date(filtros.criadoEm);
    inicioDia.setHours(0, 0, 0, 0);

    const inicioDiaSeguinte = new Date(inicioDia);
    inicioDiaSeguinte.setDate(inicioDiaSeguinte.getDate() + 1);

    condicoes.push(gte(usuario.created_at, inicioDia));
    condicoes.push(lt(usuario.created_at, inicioDiaSeguinte));
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
  id: number;
  nome: string;
  telefone: string;
  ativo: boolean;
}) {
  const [usuarioExistente] = await buscarUsuario({
    id: dados.id,
    apenasAtivos: false,
  });

  if (!usuarioExistente) {
    throw new Error("Usuário não econtrado");
  }

  if (!usuarioExistente.ativo) {
    throw new Error("Não é possível editar um usuário desativado");
  }

  const [usuarioEditado] = await db
    .update(usuario)
    .set({
      nome: dados.nome,
      telefone: dados.telefone,
    })
    .where(eq(usuario.id_user, dados.id))
    .returning();

  return usuarioEditado;
}

export async function deletarUsuario(id: number) {
  const [usuarioExistente] = await buscarUsuario({ id, apenasAtivos: false });
  if (!usuarioExistente) {
    throw new Error("Usuário não encontrado");
  }

  if (!usuarioExistente.ativo) {
    throw new Error("Usuário já está desativado");
  }
  const [usuarioDesativado] = await db
    .update(usuario)
    .set({ ativo: false })
    .where(eq(usuario.id_user, id))
    .returning();

  return usuarioDesativado;
}
