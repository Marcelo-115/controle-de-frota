# Sistema de Gestão de Frota — Máquinas Pesadas

Sistema web completo para gestão de frota com controle de abastecimentos, manutenções, operadores e relatórios.

---

## Stack

- **Backend:** Python 3.11 · FastAPI · SQLAlchemy async · Alembic
- **Frontend:** React 18 · Vite · TailwindCSS · TanStack Query
- **Banco:** PostgreSQL via Supabase (ou Docker local)
- **Auth:** JWT com refresh token

---

## 1. Configurar o Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto
2. Vá em **Project Settings → Database**
3. Copie a **Connection String** no modo **URI** (use o campo "Connection pooling" com porta 6543 para produção, ou a porta 5432 direto para dev)
4. A connection string tem o formato:
   ```
   postgresql://postgres.xxxxx:SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
   ```
5. Para o backend async, troque `postgresql://` por `postgresql+asyncpg://`

---

## 2. Configurar variáveis de ambiente

```bash
cd backend
copy .env.example .env
```

Edite `.env` com sua connection string do Supabase:

```env
DATABASE_URL=postgresql+asyncpg://postgres.xxxxx:SENHA@host:5432/postgres
SECRET_KEY=gere_uma_chave_segura_aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
ENVIRONMENT=development
ALLOWED_ORIGINS=["http://localhost:5173"]
```

> **Gerar SECRET_KEY segura:**
> ```bash
> python -c "import secrets; print(secrets.token_hex(32))"
> ```

---

## 3. Configurar o backend

```bash
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar (Windows)
venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt
```

> **Nota sobre WeasyPrint no Windows:** pode exigir GTK. Se tiver problemas, instale o
> [GTK Runtime for Windows](https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer).
> A exportação Excel funciona sem ele.

---

## 4. Rodar as migrations

```bash
cd backend
alembic upgrade head
```

---

## 5. Popular o banco com dados iniciais

```bash
cd backend
python seed.py
```

Isso cria:
- **Admin:** admin@frota.com / Admin@123
- **Mecânico:** mecanico@frota.com / Mec@123
- **Gerente:** gerente@frota.com / Ger@123
- 3 máquinas com seus abastecimentos históricos

---

## 6. Rodar o backend

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API disponível em: http://localhost:8000  
Documentação automática: http://localhost:8000/docs

---

## 7. Rodar o frontend

```bash
cd frontend

# Instalar dependências
npm install

# Rodar em modo dev
npm run dev
```

Frontend disponível em: http://localhost:5173

---

## 8. Opção: banco local com Docker

Se preferir rodar sem Supabase localmente:

```bash
# Na raiz do projeto
docker compose up -d

# Configure o .env com:
DATABASE_URL=postgresql+asyncpg://frota:frota123@localhost:5432/frota_db
```

---

## 9. Deploy do frontend no Vercel

```bash
cd frontend
npm run build
```

Ou conecte o repositório diretamente no [vercel.com](https://vercel.com):

1. Importe o repositório
2. Defina o **Root Directory** como `frontend`
3. Adicione variável de ambiente:
   ```
   VITE_API_URL=https://seu-backend.fly.dev/api/v1
   ```

---

## 10. Deploy do backend em produção

Recomendamos [Railway](https://railway.app) ou [Fly.io](https://fly.io):

```bash
# Fly.io
fly launch
fly secrets set DATABASE_URL="postgresql+asyncpg://..."
fly secrets set SECRET_KEY="..."
fly deploy
```

No `.env` de produção, altere:
```env
ENVIRONMENT=production
ALLOWED_ORIGINS=["https://seu-frontend.vercel.app"]
```

---

## Perfis de acesso

| Perfil      | Dashboard | Máquinas | Abastec. | Manutenções | Relatórios | Usuários |
|-------------|-----------|----------|----------|-------------|------------|----------|
| Admin       | ✅        | ✅ CRUD  | ✅ CRUD  | ✅ CRUD     | ✅         | ✅       |
| Mecânico    | ✅        | ✅ Read  | ✅ próprios | ✅ próprias | ❌      | ❌       |
| Gerente     | ✅        | ✅ CRUD  | ✅ Read  | ✅ Read     | ✅         | ❌       |
| Diretoria   | ✅        | ✅ Read  | ❌       | ❌          | ✅         | ❌       |

---

## Status de consumo (L/h)

| Status    | Média       | Cor    |
|-----------|-------------|--------|
| Econômico | < 3.0 L/h   | 🟢 Verde |
| Normal    | 3.0–4.0 L/h | 🟡 Amarelo |
| Alto      | > 4.0 L/h   | 🔴 Vermelho |
