# 🔐 Cofre de Senhas

Projeto acadêmico para o trabalho de API REST. A aplicação permite criar uma conta e salvar logins (serviço, site, usuário, senha e observações) em um cofre pessoal.

## Tecnologias
- Next.js 16 + React 19
- API REST com Route Handlers
- PostgreSQL no Neon
- Vercel para hospedagem
- bcrypt para hash da senha principal
- AES-256-GCM para criptografar as senhas armazenadas
- Cookies HttpOnly + JWT para sessão

## Entidades
### User
`id`, `name`, `email`, `password_hash`, `created_at`

### Credential
`id`, `user_id`, `title`, `website`, `username`, `password_ciphertext`, `notes`, `created_at`, `updated_at`

Relacionamento: um usuário possui várias credenciais (`User 1:N Credential`).

## API REST
- `POST /api/auth/register` — cria usuário
- `POST /api/auth/login` — autentica usuário
- `POST /api/auth/logout` — encerra sessão
- `GET /api/auth/me` — usuário autenticado
- `GET /api/credentials` — lista logins do usuário
- `POST /api/credentials` — cria login
- `GET /api/credentials/:id` — consulta um login
- `PUT /api/credentials/:id` — atualiza um login
- `DELETE /api/credentials/:id` — exclui um login

## Rodar localmente
1. Instale Node.js 20+.
2. Entre na pasta do projeto.
3. Execute `npm install`.
4. Crie `.env.local` a partir de `.env.example`.
5. Crie um projeto PostgreSQL no Neon e coloque a connection string em `DATABASE_URL`.
6. Execute o conteúdo de `db/schema.sql` no SQL Editor do Neon.
7. Gere os segredos:
   - `openssl rand -base64 32` para `VAULT_ENCRYPTION_KEY`.
   - `openssl rand -hex 32` para `SESSION_SECRET`.
8. Execute `npm run dev`.
9. Acesse `http://localhost:3000`.

## Deploy na Vercel
1. Suba este projeto para um repositório GitHub.
2. Na Vercel, importe o repositório; o framework Next.js é detectado automaticamente.
3. Adicione `DATABASE_URL`, `SESSION_SECRET` e `VAULT_ENCRYPTION_KEY` em Project Settings > Environment Variables.
4. Garanta que as variáveis estejam disponíveis para Production, Preview e Development conforme necessário.
5. Rode o deploy.
6. No Neon, mantenha o banco criado e o schema aplicado.

**Nunca coloque valores reais das variáveis no GitHub.** O arquivo `.env.example` contém somente placeholders.

## Observação acadêmica
Este projeto demonstra autenticação, CRUD, relacionamento entre entidades, API REST, banco PostgreSQL e deploy em nuvem. Para um produto real, ainda seriam recomendados controles adicionais como rate limiting, recuperação de conta, auditoria, CSP, rotação de chaves, testes automatizados e revisão de segurança independente.
