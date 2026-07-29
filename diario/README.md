# Meu Diário

Diário pessoal simples: abre, escreve, salva sozinho. Funciona no celular e no
notebook com as mesmas entradas nos dois (o texto fica guardado em um servidor
central), e a cada edição envia por e-mail uma cópia de texto do dia para
você mesma — assim você sempre tem um backup fora do servidor, acessível de
qualquer lugar.

## Como funciona

- **Um servidor** (pasta `server/`) guarda as entradas em um banco SQLite e
  serve o app pelo navegador.
- **Um app web** (pasta `public/`) — sem instalação de loja de aplicativos —
  que dá pra "adicionar à tela inicial" no celular e abre como um app normal.
- **Login por senha única**, só para você. Não tem cadastro de usuários.
- **Backup automático por e-mail**: enquanto você escreve, o texto é salvo
  no servidor a cada pausa. Para não encher sua caixa de entrada a cada
  letra digitada, o e-mail de backup é enviado no máximo a cada alguns
  minutos durante uma sessão contínua de escrita — e sempre, na hora, quando
  você sai da entrada, troca de dia, fecha o app ou clica em "Sair".

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

Sem preencher as variáveis `EMAIL_*`, o app funciona normalmente e avisa na
tela que o backup por e-mail está desativado — ele nunca trava por causa
disso.

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
   - `EMAIL_USER` — o e-mail que vai enviar o backup (ex: sua conta do Gmail)
   - `EMAIL_PASS` — a senha de app do Gmail (veja abaixo)
   - `EMAIL_TO` — para onde o backup deve chegar (pode deixar em branco para
     mandar para o próprio `EMAIL_USER`)
4. Adicione um **Persistent Disk** apontando para
   `/opt/render/project/src/diario/server/data` (assim as entradas não se
   perdem quando o serviço reiniciar).
5. Ao concluir o deploy, o Render dá uma URL pública (ex:
   `https://seu-diario.onrender.com`). Abra essa URL no celular e no
   notebook — é o mesmo endereço nos dois.
6. No celular, abra a URL no navegador e use "Adicionar à tela de início"
   (Chrome/Safari) para que o diário vire um ícone de app.

### Gerando a senha de app do Gmail (para o backup funcionar)

O Gmail não aceita mais a senha normal da conta para enviar e-mail por
aplicativos externos — é preciso gerar uma "senha de app":

1. Ative a verificação em duas etapas na sua conta Google, se ainda não
   tiver (obrigatório para gerar senha de app).
2. Acesse [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
3. Crie uma senha de app (pode chamar de "Diário"), copie o código gerado.
4. Cole esse código na variável `EMAIL_PASS`. Use o e-mail da conta em
   `EMAIL_USER`.

Guarde essa senha de app como um segredo — nunca a coloque direto no código
ou em commits (o `.gitignore` já protege o arquivo `.env` local). Se preferir
não usar Gmail, qualquer provedor de SMTP funciona: ajuste `EMAIL_HOST`,
`EMAIL_PORT` e `EMAIL_SECURE` conforme as instruções do provedor.

## Ajustando a frequência do backup

Por padrão, enquanto você digita sem parar, o backup por e-mail é enviado no
máximo a cada 5 minutos (variável `EMAIL_BACKUP_MIN_INTERVAL_MINUTES`).
Pode diminuir esse número se quiser e-mails mais frequentes, mas lembre que
toda vez que você sai da entrada, troca de dia ou fecha o app, o backup
daquela edição é enviado imediatamente, independente desse intervalo.
