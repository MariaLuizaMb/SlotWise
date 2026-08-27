import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  numeric,
  boolean,
  date,
  time,
  timestamp,
  pgEnum,
  primaryKey,
  uniqueIndex,
  index,
  check,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const statusAgendamentoEnum = pgEnum("status_agendamento", [
  "AGUARDANDO_FUNCIONARIO", // Criado pelo cliente, ainda sem funcionário associado
  "PENDENTE", // Funcionário já assumiu, aguardando confirmação/andamento
  "CONFIRMADO",
  "CANCELADO",
  "CONCLUIDO",
  "NAO_COMPARECEU",
]);

// ======================================================================
//TABELAS
// ======================================================================

// Tabela de Clientes
export const usuario = pgTable("usuario", {
  id_user: serial("id_user").primaryKey(),
  nome: text("nome").notNull(),
  telefone: varchar("telefone", { length: 20 }).notNull().unique(),
  ativo: boolean("ativo").default(true).notNull(), // Soft delete: cliente "removido" vira inativo
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Tabela de Barbeiros / Administradores
export const funcionario = pgTable("funcionario", {
  id_func: serial("id_func").primaryKey(),
  nome: text("nome").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  senha_hash: text("senha_hash").notNull(),
  telefone: varchar("telefone", { length: 20 }),
  is_admin: boolean("is_admin").default(false).notNull(), // Flag de permissão administrativa
  ativo: boolean("ativo").default(true).notNull(), // Soft delete: funcionário que saiu vira inativo
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Catálogo de Serviços da Barbearia (Valores padrão/atuais)
export const servicos = pgTable("servicos", {
  id_servico: serial("id_servico").primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull(),
  duracao: integer("duracao").notNull(), // Duração padrão em minutos no catálogo
  preco: numeric("preco", { precision: 10, scale: 2 }).notNull(), // Preço padrão atual
  descricao: text("descricao"),
  ativo: boolean("ativo").default(true).notNull(), // Soft delete: serviço descontinuado vira inativo
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Tabela Central de Agendamentos
export const agendamento = pgTable(
  "agendamento",
  {
    id: serial("id").primaryKey(),
    status: statusAgendamentoEnum("status")
      .default("AGUARDANDO_FUNCIONARIO")
      .notNull(),
    data_agendamento: date("data_agendamento").notNull(),
    horario_agendamento: time("horario_agendamento").notNull(),
    data_criacao_agendamento: timestamp("data_criacao_agendamento")
      .defaultNow()
      .notNull(),
    data_modificacao_agendamento: timestamp("data_modificacao_agendamento")
      .defaultNow()
      .notNull(),
    data_exclusao_agendamento: timestamp("data_exclusao_agendamento"), // Soft delete: agendamento cancelado/removido
    id_usuario: integer("id_usuario")
      .notNull()
      .references(() => usuario.id_user, { onDelete: "restrict" }), // Preserva histórico, mesmo se usuário for desativado
    id_func: integer("id_func").references(() => funcionario.id_func, {
      onDelete: "restrict",
    }), // Opcional: nulo até um funcionário assumir o agendamento
  },
  (table) => [
    // Impede que o mesmo funcionário tenha dois agendamentos ativos no mesmo dia/horário.
    // Só considera agendamentos ativos (não excluídos) E já atribuídos a um funcionário —
    // dois agendamentos "sem dono" no mesmo slot não são conflito entre si.
    uniqueIndex("uniq_func_data_horario_ativo")
      .on(table.id_func, table.data_agendamento, table.horario_agendamento)
      .where(
        sql`${table.data_exclusao_agendamento} IS NULL AND ${table.id_func} IS NOT NULL`,
      ),

    // Acelera a tela principal do funcionário: "quais agendamentos ainda não têm dono
    // nesse dia/horário?" — índice parcial, só sobre o que realmente importa pra essa query.
    index("idx_agendamento_sem_func")
      .on(table.data_agendamento, table.horario_agendamento)
      .where(
        sql`${table.id_func} IS NULL AND ${table.data_exclusao_agendamento} IS NULL`,
      ),
  ],
);

// Tabela Associativa N:N (Agendamento <-> Serviços) com Snapshots Históricos
export const agendamentoServico = pgTable(
  "agendamento_servico",
  {
    id_agendamento: integer("id_agendamento")
      .notNull()
      .references(() => agendamento.id, { onDelete: "cascade" }), // Se o agendamento sumir, os itens dele somem junto (não há histórico independente disso)
    id_servico: integer("id_servico")
      .notNull()
      .references(() => servicos.id_servico, { onDelete: "restrict" }), // Preserva histórico, mesmo se serviço for desativado
    preco_cobrado: numeric("preco_cobrado", {
      precision: 10,
      scale: 2,
    }).notNull(),
    duracao_efetiva: integer("duracao_efetiva").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id_agendamento, table.id_servico] }),
  ],
);

// Horário de Funcionamento Global da Barbearia
export const horarioFuncionamento = pgTable(
  "horario_funcionamento",
  {
    id_hr: serial("id_hr").primaryKey(),
    dia_semana: integer("dia_semana").notNull(),
    hora_inicio: time("hora_inicio").notNull(),
    hora_fim: time("hora_fim").notNull(),
  },
  (table) => [
    check(
      "check_horario_valido",
      sql`${table.hora_fim} > ${table.hora_inicio}`,
    ),
  ],
);

// ======================================================================
//RELACIONAMENTOS
// ======================================================================

export const usuarioRelations = relations(usuario, ({ many }) => ({
  agendamentos: many(agendamento),
}));

export const funcionarioRelations = relations(funcionario, ({ many }) => ({
  agendamentos: many(agendamento),
}));

export const agendamentoRelations = relations(agendamento, ({ one, many }) => ({
  cliente: one(usuario, {
    fields: [agendamento.id_usuario],
    references: [usuario.id_user],
  }),
  barbeiro: one(funcionario, {
    fields: [agendamento.id_func],
    references: [funcionario.id_func],
  }),
  servicos: many(agendamentoServico),
}));

export const servicosRelations = relations(servicos, ({ many }) => ({
  agendamentos: many(agendamentoServico),
}));

export const agendamentoServicoRelations = relations(
  agendamentoServico,
  ({ one }) => ({
    agendamento: one(agendamento, {
      fields: [agendamentoServico.id_agendamento],
      references: [agendamento.id],
    }),
    servico: one(servicos, {
      fields: [agendamentoServico.id_servico],
      references: [servicos.id_servico],
    }),
  }),
);
