# SlotWise

Projeto de Desenvolvimento Individual  
Plataforma de Agendamento de Serviços

---

## Objetivo do Produto

O SlotWise é uma plataforma de agendamento de serviços desenvolvida para estabelecimentos baseados em horário marcado, como barbearias, salões de beleza, manicures e prestadores autônomos.

Diferente de sistemas convencionais, o projeto resolve o fluxo de agendamento permitindo que o cliente crie uma reserva sem um profissional pré-atribuído. O agendamento fica disponível para que qualquer funcionário apto o assuma, refletindo dinâmicas reais de atendimento sem preferência prévia de profissional. O sistema também integra mensageria automática via WhatsApp para notificações e lembretes aos clientes.

---

## Tecnologias e Stack

A arquitetura foi desenhada mantendo client e server desacoplados, garantindo isolamento de responsabilidades:

### Backend
* Node.js (ECMAScript Modules nativos)
* Express (Padrão arquitetural MVC)
* TypeScript (moduleResolution: nodenext)
* Drizzle ORM
* PostgreSQL (hospedado no Neon Database - Serverless)
* Redis (para camada de cache)

### Frontend
* Next.js
* React
* TypeScript

### Infraestrutura
* Docker & Docker Compose (orquestração dos containers client, server e redis)
* Neon (Banco de dados gerenciado remotamente)

---

## Gestão e Arquitetura do Projeto

O backend segue o padrão MVC rigorosamente dividido em três camadas primárias:

* **Routes:** Definição dos endpoints e rotas HTTP.
* **Controllers:** Recepção das requisições HTTP, extração de parâmetros/corpo e formatação das respostas.
* **Services:** Encapsulamento de regras de negócio e consultas via Drizzle ORM, totalmente desacoplados de HTTP.

A modelagem do banco de dados traz as seguintes decisões técnicas:

* **Snapshot de preços/duração na tabela N:N (agendamento_servico):** Preservação do histórico de valores cobrados no momento do agendamento.
* **Soft delete generalizado:** Utilização de flags de desativação (`ativo: boolean` ou `data_exclusao`) em todas as entidades.
* **Atribuição opcional de funcionário:** Controle atômico e condicional na seleção de profissionais para evitar condições de corrida.
* **Índice único parcial:** Restrição que impede conflito de horários para o mesmo profissional em agendamentos ativos.
* **Constraints do PostgreSQL:** Regras de verificação (`CHECK` para horários válidos), tipo `numeric(10,2)` para precisão monetária e enums nativos.

---

## Como Executar o Projeto

### Pré-requisitos
* Git instalado
* Docker + Docker Compose instalados

### Passo a Passo

1. **Clone o repositório**
   ```bash
   git clone https://github.com/usuario/slotwise.git
   cd slotwise
   ```

2. **Configure os arquivos .env**
   Configure `server/.env` (incluindo `DATABASE_URL` do Neon e `REDIS_URL=redis://redis:6379`) e `client/.env`.

3. **Suba os containers**
   ```bash
   docker compose up --build
   ```

4. **Acesse a aplicação**
   * Frontend: http://localhost:3000
   * Backend API: http://localhost:4000

---

## Estrutura de Pastas

```text
📁 slotwise/
│
├── 📁 client/                        # Next.js (Frontend)
│   ├── 📁 src/                       # Páginas e componentes (App Router)
│   ├── 📄 Dockerfile
│   ├── 📄 package.json
│   └── 📄 .env
│
├── 📁 server/                        # Express + MVC (Backend)
│   ├── 📁 drizzle/                   # Migrations geradas pelo drizzle-kit
│   ├── 📁 src/
│   │   ├── 📁 config/                # Conexão com Neon e Redis
│   │   ├── 📁 controllers/           # Tratam requisição/resposta HTTP
│   │   ├── 📁 models/                # Schema e tabelas Drizzle
│   │   ├── 📁 routes/                # Definição de endpoints
│   │   ├── 📁 services/              # Lógica de negócio e acesso ao banco
│   │   └── 📄 server.ts              # Ponto de entrada da aplicação
│   │
│   ├── 📄 Dockerfile
│   ├── 📄 drizzle.config.ts
│   ├── 📄 package.json
│   ├── 📄 tsconfig.json
│   └── 📄 .env
│
├── 📄 docker-compose.yml             # Orquestração da aplicação e Redis
└── 📄 .gitignore
```

---

## Status Atual e Próximos Passos

O projeto está em desenvolvimento ativo do zero. O estado atual da aplicação inclui:

### Concluído
* Modelagem do schema no Drizzle ORM e execução de migrations no Neon.
* Ambiente containerizado com Docker Compose (client, server, redis).
* CRUD completo da entidade de serviços com filtros dinâmicos combináveis (nome, preço, duração, status).
* Tratamento de soft delete e validações de integridade nos registros de serviço.

### Próximos Passos
* [ ] CRUD de usuários e funcionários
* [ ] Lógica completa de agendamento (criação, atribuição atômica e cancelamento)
* [ ] Autenticação JWT e controle de acesso baseado em funções (RBAC)
* [ ] Middleware centralizado de tratamento de erros
* [ ] Integração com a API do WhatsApp para envio de notificações
* [ ] Cobertura de testes automatizados
* [ ] Construção das telas da aplicação no Frontend (Next.js)
* [ ] Pipeline de CI/CD e Deploy em produção

---

## Considerações Finais

O desenvolvimento do SlotWise reflete a construção prática e individual de uma solução completa de software, desde a concepção do banco de dados até a entrega da interface gráfica e infraestrutura de rede. O projeto põe em prática conceitos vitais de engenharia de software moderna:

* **Arquitetura e Padrões de Projeto:** Separação rigorosa de responsabilidades via MVC, isolando regras de negócio da camada de transporte HTTP.
* **Modelagem de Banco de Dados:** Uso eficiente de constraints, índices parciais e snapshots históricos para garantir consistência e performance no PostgreSQL.
* **DevOps e Infraestrutura:** Containerização completa de serviços com Docker Compose e integração com serviços cloud serverless como o Neon Database.
* **Integridade de Dados:** Tratamento de concorrência através de atualizações atômicas e resiliência via Soft Delete.

O SlotWise continua evoluindo para se tornar uma aplicação escalável, robusta e pronta para o ambiente de produção.
