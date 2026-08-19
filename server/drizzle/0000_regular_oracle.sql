CREATE TYPE "public"."status_agendamento" AS ENUM('AGUARDANDO_FUNCIONARIO', 'PENDENTE', 'CONFIRMADO', 'CANCELADO', 'CONCLUIDO', 'NAO_COMPARECEU');--> statement-breakpoint
CREATE TABLE "agendamento" (
	"id" serial PRIMARY KEY NOT NULL,
	"status" "status_agendamento" DEFAULT 'AGUARDANDO_FUNCIONARIO' NOT NULL,
	"data_agendamento" date NOT NULL,
	"horario_agendamento" time NOT NULL,
	"data_criacao_agendamento" timestamp DEFAULT now() NOT NULL,
	"data_modificacao_agendamento" timestamp DEFAULT now() NOT NULL,
	"data_exclusao_agendamento" timestamp,
	"id_usuario" integer NOT NULL,
	"id_func" integer
);
--> statement-breakpoint
CREATE TABLE "agendamento_servico" (
	"id_agendamento" integer NOT NULL,
	"id_servico" integer NOT NULL,
	"preco_cobrado" numeric(10, 2) NOT NULL,
	"duracao_efetiva" integer NOT NULL,
	CONSTRAINT "agendamento_servico_id_agendamento_id_servico_pk" PRIMARY KEY("id_agendamento","id_servico")
);
--> statement-breakpoint
CREATE TABLE "funcionario" (
	"id_func" serial PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"email" varchar(255) NOT NULL,
	"senha_hash" text NOT NULL,
	"telefone" varchar(20),
	"is_admin" boolean DEFAULT false NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "funcionario_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "horario_funcionamento" (
	"id_hr" serial PRIMARY KEY NOT NULL,
	"dia_semana" integer NOT NULL,
	"hora_inicio" time NOT NULL,
	"hora_fim" time NOT NULL,
	CONSTRAINT "check_horario_valido" CHECK ("horario_funcionamento"."hora_fim" > "horario_funcionamento"."hora_inicio")
);
--> statement-breakpoint
CREATE TABLE "servicos" (
	"id_servico" serial PRIMARY KEY NOT NULL,
	"nome" varchar(100) NOT NULL,
	"duracao" integer NOT NULL,
	"preco" numeric(10, 2) NOT NULL,
	"descricao" text,
	"ativo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usuario" (
	"id_user" serial PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"telefone" varchar(20) NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "usuario_telefone_unique" UNIQUE("telefone")
);
--> statement-breakpoint
ALTER TABLE "agendamento" ADD CONSTRAINT "agendamento_id_usuario_usuario_id_user_fk" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuario"("id_user") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agendamento" ADD CONSTRAINT "agendamento_id_func_funcionario_id_func_fk" FOREIGN KEY ("id_func") REFERENCES "public"."funcionario"("id_func") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agendamento_servico" ADD CONSTRAINT "agendamento_servico_id_agendamento_agendamento_id_fk" FOREIGN KEY ("id_agendamento") REFERENCES "public"."agendamento"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agendamento_servico" ADD CONSTRAINT "agendamento_servico_id_servico_servicos_id_servico_fk" FOREIGN KEY ("id_servico") REFERENCES "public"."servicos"("id_servico") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_func_data_horario_ativo" ON "agendamento" USING btree ("id_func","data_agendamento","horario_agendamento") WHERE "agendamento"."data_exclusao_agendamento" IS NULL AND "agendamento"."id_func" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_agendamento_sem_func" ON "agendamento" USING btree ("data_agendamento","horario_agendamento") WHERE "agendamento"."id_func" IS NULL AND "agendamento"."data_exclusao_agendamento" IS NULL;