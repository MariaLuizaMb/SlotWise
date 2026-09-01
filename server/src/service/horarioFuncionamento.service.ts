import { push } from "node:stream/iter";
import { db } from "../config/database.js";
import { horarioFuncionamento } from "../models/schema.js";
import { eq, and, ilike, gte, lt, type SQL } from "drizzle-orm";

export async function buscarHorarioFuncionamento(filtros: {
  id?: number;
  dia_semana?: string;
}) {
  const condicoes: SQL[] = [];

  if (filtros.id) {
    condicoes.push(eq(horarioFuncionamento.id_hr, filtros.id));
  }

  if (filtros.dia_semana) {
    condicoes.push(
      ilike(horarioFuncionamento.dia_semana, `%${filtros.dia_semana}%`),
    );
  }

  return db
    .select()
    .from(horarioFuncionamento)
    .where(condicoes.length > 0 ? and(...condicoes) : undefined);
}

export async function novoHorarioFuncionamento(dados: {
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
}) {
  return db.insert(horarioFuncionamento).values(dados).returning();
}

export async function editarHorarioFuncionamento(dados: {
  id: number;
  dia_semana?: number;
  hora_inicio?: string;
  hora_fim?: string;
}) {
  const [hoarioExistente] = await db
    .select()
    .from(horarioFuncionamento)
    .where(eq(horarioFuncionamento.id_hr, dados.id));

  if (!hoarioExistente) {
    throw new Error("Horário de funcionamento não encontrado");
  }

  const [horarioAtualizado] = await db
    .update(horarioFuncionamento)
    .set({
      dia_semana: dados.dia_semana ?? hoarioExistente.dia_semana,
      hora_inicio: dados.hora_inicio ?? hoarioExistente.hora_inicio,
      hora_fim: dados.hora_fim ?? hoarioExistente.hora_fim,
    })
    .where(eq(horarioFuncionamento.id_hr, dados.id))
    .returning();

  return horarioAtualizado;
}

export async function deletarHorarioFuncionamento(id: number) {
  const [horarioExistente] = await db
    .select()
    .from(horarioFuncionamento)
    .where(eq(horarioFuncionamento.id_hr, id));

  if (!horarioExistente) {
    throw new Error("Horário de funcionamento não encontrado");
  }

  await db
    .delete(horarioFuncionamento)
    .where(eq(horarioFuncionamento.id_hr, id));
}
