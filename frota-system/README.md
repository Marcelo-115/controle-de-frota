# 🚜 Sistema de Gestão de Frota

Sistema web para controle de consumo de combustível, manutenção e custos de máquinas pesadas.

---

## O que o sistema faz

- Controle de abastecimento com cálculo automático de média L/h
- Dashboard comparativo de todas as máquinas
- Controle de manutenções preventivas e corretivas com alertas por horímetro
- Controle de operadores e horas por pessoa
- Módulo financeiro (aluguel, peças, mão de obra)
- Exportação de relatórios em PDF e Excel
- 4 perfis de acesso: Admin, Mecânico, Gerente e Diretoria

---

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | Python 3.11 + FastAPI |
| Frontend | React 18 + Vite + TailwindCSS |
| Banco de dados | PostgreSQL (Supabase) |
| Hospedagem | Railway |
| Auth | JWT com refresh token |

---

## Pré-requisitos

- [Node.js 18+](https://nodejs.org)
- [Python 3.11+](https://python.org)
- [Git](https://git-scm.com)
- Conta no [GitHub](https://github.com)
- Conta no [Railway](https://railway.app)
- Projeto criado no [Supabase](https://supabase.com) ✅ (já criado)

---

## Como rodar localmente

### 1. Configurar o backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Copie o arquivo de configuração:
```bash
cp .env.example .env
```

Edite o `.env` com sua connection string do Supabase.

Rode as migrations (cria as tabelas no banco):
```bash
alembic upgrade head
```

Insira os dados iniciais:
```bash
python seed.py
```

Inicie o backend:
```bash
uvicorn main:app --reload
```

Backend rodando em: http://localhost:8000
Documentação da API: http://localhost:8000/docs

### 2. Configurar o frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend rodando em: http://localhost:5173

### 3. Acessar o sistema

| Perfil | Email | Senha |
|---|---|---|
| Admin | admin@frota.com | Admin@123 |
| Mecânico | mecanico@frota.com | Mec@123 |
| Gerente | gerente@frota.com | Ger@123 |
| Diretoria | diretoria@frota.com | Dir@123 |

> ⚠️ Troque as senhas após o primeiro acesso.

---

## Deploy no Railway (passo a passo)

### 1. Subir o código no GitHub

Na pasta raiz do projeto:

```bash
git init
git add .
git commit -m "sistema de frota v1"
```

Crie um repositório no [github.com](https://github.com/new) chamado `sistema-frota` e execute:

```bash
git remote add origin https://github.com/SEU_USUARIO/sistema-frota.git
git branch -M main
git push -u origin main
```

### 2. Criar o projeto no Railway

1. Acesse [railway.app](https://railway.app) e entre com o GitHub
2. Clique em **New Project → Deploy from GitHub repo**
3. Selecione o repositório `sistema-frota`
4. O Railway detecta automaticamente o Python e o Node.js

### 3. Configurar o serviço do backend

No painel do Railway, selecione o serviço do backend e vá em **Variables**. Adicione:

```
DATABASE_URL        = (sua connection string do Supabase)
SECRET_KEY          = (chave secreta longa e aleatória)
ALGORITHM           = HS256
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS   = 7
ENVIRONMENT         = production
ALLOWED_ORIGINS     = ["https://SEU_FRONTEND.up.railway.app"]
```

### 4. Configurar o serviço do frontend

No serviço do frontend, adicione:

```
VITE_API_URL = https://SEU_BACKEND.up.railway.app
```

### 5. Pronto

O Railway gera URLs públicas para cada serviço. Compartilhe o link do frontend com sua equipe — ninguém precisa instalar nada.

---

## Estrutura do projeto

```
frota-system/
  backend/
    app/
      api/v1/routes/     — rotas da API
      core/              — configurações, segurança, banco
      models/            — tabelas do banco (SQLAlchemy)
      schemas/           — validação de dados (Pydantic)
      services/          — regras de negócio
    migrations/          — Alembic
    main.py
    seed.py              — dados iniciais
    requirements.txt
    .env.example
  frontend/
    src/
      components/        — componentes reutilizáveis
      pages/             — telas do sistema
      hooks/             — React Query hooks
      services/          — chamadas à API
    package.json
  .gitignore
  README.md
```

---

## Tabelas do banco de dados

| Tabela | O que armazena |
|---|---|
| usuarios | Contas de acesso com perfil |
| maquinas | Cadastro de equipamentos |
| abastecimentos | Registros com cálculo automático de horas e média L/h |
| manutencoes | Histórico e agenda de manutenções |
| operadores | Cadastro de operadores |
| operador_maquina | Horas trabalhadas por operador em cada máquina |
| custos | Custos financeiros por máquina |

---

## Máquinas já cadastradas

| Máquina | Tipo | Horímetro atual | Última média |
|---|---|---|---|
| Trator Samambaia | Trator | 16,7h | 3,64 L/h |
| Trator Vicente Pires | Trator | 12,2h | 3,04 L/h |
| Bob Cat (Alugada) | Bob Cat | 7.301,0h | 3,62 L/h |

---

## Custo mensal estimado

| Serviço | Custo |
|---|---|
| Railway (backend + frontend) | ~R$ 25–50/mês |
| Supabase (banco de dados) | R$ 0 (plano free) |
| GitHub (código) | R$ 0 |
| **Total** | **~R$ 25–50/mês** |

---

## Suporte

Sistema desenvolvido com auxílio do Claude (Anthropic).
Para dúvidas ou evoluções, use o Claude Code com o contexto deste projeto.
