# Health Plus

Aplicativo de acompanhamento nutricional. O nutricionista cadastra pacientes,
monta planos alimentares, registra avaliações antropométricas (padrão OMS) e
acompanha a agenda de consultas. O paciente acessa o próprio plano e registra
água e refeições.

- `app/` — aplicativo (React Native + Expo)
- `Api/` — API (Node + Express + MySQL)

## Antes de começar

Você precisa de:

- **Node.js 18 ou superior**
- **MySQL** rodando na sua máquina
- O aplicativo **Expo Go** no celular, ou um emulador Android/iOS

O celular e o computador precisam estar **na mesma rede Wi-Fi**.

## 1. Banco de dados

Crie as tabelas rodando o script. Ele pode ser executado mais de uma vez
sem dar erro:

```bash
mysql -u root -p -e "source Api/database/schema.sql"
```

Isso cria o banco `helthplus` (sem o "a", foi assim que ele nasceu) com as
24 tabelas do projeto.

> **Já tem o banco de antes? Rode o script de novo.** Ele é idempotente:
> só `CREATE TABLE IF NOT EXISTS`, não apaga nem altera o que já está lá.
> As tabelas criadas depois do dump original (logo abaixo) só aparecem no
> seu banco depois disso.

> **No Windows**, o `mysql` normalmente não está no PATH, e o PowerShell
> não aceita o operador `<` — por isso o `-e "source ..."` acima, no lugar
> do `< arquivo.sql` que se vê por aí. Use assim, ajustando a versão:
>
> ```bash
> & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p -e "source Api/database/schema.sql"
> ```
>
> **Mais simples ainda:** abra o `schema.sql` no MySQL Workbench em
> **File → Open SQL Script** e execute no raio ⚡. Sem terminal e sem
> caminho de arquivo.

> `Api/database/schema.sql` é a fonte da verdade do banco. Se uma query nova
> precisar de uma coluna ou tabela, acrescente no arquivo **no mesmo commit** —
> senão o banco de quem baixar o código não vai bater com o código.

### Tabelas criadas depois do dump original

O banco que nasceu do `Dump20261021/` tem 14 tabelas. As 10 de baixo vieram
depois, uma a cada funcionalidade nova, e **só existem no seu banco depois
que você roda o `schema.sql` de novo**. Sem elas a tela abre normalmente e a
API responde erro 500 (`ER_NO_SUCH_TABLE`) na hora de usar.

| Tabela | Para que serve | O que não funciona sem ela |
|---|---|---|
| `token_senha` | Códigos de redefinição de senha do nutricionista | "Esqueci minha senha" |
| `token_senha_paciente` | O mesmo, para a conta do paciente | "Esqueci minha senha" do paciente |
| `notificacao` | Avisos do sino | O sino e a tela de notificações |
| `preferencia_notificacao` | Quais avisos a pessoa quer receber, inclusive por e-mail | As preferências e o aviso por e-mail |
| `consentimento_paciente` | Aceite dos termos, gravado no primeiro login do paciente | O primeiro login do paciente |
| `plano_alimentar` | O plano do paciente (função REMOVIDA do aplicativo) | Nada — as telas de plano alimentar saíram |
| `plano_refeicao` | As refeições de cada plano (REMOVIDA) | Nada |
| `plano_alimento` | Os alimentos de cada refeição (REMOVIDA) | Nada |
| `assinatura` | O plano pago do nutricionista | Assinar, trocar e cancelar plano — e o plano some ao sair da conta |
| `cobranca` | Histórico de cobranças da assinatura | "Ver histórico de cobranças", no Perfil |
| `consulta` | As consultas marcadas (do paciente cadastrado ou avulso) | **Marcar consulta**, a Agenda, as consultas na ficha do paciente e na área dele |
| `log_auditoria` | Quem acessou o quê, quando e de onde (LGPD) | **Login**, a ficha, tudo — a API registra cada acesso e avisa no terminal se a tabela faltar |
| `solicitacao_titular` | Pedidos LGPD do paciente (cópia, correção, exclusão) | "Meus dados e privacidade" do paciente e "Privacidade e auditoria" do nutricionista |

Além das tabelas, o `schema.sql` passou a PREENCHER dois catálogos que
estavam vazios, `tipo_medida` e `indicador`. Sem eles não há como gravar
uma avaliação: `medida_antropometrica` e `resultado_avaliacao` têm chave
estrangeira para os dois.

E `resultado_avaliacao` ganhou a coluna `ds_tom` ('adequado', 'atencao' ou
'risco'). Coluna nova numa tabela que já existe **não** entra pelo
`CREATE TABLE IF NOT EXISTS` — por isso há um bloco de `ALTER` no fim do
`schema.sql`, que acrescenta a coluna só quando ela falta. Rodar o
`schema.sql` de novo resolve; é só isso que precisa ser feito.

Para saber o que falta no **seu** banco sem conferir na mão, rode isto no
Workbench (ou em qualquer cliente MySQL):

```sql
SELECT esperadas.nome AS tabela_que_falta
  FROM (
    SELECT 'token_senha' AS nome
    UNION ALL SELECT 'token_senha_paciente'
    UNION ALL SELECT 'notificacao'
    UNION ALL SELECT 'preferencia_notificacao'
    UNION ALL SELECT 'consentimento_paciente'
    UNION ALL SELECT 'plano_alimentar'
    UNION ALL SELECT 'plano_refeicao'
    UNION ALL SELECT 'plano_alimento'
    UNION ALL SELECT 'assinatura'
    UNION ALL SELECT 'cobranca'
    UNION ALL SELECT 'consulta'
    UNION ALL SELECT 'log_auditoria'
    UNION ALL SELECT 'solicitacao_titular'
  ) esperadas
  LEFT JOIN information_schema.tables t
    ON t.table_schema = 'helthplus'
   AND t.table_name = esperadas.nome
 WHERE t.table_name IS NULL;
```

Nenhuma linha = está tudo lá. Qualquer linha que aparecer = rode o
`schema.sql` de novo; ele cria só o que falta.

### Usuário do banco (recomendado)

Em vez de usar o `root` no `.env`, crie um usuário só para o projeto. Rode
isto conectado ao MySQL, trocando a senha:

```sql
CREATE USER 'helthplus'@'localhost' IDENTIFIED BY 'escolha_uma_senha';
GRANT ALL PRIVILEGES ON helthplus.* TO 'helthplus'@'localhost';
FLUSH PRIVILEGES;
```

Assim o `Api/.env` não carrega a senha do `root`, e se ela vazar o estrago
fica limitado a este banco.
## 2. API

```bash
cd Api
npm install
cp .env.example .env
```

Abra o `.env` e preencha o usuário e a senha do seu MySQL. Depois:

```bash
npm run dev
```

A API sobe em `http://localhost:3000`. Para conferir, abra esse endereço no
navegador: deve aparecer `{"mensagem":"API HelthPlus funcionando!"}`.

> **O `JWT_SECRET` é obrigatório e precisa ter 32 caracteres ou mais.** Sem
> ele a API nem sobe — e diz no terminal como gerar um. Antes ela subia e
> só quebrava no primeiro login.

Para rodar os testes de segurança (não precisam do MySQL):

```bash
npm test
```

### E-mail

Os e-mails do projeto (convite do paciente, redefinição de senha, convite
para testar o app — a lista completa está em
[E-mails que a API envia](#e-mails-que-a-api-envia)) saem todos pelas
mesmas variáveis do `Api/.env`.

**Sem configurar nada, tudo continua testável.** Com o `SMTP_PASSWORD` em
branco a API **não envia**: ela imprime a mensagem inteira no próprio
terminal — com o código de redefinição e com a senha provisória do
paciente — e o aplicativo avisa na tela que o e-mail só foi para o
terminal. É só copiar de lá.

Para enviar **de verdade**, o `Api/.env` fica assim:

```ini
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=health.plus.brazil@gmail.com
SMTP_PASSWORD=                 # <- a senha de app, 16 letras, sem espaços
SMTP_REMETENTE=Health Plus <health.plus.brazil@gmail.com>

LINK_TESTE_APP=                # <- link de instalação do convite de teste
```

A conta de envio do projeto é a **health.plus.brazil@gmail.com**. O que
falta é só o `SMTP_PASSWORD`, e **a senha normal da conta não serve**: o
Gmail recusa senha de conta em programas desde 2022. É preciso uma *senha
de app*. Logado nessa conta:

1. **myaccount.google.com/security** → ligue a **Verificação em duas
   etapas** (sem ela o Google nem mostra a opção de senha de app);
2. **myaccount.google.com/apppasswords** → nome `Health Plus API` → **Criar**;
3. copie as **16 letras**, cole em `SMTP_PASSWORD=` tudo junto, sem espaços,
   e reinicie a API (`Ctrl+C` e `npm run dev`).

Para conferir que pegou: peça um "esqueci minha senha" no aplicativo. Se o
e-mail chegar na caixa, está valendo; se aparecer no terminal da API, a
senha ainda não foi aceita.

O `LINK_TESTE_APP` é o endereço de instalação que vai no convite enviado em
**Perfil → Convidar alguém para testar**. Enquanto o app não estiver na Play
Store é o link do Expo ou do APK — ele muda a cada rodada de teste, por isso
fica no `.env` e não no código. Em branco, essa rota recusa o envio e diz o
motivo na tela.

> A senha de app vale para a conta inteira: quem a tiver no `.env` envia
> e-mail em nome do projeto. Ela fica **só** no `Api/.env`, que não vai para
> o Git. Não cole a senha em commit, print ou mensagem.


## 3. Aplicativo

Descubra o IP da sua máquina na rede Wi-Fi. No Windows:

```bash
ipconfig
```

Procure o **Endereço IPv4** do adaptador Wi-Fi (algo como `192.168.0.15`).

```bash
cd app
npm install
npx expo install expo-secure-store expo-print expo-sharing
cp .env.example .env
```

O `expo-print` e o `expo-sharing` geram e compartilham o relatório em PDF do
paciente. O `expo-secure-store` guarda o login no cofre do celular (Keychain/Keystore)
em vez de texto claro. Sem ele o app funciona, mas avisa no terminal do Expo
que a sessão está sem criptografia.

Abra o `.env` e troque o IP pelo seu:

```
EXPO_PUBLIC_API_URL=http://SEU_IP_AQUI:3000
```

> Não use `localhost` aqui. Para o celular, `localhost` é o próprio celular —
> ele não acha o seu computador.

Depois:

```bash
npx expo start
```

Leia o QR Code com o Expo Go.

## Rotas da API

| Método | Rota | O que faz |
|---|---|---|
| `GET` | `/` | Teste de conexão |
| `POST` | `/api/profissional/cadastro` | Cadastra nutricionista |
| `POST` | `/api/profissional/login` | Login do nutricionista |
| `PUT` | `/api/profissional/:id` | Atualiza nome, CRN e telefone |
| `POST` | `/api/paciente/cadastro` | Cadastra paciente (do nutricionista logado) |
| `GET` | `/api/paciente` | Lista os pacientes do nutricionista logado |
| `GET` | `/api/paciente/:id` | A ficha de um paciente |
| `DELETE` | `/api/paciente/:id` | Apaga o paciente e tudo o que está pendurado nele |
| `GET` | `/api/paciente/:id/evolucao` | Avaliações do paciente, lidas pelo nutricionista |
| `POST` | `/api/paciente/login` | Login do paciente. No primeiro acesso devolve só um token de primeiro acesso |
| `POST` | `/api/paciente/primeiro-acesso` | Aceite dos termos (paciente ou responsável) e troca da senha provisória |
| `GET` | `/api/paciente/minha-evolucao` | As avaliações do próprio paciente (token dele) |
| `PUT` | `/api/paciente/senha` | Paciente troca a própria senha (token dele) |
| `POST` | `/api/paciente/encerrar-sessoes` | Paciente sai de todos os aparelhos |
| `POST` | `/api/profissional/encerrar-sessoes` | Nutricionista sai de todos os aparelhos |
| `POST` | `/api/avaliacao` | Grava uma avaliação na ficha do paciente |
| `POST` | `/api/consulta` | Marca uma consulta |
| `GET` | `/api/consulta?de=&ate=` | A agenda do nutricionista |
| `PATCH` | `/api/consulta/:id/status` | `pendente`, `confirmada`, `cancelada` ou `realizada` |
| `GET` | `/api/consulta/minhas` | As consultas do próprio paciente (token dele) |
| `PATCH` | `/api/consulta/:id/confirmar` | Paciente confirma a presença |
| `POST` | `/api/senha/esqueci` | Gera o código e envia o e-mail de redefinição |
| `POST` | `/api/senha/redefinir` | Troca a senha usando o código do e-mail |
| `PUT` | `/api/senha` | Nutricionista troca a senha (token + senha atual). `/api/senha/:id` continua aceito, com o mesmo id do token |
| `GET` | `/api/notificacao/:id` | Lista as notificações e quantas não foram lidas |
| `POST` | `/api/notificacao` | Cria uma notificação |
| `PUT` | `/api/notificacao/:id/:idNotificacao/lida` | Marca uma como lida |
| `PUT` | `/api/notificacao/:id/todas-lidas` | Marca todas como lidas |
| `GET` | `/api/notificacao/:id/preferencias` | Lê as preferências de notificação |
| `PUT` | `/api/notificacao/:id/preferencias` | Salva as preferências |
| `GET` | `/api/assinatura` | Plano pago atual, cobranças e nº de pacientes |
| `PUT` | `/api/assinatura` | Assina ou troca de plano (`{ planoId }`) |
| `DELETE` | `/api/assinatura` | Cancela a assinatura |
| `POST` | `/api/convite/reenviar/:idPaciente` | Manda o e-mail que avisa o paciente do acesso |
| `POST` | `/api/convite/testador` | Convida alguém para testar o aplicativo |
| `GET` | `/api/lgpd/paciente/meus-dados` | Cópia completa dos dados do paciente (JSON) |
| `GET` | `/api/lgpd/paciente/consentimentos` | Aceites vigentes e históricos |
| `POST` | `/api/lgpd/paciente/consentimentos/revogar` | Revoga o consentimento (`{ confirmar: true }`) |
| `GET` | `/api/lgpd/paciente/acessos` | Quem acessou os dados do paciente |
| `GET`/`POST` | `/api/lgpd/paciente/solicitacoes` | Pedidos LGPD do paciente ao nutricionista |
| `GET` | `/api/lgpd/profissional/meus-dados` | Cópia dos dados da conta do nutricionista |
| `GET` | `/api/lgpd/profissional/atividade` | Registro de auditoria das ações do nutricionista |
| `GET` | `/api/lgpd/profissional/solicitacoes` | Pedidos dos pacientes |
| `PATCH` | `/api/lgpd/profissional/solicitacoes/:id` | Responde um pedido (`em_andamento`, `atendida`, `recusada`) |
| `GET` | `/api/lgpd/profissional/pacientes/:id/exportar` | Cópia dos dados de um paciente |
| `GET` | `/api/lgpd/profissional/pacientes/:id/acessos` | Quem acessou a ficha do paciente |
| `GET` | `/api/lgpd/profissional/pacientes/:id/consentimentos` | Aceites do paciente |

> As rotas de senha ficam em `/api/senha`, e não em `/api/profissional/senha`,
> porque o `PUT /api/profissional/:id` capturaria esse caminho antes.

> As rotas de planos ALIMENTARES (`/api/plano`) **saíram do ar**: nenhuma
> tela as usava, e rota sem uso com dado de saúde é só superfície de ataque.
> O código continua em `Api/storage/planoStorage.js`; para religar, há uma
> linha comentada no `server.js`.

> O id de quem está logado sai sempre do TOKEN, nunca da URL nem do corpo
> da requisição. Em `/api/avaliacao`, por exemplo, o `idProfissional` do
> corpo é ignorado: senão bastaria trocar o número para gravar na ficha do
> paciente de outro nutricionista.

> As rotas do PACIENTE (`/api/paciente/minha-evolucao`, `/api/paciente/senha`,
> `/api/consulta/minhas`, `/api/consulta/:id/confirmar`) pedem o token da
> sessão DELE, e não o do nutricionista. Um token não serve no lugar do
> outro: eles carregam `tipo: 'paciente'` ou `tipo: 'profissional'`.

### E-mails que a API envia

Todos usam as variáveis `SMTP_*` do `Api/.env`. Com elas em branco, a API
**não** envia: imprime a mensagem no terminal dela (com o código de
redefinição e a senha provisória), e o aplicativo avisa na tela que o
e-mail só foi para o terminal — os fluxos continuam testáveis.

| Quando | Para quem |
|---|---|
| Cadastro do paciente com aviso, e o botão da ficha | Paciente (diz que a senha é a data de nascimento dele) |
| "Esqueci minha senha" | Nutricionista ou paciente (código de redefinição) |
| Senha alterada | Nutricionista |
| Cadastro do nutricionista | Nutricionista (boas-vindas) |
| Aviso do sino, para quem ligou "Avisos por e-mail" | Nutricionista |
| Perfil > Convidar alguém para testar | Quem vai testar (link do `LINK_TESTE_APP`) |

No Gmail a senha da conta não funciona: é preciso ligar a Verificação em
duas etapas e gerar uma **senha de app** de 16 letras em
myaccount.google.com/apppasswords.

## Segurança, LGPD e auditoria

O Health Plus trata **dado de saúde de crianças e adolescentes** — o caso
de risco mais alto da LGPD. O diagnóstico completo, item por item, está em
`.lgpd/gaps.md`. O que o código faz hoje:

**Autenticação e sessão**

- Toda rota com dado exige token, e o dono dos dados sai **do token**, nunca
  da URL nem do corpo. A troca de senha por `PUT /api/senha/:id`, que era
  aberta, passou a exigir token.
- Os tokens são JWT HS256 com emissor fixo (token `alg: none` ou assinado
  com outro segredo é recusado). Cada token leva a *versão da sessão* da
  conta: trocar a senha, redefinir pelo e-mail ou tocar em **Sair de todos
  os aparelhos** derruba os tokens antigos na hora.
- Limite de tentativas por IP e por e-mail no login, no "esqueci a senha",
  na redefinição e nos envios de e-mail; bloqueio de 15 minutos da conta
  depois de 5 senhas erradas. Login sem conta demora o mesmo que com conta.
- No app, a sessão fica no cofre do sistema (`expo-secure-store`), e um
  `401` da API leva de volta à tela inicial com o aviso "Sessão encerrada".

**Servidor**

- Cabeçalhos de segurança (`nosniff`, `X-Frame-Options`, CSP, `no-store`),
  sem `X-Powered-By`, corpo limitado a 100 KB, erros sempre em JSON e sem
  stack trace.
- CORS fechado: só as origens de navegador em `CORS_ORIGENS`. O app no
  celular não é afetado.
- Validação de tudo o que entra: data de nascimento real e no passado,
  medidas dentro da faixa física possível, textos cortados no tamanho da
  coluna (antes viravam erro 500).
- HTTPS: com `TLS_CERTIFICADO` e `TLS_CHAVE` a API sobe em HTTPS; atrás de
  um proxy, use `CONFIAR_PROXY=1`. **Sem HTTPS, não receba paciente real.**
  A tela de privacidade só diz "conexão criptografada" quando o endereço da
  API no app é `https://`.

**Auditoria (`log_auditoria`)**

- Cada login (inclusive os recusados), ficha aberta, evolução lida,
  avaliação, consulta, exportação, aceite, revogação e tentativa de acesso
  negada vira uma linha, com quem, quando, IP e aparelho — **sem** nome nem
  dado de saúde. E-mail de quem errou o login entra como pseudônimo (HMAC).
- As linhas são encadeadas por SHA-256, como um livro-caixa. Para conferir
  se alguém editou ou apagou uma linha direto no banco:

  ```bash
  cd Api
  npm run auditoria:verificar
  ```

- O paciente vê quem acessou os dados dele (**Perfil > Meus dados e
  privacidade > Ver quem acessou**); o nutricionista vê o mesmo na ficha, e
  o registro das próprias ações em **Perfil > Privacidade e auditoria**.
- Ao apagar um paciente, a ficha some, mas o log guarda o resumo dos aceites
  (tipo, versão, datas) — a prova de que houve base legal.

**Direitos do titular (LGPD, Art. 18)**

| Direito | Onde |
|---|---|
| Acesso e portabilidade | Paciente: *Baixar uma cópia dos meus dados*. Nutricionista: *Exportar dados do paciente*, na ficha |
| Correção, exclusão, informação, oposição | Paciente: *Fazer um pedido* (prazo de 15 dias). Nutricionista responde em *Privacidade e auditoria > Pedidos* |
| Revogação do consentimento | Paciente: *Revogar meu consentimento* |
| Saber quem acessou | Paciente e nutricionista: *Histórico de acessos* |

**Retenção (expurgo automático)**

Uma vez por dia a API apaga o que passou do prazo: códigos de senha vencidos
(7 dias), notificações lidas (180 dias), telefone de consulta avulsa já
passada (90 dias), pedidos LGPD concluídos e log de auditoria (5 anos). Os
prazos estão no `Api/.env` (`RETENCAO_*`). A ficha e as avaliações **não**
são apagadas por prazo: isso é decisão clínica e jurídica do nutricionista.

**Recomendado no banco de produção:** o usuário da API sem permissão de
`UPDATE` na tabela de auditoria:

```sql
REVOKE UPDATE ON helthplus.log_auditoria FROM 'helthplus'@'localhost';
```

**O que o código não resolve sozinho** (decisões para a equipe e um
advogado de proteção de dados): designar o encarregado e preencher o
`EXPO_PUBLIC_CONTATO_PRIVACIDADE`; revisar o texto de `app/pages/Termos`;
contrato com o provedor de e-mail (transferência internacional, se for o
Gmail); o RIPD; e rodar a migração `001_minimizacao_lgpd.sql`.

## Acessibilidade

- **Perfil > Acessibilidade** (e também na tela inicial, antes do login):
  tamanho do texto em três níveis, alto contraste e reduzir animações. O
  tamanho de letra do celular continua valendo por cima.
- A paleta padrão foi ajustada para passar de 4,5:1 de contraste (WCAG AA):
  o verde dos botões com texto branco estava em 3,6:1 e o texto dos
  placeholders em 2,6:1. A de alto contraste passa de 7:1.
- TalkBack/VoiceOver: botões, abas, caixas de seleção, campos (com o erro
  lido junto), calendário, diálogos e barras de progresso têm papel, rótulo
  e estado. Os gráficos são descritos em palavras ("Gráfico com 4 medições,
  de 12/03 a 10/09. Última: 23,4 kg..."), e os ícones decorativos ficam
  escondidos do leitor.
- O "Reduzir animações" do celular é respeitado automaticamente.

Para quem mexe no código: componente novo que é tocável precisa de
`accessibilityRole` e `accessibilityLabel`; texto de erro, de
`accessibilityLiveRegion="polite"`; e cor nova, de contraste conferido
(4,5:1) — veja o comentário no topo de `app/tema/index.js`.

## Como o projeto é organizado

Telas em `app/pages/<NomeDaTela>/`, componentes em `app/componentes/<Nome>/`,
cada um com `index.js` (código) e `style.js` (estilo, exportando `estilos`).
Nomes de variáveis, funções, textos e comentários **em português**.

Detalhes das telas: [app/TELAS.md](app/TELAS.md).
Regras para quem usa assistente de código: [app/AGENTS.md](app/AGENTS.md).

## O que é da sua máquina (e por isso quebra na do colega)

Boa parte do projeto **não está no Git**, de propósito: ou é segredo, ou é
diferente em cada computador. Quando algo "funciona aqui e não lá", é quase
sempre um item desta lista. Ela vale nos dois sentidos — ao clonar o
projeto, e ao mandar uma funcionalidade nova para a equipe.

### 1. O banco é de cada um

Cada pessoa cria o `helthplus` na própria máquina, e o Git **não** carrega
banco nenhum. Então:

- **Tabela nova = ninguém mais tem.** Toda funcionalidade que precisa de
  tabela ou coluna nova só funciona no computador de quem rodou o
  `schema.sql` depois da mudança. É o erro mais comum aqui: a tela abre, o
  botão responde, e a API devolve 500 com `ER_NO_SUCH_TABLE`. A lista das
  tabelas que vieram depois do dump, e a consulta que mostra o que falta
  no seu banco, estão em
  [Tabelas criadas depois do dump original](#tabelas-criadas-depois-do-dump-original).
- **Quem muda uma query, atualiza o `Api/database/schema.sql` no mesmo
  commit.** Esse arquivo é a única fonte da verdade do banco; quem baixa o
  código roda ele de novo e fica em dia.
- **O `schema.sql` cria tabela, mas não acrescenta coluna.** Ele é todo
  `CREATE TABLE IF NOT EXISTS`: se a tabela já existe com o formato antigo,
  rodar de novo não muda nada. Coluna nova em tabela que já existe precisa
  de um `ALTER TABLE` avisado para a equipe.
- **Os ids não batem entre as máquinas.** O paciente 3 aqui não é o
  paciente 3 lá. Nunca escreva um id fixo no código nem em teste.
- **Os dados são seus.** Contas, pacientes e planos que você cadastrou não
  existem para ninguém mais. O dump em `Dump20261021/` não entra no Git
  (tem hash de senha e dado de paciente).
- **MySQL 8.** O schema usa `utf8mb4_0900_ai_ci`, que o 5.7 não conhece.
- **O banco chama `helthplus`**, sem o "a". Com outro nome no `DB_NAME`, a
  API sobe e só falha nas consultas (`ER_BAD_DB_ERROR`).

### 2. Os dois arquivos `.env`

Nenhum dos dois vai para o Git (estão no `.gitignore`). Cada um copia o
`.env.example` do lado e preenche:

| Arquivo | Variável | Por que é de cada máquina | Sem ela |
|---|---|---|---|
| `Api/.env` | `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | A senha do MySQL é de cada instalação | `ER_ACCESS_DENIED_ERROR` ao subir a API |
| `Api/.env` | `PORT` | Só muda se a 3000 estiver ocupada | — |
| `Api/.env` | `JWT_SECRET` | É um segredo, gerado por quem instala | Login responde "Erro interno ao realizar login" |
| `Api/.env` | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_REMETENTE` | A senha de app do Gmail é segredo | A API não envia e-mail: imprime no terminal dela |
| `Api/.env` | `LINK_TESTE_APP` | Muda a cada rodada de teste | O convite para testar recusa o envio |
| `Api/.env` | `VERSAO_TERMOS`, `CORS_ORIGENS`, `TLS_*`, `RETENCAO_*`, `BLOQUEIO_*` | Segurança e LGPD (ver *Segurança, LGPD e auditoria*) | Valores padrão seguros |
| `app/.env` | `EXPO_PUBLIC_VERSAO_TERMOS`, `EXPO_PUBLIC_CONTATO_PRIVACIDADE` | Versão dos termos e canal de privacidade mostrados ao titular | A tela orienta a pedir pelo próprio app |
| `app/.env` | `EXPO_PUBLIC_API_URL` | É o IP da **sua** máquina na rede Wi-Fi | "Network Error" em toda tela do aplicativo |

Dois detalhes que pegam gente desprevenida:

- O `EXPO_PUBLIC_API_URL` **muda sozinho**: o roteador entrega o IP por
  DHCP e ele troca depois de um reinício. O sintoma ("não consigo criar
  conta") não aponta para o `.env`. Rode `ipconfig`, confira, e recarregue
  o aplicativo no celular.
- Quem **não** tiver a senha de app no `SMTP_PASSWORD` continua
  desenvolvendo normalmente: o e-mail aparece no terminal da API, com o
  código e a senha provisória. Não é bug.

### 3. O resto

- **`npm install` em duas pastas**, `Api/` e `app/`. Cada uma tem o seu
  `package-lock.json`; o `node_modules` não vai para o Git.
- **Maiúsculas e minúsculas nos nomes de arquivo.** O Windows não
  diferencia `conviteStorage.js` de `ConviteStorage.js`; o Linux e o macOS
  diferenciam. Um `require` com a letra trocada funciona aqui e quebra lá
  (e no servidor). Se renomear um arquivo só na caixa, use
  `git mv -f nome.js Nome.js`, senão o Git não enxerga a troca.
- **A pasta sincronizada.** O projeto está dentro do OneDrive, e o
  sincronizador tranca arquivos de `node_modules` enquanto o Metro lê —
  daí os erros estranhos do Expo. Veja *Problemas comuns*.
- **O Firewall do Windows** bloqueia a porta 3000 na primeira vez. O
  celular só alcança a API depois de liberar.

## Problemas comuns

### Não consigo logar: comece pela mensagem na tela

Desde 7/11/2026 a mensagem de erro **diz qual é a causa**, e ela é o
diagnóstico mais rápido. O tratamento está em `app/Api/erros.js`, usado por
todos os clientes de API.

| A tela diz | O que é | O que fazer |
|---|---|---|
| "Sem resposta da API em `http://...`" | a requisição não chegou: API desligada, IP errado no `app/.env`, celular em outra rede | compare o endereço mostrado com o IP real (passo 3 abaixo) — é o caso mais comum |
| "A API em `http://...` não respondeu em 10 segundos" | alguém escutou mas travou; costuma ser MySQL fora do ar | passo 2, e olhe o terminal da API |
| "E-mail ou senha inválidos." | a API respondeu: as credenciais não batem | use "Esqueci minha senha" |
| "Esta conta está desativada." | a API respondeu: `st_ativo = 0` no banco | reative a conta |
| algo com "(HTTP 500 — o erro completo está no terminal da API.)" | defeito no servidor, não erro seu | leia o stack no terminal da API |

Se a mensagem citar um endereço, **confira esse endereço**: é nele que o app
tentou falar. Em 7/11/2026 o roteador trocou o IP da máquina de `.104` para
`.101` no meio do dia, e o app continuou batendo no `.104`. A mensagem antiga
dizia só "Não foi possível realizar o login", que parece senha errada — e não
era.

### O diagnóstico em 4 passos

Se a mensagem não bastar: a causa mais comum é **a API não estar rodando**.

O modelo mental que resolve a maioria dos casos: a API é um programa que fica
rodando num terminal aberto. Fechar o terminal, dar Ctrl+C, reiniciar o
computador, ou o Windows matar o processo — qualquer um desses derruba a API.
Ela não volta sozinha. O aplicativo no celular, sem a API, não tem com quem
conversar: toda tela que precisa do servidor falha, e o login é a primeira
delas.

Rode os passos na ordem. Pare no primeiro que falhar.

**Passo 1 — a API está no ar?**

```bash
curl.exe -s http://localhost:3000/
```

Resposta esperada: `{"mensagem":"API HelthPlus funcionando!"}`

Se não vier nada, ou vier erro de conexão, a API está desligada. Suba ela e
**deixe esse terminal aberto**:

```bash
cd Api; npm run dev
```

**Passo 2 — o MySQL está no ar?**

```bash
Get-Service MySQL* | Select-Object Name, Status
```

Tem de dizer `Running`. Se disser `Stopped`, suba (precisa de PowerShell como
administrador):

```bash
Start-Service MySQL80
```

Sintoma típico de MySQL parado: a API sobe sem reclamar, mas todo login
devolve erro 500, e o terminal dela mostra `ECONNREFUSED`.

**Passo 3 — o IP do `app/.env` é o desta máquina?**

```bash
(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -ne '127.0.0.1' }).IPAddress
```

Compare com o que está em `app/.env`, na linha `EXPO_PUBLIC_API_URL`. O
roteador entrega esse IP por DHCP e **ele muda depois de reiniciar**. Se
mudou, corrija o `app/.env` e recarregue o app no celular (sacuda o aparelho,
toque em *Reload*).

Atenção: entre os IPs listados pode aparecer um `192.168.56.x`, que é de
adaptador virtual (VirtualBox) e **não serve** — o celular não o alcança. Use
o da sua rede Wi-Fi ou Ethernet, normalmente `192.168.0.x` ou `192.168.1.x`.

**Passo 4 — a rota de login responde?**

```bash
try { Invoke-RestMethod -Uri http://localhost:3000/api/profissional/login -Method Post -ContentType 'application/json' -Body '{"email":"nao-existe@teste.com","senha":"errada"}' } catch { "HTTP " + $_.Exception.Response.StatusCode.value__ }
```

- **`HTTP 401`** — ótimo, é o esperado. A rota funciona de ponta a ponta:
  alcançou o banco, comparou a senha e recusou. O problema não está na API —
  está no celular (veja os itens de rede abaixo), ou a senha está errada
  mesmo.
- **`HTTP 500`** — a API está no ar mas quebrou por dentro. Olhe o terminal
  dela: a mensagem de erro aparece lá. As duas causas mais comuns são
  `JWT_SECRET` vazio no `Api/.env` e MySQL fora do ar.

**O terminal da API é o melhor amigo aqui.** Deixe-o visível e tente logar
pelo celular: toda requisição que chega e todo erro aparecem nele. Se você
tenta logar e **nada** aparece no terminal, a requisição não chegou — é
problema de rede (passo 3, Firewall, ou aparelhos em redes diferentes), e não
da API.

### Outros problemas

**"Network Error" ao fazer login no celular**
A API precisa estar rodando (`npm run dev` dentro de `Api/`), o IP do
`app/.env` precisa ser o da sua máquina, e os dois aparelhos precisam estar
na mesma rede. O Firewall do Windows costuma bloquear a porta 3000 na
primeira vez — libere quando ele perguntar.

**Mudei o `app/.env` e nada mudou**

Reinicie a CLI do Expo. Esta entrada dizia o contrário, e estava errada.

O motivo está na primeira linha que o `npx expo start` imprime:

```
env: load .env
env: export EXPO_PUBLIC_API_URL
```

A CLI lê o `.env` **uma vez, ao iniciar**, e embute o valor no bundle que
serve. Um Metro que já estava rodando continua com o valor antigo na
memória, por mais vezes que você recarregue o aplicativo — o celular pede
bundle novo e recebe o mesmo valor velho.

A documentação do Expo diz que recarregar basta e que não é preciso
reiniciar a CLI, mas isso vale para edições de **código**. Para o `.env`:

1. Pare a CLI (Ctrl+C no terminal dela).
2. Confira que a porta 8081 ficou livre — um Metro órfão de uma sessão
   anterior continua servindo o bundle antigo, e o `expo start` seguinte
   sobe em 8082 sem avisar que o celular ainda fala com o 8081:

   ```bash
   netstat -ano | Select-String ":8081.*LISTENING"
   ```

   Se aparecer algo, encerre pelo PID da última coluna:

   ```bash
   Stop-Process -Id <PID> -Force
   ```

3. Suba de novo com `npx expo start` e recarregue o aplicativo.

Foi exatamente isso em 7/11/2026: o `.env` já estava certo em `.101`, mas um
Metro órfão segurava a 8081 com `.104`, e a tela seguia mostrando o endereço
antigo.

**Erro 500 ao abrir no celular, ou `Cannot read properties of undefined (reading 'exists')`**
O mapa de arquivos do Metro ficou corrompido. Pare o servidor (Ctrl+C) e
suba limpando o cache:

```bash
npx expo start -c
```

Isso acontece com mais frequência quando o projeto está dentro de uma pasta
sincronizada (OneDrive, Google Drive, Dropbox): o sincronizador tranca
arquivos de `node_modules` enquanto o Metro os lê. Se repetir muito, mova o
projeto para fora da pasta sincronizada, por exemplo `C:\dev\HelthPlus`.

**`ConfigError: The expected package.json path ... does not exist`**
Você rodou o `npx expo start` na pasta errada. Ele precisa rodar dentro de
`app/`, não na raiz do repositório:

```bash
cd app
npx expo start
```

**`ER_ACCESS_DENIED_ERROR` ao subir a API**
Usuário ou senha do MySQL errados no `Api/.env`.

**`ER_NO_SUCH_TABLE`** ou **`ER_BAD_DB_ERROR`**
Você ainda não rodou o `schema.sql` do passo 1 **depois da última
funcionalidade nova**, ou o `DB_NAME` do `Api/.env` não é `helthplus`.
A consulta em [Tabelas criadas depois do dump
original](#tabelas-criadas-depois-do-dump-original) mostra o que falta no
seu banco.

**O e-mail não chega, mas aparece no terminal da API**
Não é bug: o `SMTP_PASSWORD` do `Api/.env` está vazio. Veja
[E-mail](#e-mail).

## Estado atual

Funcionando de ponta a ponta, gravando no banco:

- cadastro e login do nutricionista, com sessão que sobrevive a fechar o app;
- cadastro, listagem, ficha e exclusão de paciente;
- login do paciente, e a troca de senha dele dentro do aplicativo;
- a calculadora da OMS, com a avaliação **salva na ficha** (tabelas
  `avaliacao`, `medida_antropometrica` e `resultado_avaliacao`);
- a evolução do paciente, lida pelos dois lados a partir das mesmas
  avaliações: aba Evolução na ficha e "Minha evolução" na área do paciente;
- as consultas: marcar, listar na agenda, aparecer na ficha do paciente e na
  área dele, o paciente confirmar a presença e o nutricionista mudar o
  status (tabela `consulta`);
- edição do perfil, troca de senha do nutricionista (pelo perfil e por
  e-mail), a central de notificações com as preferências, e a assinatura do
  plano pago com o histórico de cobranças;
- o primeiro acesso do paciente, com o aceite dos termos dado por ele (ou
  pelo responsável, se for menor) e a troca obrigatória da senha provisória;
- os direitos do titular pela LGPD: cópia dos dados, histórico de acessos,
  pedidos ao nutricionista com prazo de 15 dias, revogação do consentimento;
- o registro de auditoria encadeado por hash, e o expurgo automático dos
  dados vencidos;
- as preferências de acessibilidade (texto maior, alto contraste, menos
  animação) e o suporte a TalkBack/VoiceOver.

A contagem de pacientes do plano ("2 de 10") sai da mesma lista que a tela
de pacientes, lida do banco.

O que NÃO está ligado ao banco, de propósito: a tela "Saúde e dicas" do
paciente e o checklist "Como foi o seu dia" dela. O conteúdo é texto fixo
(`app/dados/conteudoSaude.js`) e o checklist não é gravado em lugar nenhum —
a própria tela diz isso a quem usa.

A assinatura grava o plano e a cobrança, mas **não há cobrança de verdade**:
não existe gateway de pagamento ligado.

### Funções removidas do produto

Saíram do aplicativo e **não voltam** sem decisão da equipe:

| O que saiu | Por quê |
|---|---|
| Planos alimentares (criar, listar, "Meu plano") | Decisão de produto |
| Registro de água e de refeições pelo paciente | Decisão de produto |
| Tela de "primeiro acesso" do nutricionista | O nutricionista cria a conta dele na aba ao lado do login. (A do **paciente** voltou em 2026-11-07, para o aceite dos termos — ver *A senha do paciente*.) |
| Etapa 3 do cadastro de paciente (objetivo, restrições, alergias, doenças, medicamentos) | Existia para alimentar os planos alimentares |
| Telefone do paciente e do responsável | Não era usado em lugar nenhum, e dado pessoal sem uso é exposição de graça pela LGPD |
| Registro de água e de refeições, e o checklist "Como foi o seu dia" | Decisão de produto |

As rotas de `/api/plano` saíram do ar. As tabelas `plano_*` e as colunas de
saúde que o cadastro não pede mais continuam no banco de quem já tinha dado
gravado; para apagar de vez, há a migração
`Api/database/migracoes/001_minimizacao_lgpd.sql` (destrutiva — leia o
cabeçalho dela e faça backup antes).

### A senha do paciente

O paciente **não escolhe** e-mail nem senha: quem cria a conta dele é o
nutricionista. A senha do primeiro acesso é a **data de nascimento** dele,
em oito dígitos e nada mais: quem nasceu em 12 de março de 2001 digita
`12032001`. Sem barras, sem traços, sem espaços — `12/03/2001` **não**
entra.

A regra é só-dígitos de propósito. Uma senha que aceita várias formas de
escrever obriga o nutricionista a explicar qual delas vale, e era a
pergunta que mais aparecia na consulta. Oito números é uma instrução só.

Assim o nutricionista libera o acesso na própria consulta, sem depender de
o e-mail chegar. Em troca, a senha é previsível para quem souber a data de
nascimento — família, escola, quem viu a ficha em papel —, e por isso **ela
só serve uma vez**:

- ela fica guardada em **hash** (bcrypt), nunca em texto, e o e-mail de
  aviso **não** carrega senha nenhuma — ele só diz qual é;
- o login com ela **não** entra no aplicativo: devolve um token de primeiro
  acesso (15 minutos) que não lê dado nenhum, e o app abre a tela
  **Primeiro acesso**. Ali o paciente — ou o pai, mãe ou responsável, se
  for menor de 18 — lê o resumo de como os dados são usados, **marca** os
  dois aceites (termos e dados de saúde) e **cria uma senha forte**. Só
  então a API entrega o token normal;
- o aceite é gravado em `consentimento_paciente` com quem aceitou
  (`titular` ou `responsavel`), o nome e a versão dos termos. Antes ele era
  gravado sozinho no primeiro login, sem o paciente ver tela nenhuma — e
  consentimento tácito não existe na LGPD. As linhas antigas continuam no
  banco como histórico, mas não contam: quem só tem elas aceita de novo;
- mudou a versão dos termos (`VERSAO_TERMOS`), todo paciente aceita de novo
  no próximo login;
- 5 senhas erradas seguidas bloqueiam a conta por 15 minutos, e o limite
  por IP segura a força bruta nas ~36 mil datas possíveis.

Onde isso mora no código: `Api/servicos/senhaTemporaria.js` (forma a senha),
`Api/storage/pacienteStorage.js` (rotas `/login` e `/primeiro-acesso`),
`Api/repository/pacienteRepository.js` e `app/pages/PrimeiroAcessoPaciente`.

### Tabelas da OMS

As curvas em `app/utilitarios/oms/dados/` são as **oficiais**, convertidas
das planilhas publicadas pela OMS:

- **0–5 anos** — WHO Child Growth Standards 2006
- **5–19 anos** — WHO Growth Reference 2007

Cada curva tem um ponto por mês (ou por centímetro, em peso/estatura).
A conversão foi conferida reconstruindo, a partir de L, M e S, os 10.234
valores de desvio-padrão que a própria OMS publica — todos dentro da
precisão com que ela os divulga.

Dois detalhes de modelagem que seguem a orientação da OMS:

- **Estatura aos 24 meses:** abaixo disso vale o comprimento deitado;
  a partir dos 24 meses, a estatura em pé (os dois diferem ~0,7 cm).
- **Peso/estatura aos 87 cm:** abaixo, comprimento deitado; acima,
  estatura em pé.

Todos os indicadores da OMS têm tabela: peso por idade (0 a 10 anos, que é
onde a OMS para), comprimento/estatura por idade, IMC por idade, peso por
comprimento e por estatura, perímetro cefálico, perímetro braquial e as
dobras cutâneas tricipital e subescapular.

A conversão foi conferida de duas formas:

- contra as tabelas mensais publicadas pela OMS (L, M e S iguais, casa por casa);
- contra o conjunto de teste oficial do WHO AnthroPlus (933 casos): os
  escores-z de estatura, peso e IMC por idade saem **idênticos** aos que a
  OMS publica, e as marcações de medida implausível batem em todos os casos.

> ⚠️ Ainda pendente: a tabela de alimentos (`app/dados/alimentosTaco.js`)
> tem só 14 itens aproximados — troque pela TACO oficial antes de uso real.

> O banco tem a tabela `referencia_oms` para guardar essas curvas, mas ela
> está vazia: a calculadora lê os JSON do aplicativo, e funciona assim. Migrar
> para o banco só compensa se a equipe quiser editar as curvas sem publicar
> uma versão nova do aplicativo.
