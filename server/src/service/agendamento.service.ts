import { db } from "../config/database.js";
import { agendamento, agendamentoServico, servicos } from "../models/schema.js";
import { eq, and, gte, lte, isNull, between, type SQL } from "drizzle-orm";

export async function buscarAgendamentos(filtros: {
  id?: number;
  idUsuario?: number;
  idFunc?: number;
  status?: (typeof agendamento.status.enumValues)[number];

  dataAgendamento?: string;
  dataAgendamentoInicio?: string;
  dataAgendamentoFim?: string;

  horarioAgendamento?: string;
  horarioAgendamentoInicio?: string;
  horarioAgendamentoFim?: string;

  semFuncionario?: boolean;
  apenasAtivos?: boolean;
}) {
  const condicoes: SQL[] = [];

  if (filtros.id) {
    condicoes.push(eq(agendamento.id, filtros.id));
  }

  if (filtros.idUsuario) {
    condicoes.push(eq(agendamento.id_usuario, filtros.idUsuario));
  }

  if (filtros.idFunc) {
    condicoes.push(eq(agendamento.id_func, filtros.idFunc));
  }

  if (filtros.status) {
    condicoes.push(eq(agendamento.status, filtros.status));
  }

  if (filtros.dataAgendamento) {
    condicoes.push(eq(agendamento.data_agendamento, filtros.dataAgendamento));
  } else if (filtros.dataAgendamentoInicio && filtros.dataAgendamentoFim) {
    condicoes.push(
      between(
        agendamento.data_agendamento,
        filtros.dataAgendamentoInicio,
        filtros.dataAgendamentoFim,
      ),
    );
  } else if (filtros.dataAgendamentoInicio) {
    condicoes.push(
      gte(agendamento.data_agendamento, filtros.dataAgendamentoInicio),
    );
  } else if (filtros.dataAgendamentoFim) {
    condicoes.push(
      lte(agendamento.data_agendamento, filtros.dataAgendamentoFim),
    );
  }

  if (filtros.horarioAgendamento) {
    condicoes.push(
      eq(agendamento.horario_agendamento, filtros.horarioAgendamento),
    );
  } else if (
    filtros.horarioAgendamentoInicio &&
    filtros.horarioAgendamentoFim
  ) {
    condicoes.push(
      between(
        agendamento.horario_agendamento,
        filtros.horarioAgendamentoInicio,
        filtros.horarioAgendamentoFim,
      ),
    );
  } else if (filtros.horarioAgendamentoInicio) {
    condicoes.push(
      gte(agendamento.horario_agendamento, filtros.horarioAgendamentoInicio),
    );
  } else if (filtros.horarioAgendamentoFim) {
    condicoes.push(
      lte(agendamento.horario_agendamento, filtros.horarioAgendamentoFim),
    );
  }

  return db
    .select()
    .from(agendamento)
    .where(condicoes.length > 0 ? and(...condicoes) : undefined);
}

export async function criarAgendamento(dados: {
  idUsuario: number;
  dataAgendamento: string;
  horarioAgendamento: string;
  servicosIds: number[];
}) {
  if (dados.servicosIds.length === 0) {
    throw new Error(
      "Escolha pelo menos um serviço para realizar o agendanento de um horário.",
    );
  }

  return db.transaction(async (tx) => {
    const servicosEscolhidos = await tx
      .select()
      .from(servicos)
      .where(and(eq(servicos.ativo, true)));

    const idServicosEscolhidos = servicosEscolhidos.map((s) => s.id_servico);
    const servicosInvalidos = dados.servicosIds.filter(
      (id) => !idServicosEscolhidos.includes(id),
    );

    if (servicosInvalidos.length > 0) {
      throw new Error(
        `Serviço(s) não encontrado(s) ou inativo(s): ${servicosInvalidos.join(", ")}`,
      );
    }

    const [novoAgendamento] = await tx
      .insert(agendamento)
      .values({
        id_usuario: dados.idUsuario,
        data_agendamento: dados.dataAgendamento,
        horario_agendamento: dados.horarioAgendamento,
      })
      .returning();

    if (!novoAgendamento) {
      throw new Error("Falha ao criar o agendamento");
    }

    const itensAgendamentoServico = servicosEscolhidos.map((servico) => ({
      id_agendamento: novoAgendamento.id,
      id_servico: servico.id_servico,
      preco_cobrado: servico.preco,
      duracao_efetiva: servico.duracao,
    }));

    await tx.insert(agendamentoServico).values(itensAgendamentoServico);

    return novoAgendamento;
  });
}

export async function atribuirFuncionario(dados: {
  idAgendamento: number;
  idFuncionario: number;
}) {
  const [agendamentoAtualizado] = await db
    .update(agendamento)
    .set({
      id_func: dados.idFuncionario,
      status: "PENDENTE",
      data_modificacao_agendamento: new Date(),
    })
    .where(
      and(
        eq(agendamento.id, dados.idAgendamento),
        isNull(agendamento.id_func),
        isNull(agendamento.data_exclusao_agendamento),
      ),
    )
    .returning();

  if (!agendamentoAtualizado) {
    throw new Error(
      "Falha ao atribuir funcionário. O agendamento pode já ter sido atribuído ou não existe.",
    );
  }

  return agendamentoAtualizado;
}

export async function atualizarAgendamento(dados: {
  idAgendamento: number;
  dataAgendamento: string;
  horarioAgendamento: string;
}) {
  const [agendamentoExistente] = await buscarAgendamentos({
    id: dados.idAgendamento,
    apenasAtivos: true,
  });

  if (!agendamentoExistente) {
    throw new Error("Agendamento não encontrado.");
  }

  if (agendamentoExistente.data_exclusao_agendamento !== null) {
    throw new Error("Não é possível editar um agendamento cancelado.");
  }

  const [agendamentoAtualizado] = await db
    .update(agendamento)
    .set({
      data_agendamento: dados.dataAgendamento,
      horario_agendamento: dados.horarioAgendamento,
      data_modificacao_agendamento: new Date(),
    })
    .where(eq(agendamento.id, dados.idAgendamento))
    .returning();

  return agendamentoAtualizado;
}

export async function cancelarAgendamento(idAgendamento: number) {
  const [agendamentoExistente] = await buscarAgendamentos({
    id: idAgendamento,
    apenasAtivos: true,
  });

  if (!agendamentoExistente) {
    throw new Error("Agendamento não encontrado.");
  }

  if (agendamentoExistente.data_exclusao_agendamento !== null) {
    throw new Error("Agendamento já está cancelado.");
  }

  const [agendamentoCancelado] = await db
    .update(agendamento)
    .set({
      status: "CANCELADO",
      data_exclusao_agendamento: new Date(),
      data_modificacao_agendamento: new Date(),
    })
    .where(eq(agendamento.id, idAgendamento))
    .returning();

  return agendamentoCancelado;
}
