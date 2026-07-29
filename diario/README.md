# Meu Diário

Diário pessoal simples: abre, escreve, salva sozinho. Funciona no celular e no
notebook com as mesmas entradas nos dois (o texto fica guardado em um servidor
central), e a cada edição salva também uma cópia em Markdown neste repositório
do GitHub, em `diario/backups/AAAA-MM-DD.md` — cada salvamento vira um commit,
então o histórico de edições de cada dia fica registrado no Git.

## Como funciona

- **Um servidor** (pasta `server/`) guarda as entradas em um banco SQLite e
  serve o app pelo navegador.
- **Um app web** (pasta `public/`) — sem instalação de loja de aplicativos —
  que dá pra "adicionar à tela inicial" no celular e abre como um app normal.
- **Login por senha única**, só para você. Não tem cadastro de usuários.
- **Backup automático**: toda vez que o texto do dia é salvo, o servidor
  também envia uma cópia em Markdown para este repositório via API do GitHub.

Como celular e notebook acessam o **mesmo servidor**, as entradas aparecem
sincronizadas nos dois — não é preciso exportar/importar nada.

## Rodando localmente (para testar)

```bash
cd server
npm install
cp .env.example .env
# edite o .env e defina pelo menos DIARY_PASSWORD
npm start
```

Abra `http://localhost:3000` no navegador.

Sem preencher as variáveis `GITHUB_*`, o app funciona normalmente e avisa na
tela que o backup no GitHub está desativado — ele nunca trava por causa disso.

## Colocando no ar para usar no celular e no notebook

Para acessar do celular, o servidor precisa estar hospedado em algum lugar
com endereço público (rodar só na sua máquina não é visível pelo celular).
A forma mais simples e gratuita é o [Render](https://render.com):

1. Crie uma conta no Render e escolha **New → Web Service**, conectando este
   repositório do GitHub.
2. Configure:
   - **Root Directory:** `diario/server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. Em **Environment**, adicione as variáveis (veja `server/.env.example`):
   - `DIARY_PASSWORD` — a senha que você vai usar para entrar
   - `JWT_SECRET` — qualquer texto longo e aleatório
   - `GITHUB_TOKEN` — um token do GitHub (veja abaixo)
   - `GITHUB_OWNER` — `quellemnascimento-collab`
   - `GITHUB_REPO` — `mielpaper`
   - `GITHUB_BRANCH` — `main`
4. Adicione um **Persistent Disk** apontando para `/opt/render/project/src/diario/server/data`
   (assim as entradas não se perdem quando o serviço reiniciar).
5. Ao concluir o deploy, o Render dá uma URL pública (ex:
   `https://seu-diario.onrender.com`). Abra essa URL no celular e no
   notebook — é o mesmo endereço nos dois.
6. No celular, abra a URL no navegador e use "Adicionar à tela de início"
   (Chrome/Safari) para que o diário vire um ícone de app.

### Gerando o token do GitHub para o backup

1. Acesse GitHub → **Settings → Developer settings → Fine-grained tokens →
   Generate new token**.
2. Restrinja o token só ao repositório `mielpaper`.
3. Em **Repository permissions**, dê acesso de **Contents: Read and write**.
4. Copie o token gerado e cole na variável `GITHUB_TOKEN`.

Guarde esse token como um segredo — nunca o coloque direto no código ou em
commits (o `.gitignore` já protege o arquivo `.env` local).

## Backups no GitHub

Cada dia gera/atualiza um arquivo em `diario/backups/AAAA-MM-DD.md` neste
repositório. Como cada salvamento é um commit, para ver o que mudou em uma
entrada específica basta olhar o histórico de commits desse arquivo no
GitHub.
