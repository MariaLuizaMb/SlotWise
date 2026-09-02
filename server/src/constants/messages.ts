export const MENSAGENS = {
  USUARIO: {
    NAO_ENCONTRADO: "Usuário não encontrado.",
    DESATIVADO: "Não é possível editar um usuário desativado",
    JA_DESATIVADO: "Usuário já está desativado.",
  },

  FUNCIONARIO: {
    NAO_ENCONTRADO: "Funcionário não encontrado",
    DESATIVADO: "Não é possível editar um funcionário desativado",
    JA_DESATIVADO: "Funcionário já está desativado",
    EMAIL_JA_CADASTRADO: "Esse e-mail já está cadastrado.",
  },

  SERVICO: {
    NAO_ENCONTRADO: "Serviço não encontrado",
    DESATIVADO: "Não é possível editar um serviço desativado",
    JA_DESATIVADO: "Serviço já está desativado",
  },

  HORARIO_FUNCIONAMENTO: {
    NAO_ENCONTRADO: "Horário de funcionamento não encontrado",
  },

  AGENDAMENTO: {
    NAO_ENCONTRADO: "Agendamento não encontrado.",
    CANCELADO_NAO_EDITAVEL: "Não é possível editar um agendamento cancelado.",
    JA_CANCELADO: "Agendamento já está cancelado.",
    NENHUM_SERVICO_ESCOLHIDO:
      "Escolha pelo menos um serviço para realizar o agendamento de um horário.",
    FALHA_AO_CRIAR: "Falha ao criar o agendamento.",
    FALHA_AO_ATRIBUIR_FUNCIONARIO:
      "Falha ao atribuir funcionário. O agendamento pode já ter sido atribuído ou não existe.",
    servicosInvalidos: (ids: number[]) =>
      `Serviço(s) não encontrado(s) ou inativo(s): ${ids.join(", ")}`,
  },
} as const;
