# Health Plus — Não-conformidades LGPD

**Data do diagnóstico**: 2026-11-07
**Última atualização**: 2026-11-07 — C4, C5, C6 e C7 corrigidos
**Escopo**: `Api/` (Express + MySQL), `app/` (Expo/React Native), `Api/database/schema.sql`
**Método**: leitura do código, do schema e das telas.
**Cenário**: B — sistema já escrito, auditado e retrofitado.

## Situação

| | Gaps | Estado |
|---|---|---|
| Crítico | C1, C2, C3 | abertos |
| Crítico | C4, C5, C6, C7 | **corrigidos em 2026-11-07** |
| Alto | A1 a A8 | abertos |
| Médio | M1 a M8 | abertos |

As 12 rotas que não exigiam autenticação passaram a exigir token de
nutricionista, e o profissional dono dos dados sai do token — nunca mais do
corpo da requisição nem do id na URL. Verificado com a API no ar: as 12
devolvem 401 sem token; as 7 que têm o alvo no caminho devolvem 403 para
token de outra conta; e um POST com `idProfissional` de outra conta no corpo
não cria nada para ela.

## Por que a régua aqui é a mais alta

O Health Plus trata **dado pessoal sensível** — "dado referente à saúde" (Art. 5º, II da LGPD):
peso, altura, perímetro braquial, dobras cutâneas, escore-z, classificação nutricional.

E trata esse dado **de crianças e adolescentes**: os padrões de referência são as curvas da
OMS de 0–5 e 5–19 anos (`padrao_crescimento`, `referencia_oms`), e o cadastro exige nome de
responsável para menores de 18 (`Api/storage/pacienteStorage.js:270`).

Pelo Art. 4º da Res. CD/ANPD nº 2/2022, dado sensível + menores é critério específico de
**alto risco**. Isso tem três consequências diretas:
- a dispensa de Encarregado formal para agentes de pequeno porte (Art. 11 da mesma Res.) **não se aplica**;
- o prazo de comunicação de incidente é 3 dias úteis, não 6 (Res. 15/2024, Art. 6º);
- RIPD é esperado (Art. 38 da LGPD).

Exposição: Art. 52, II — multa de até 2% do faturamento no Brasil, limite de R$ 50 milhões
por infração.

---

## CRÍTICO

### C1 — Dados de saúde trafegam sem criptografia

`Api/server.js:48` sobe HTTP puro em `0.0.0.0`. `app/.env.example` instrui
`EXPO_PUBLIC_API_URL=http://`. Não há TLS em nenhuma ponta.

Em texto claro na rede Wi-Fi: o token JWT (8h de validade), a senha digitada no login, a
ficha do paciente e a avaliação antropométrica.

> Art. 46 — medidas de segurança aptas a proteger dados pessoais de acessos não autorizados.
> Art. 6º, VII — princípio da segurança.

Agravante: a tela de privacidade afirma ao titular **"Conexão criptografada (HTTPS)"**
(`app/pages/Termos/index.js:24`). É declaração falsa — Art. 6º, VI (transparência) e Art. 9º.

### C2 — O sistema fabrica o consentimento do paciente

`Api/repository/pacienteRepository.js:298-330` grava, dentro de uma transação, duas linhas em
`consentimento_paciente` com `st_aceito = 1` fixo no código — `'termos_privacidade'` e
`'tratamento_dados_saude'` — **no primeiro login que dá certo**. O paciente não vê tela
nenhuma, não marca nada, não é perguntado.

Quem declara ter informado é o nutricionista, por uma caixa de seleção na tela de cadastro:
"Informei ao paciente (ou ao responsável) como os dados dele serão usados"
(`app/pages/CadastroPaciente/index.js:433-439`). O comentário do código assume isso:
"o consentimento é registrado no banco quando ele entra pela primeira vez (...) e quem
informa é o nutricionista".

> Art. 8º, §1º — consentimento por escrito ou por outro meio que demonstre manifestação de vontade.
> Art. 8º, §4º — consentimento específico e destacado para finalidades determinadas.
> Art. 11, I — dado sensível exige consentimento **específico e destacado**.

Entrar no aplicativo é conduta, não manifestação de vontade. Consentimento tácito não existe
na LGPD. Pior que não ter o registro: o registro afirma um consentimento que não houve — o que
transforma a prova de accountability (Art. 37) em prova contra o controlador.

Há ainda um problema de modelagem: a mesma linha serve para o titular adulto e para a
criança, e `tp_consentimento` não distingue consentimento do titular de consentimento do
responsável legal.

### C3 — A senha do paciente é a data de nascimento dele

`Api/servicos/senhaTemporaria.js` — `senhaDaDataNascimento()` devolve `DDMMAAAA`. O
`conviteEmail.js:34` escreve a regra no e-mail: "Senha: a sua data de nascimento, só os
números (DDMMAAAA)".

O próprio arquivo reconhece o trade-off ("a senha é previsível para quem souber a data de
nascimento do paciente"), mas a mitigação prevista não fecha o buraco: a troca é **opcional**
(`pacienteRepository.js:197` — "A troca de senha passou a ser opcional, em Perfil > Alterar
senha"). Contas permanecem indefinidamente com ela.

Quem souber o e-mail e a data de nascimento de uma criança — o que inclui a família, a escola,
qualquer pessoa com acesso à ficha em papel — entra na conta e lê o histórico de saúde dela.
E sem saber a data: 8 dígitos num intervalo de 100 anos são ~36.500 combinações válidas. Com
A4 (nenhum rate limit), é força bruta de minutos.

> Art. 46; Art. 6º, VII e VIII (segurança e prevenção).

### C4 — As 6 rotas de notificação não exigiam autenticação  ✅ CORRIGIDO

> **Corrigido em 2026-11-07.** As 6 rotas ganharam `autenticar`. O
> `profissionalDaSessao()` lê o id do token e exige que o `:idProfissional`
> da URL bata com ele (403 se divergir). No `POST /`, o `idProfissional` do
> corpo é ignorado: o aviso nasce para quem está logado — antes qualquer um
> injetava aviso na central de outra pessoa, e o aviso dispara e-mail para
> quem tem "Resumo por e-mail" ligado. No app, `Api/notificacoes.js` e
> `contexto/NotificacoesContexto.js` passaram a mandar o token.

`Api/storage/notificacaoStorage.js` — nenhuma das 6 rotas usava `autenticar`, e todas recebiam
`:idProfissional` pela URL:

| Rota | O que um estranho faz |
|---|---|
| `GET /api/notificacao/:idProfissional` | lê os avisos de qualquer nutricionista (título e mensagem citam pacientes e consultas) |
| `GET /api/notificacao/:idProfissional/preferencias` | lê as preferências de qualquer conta |
| `PUT /api/notificacao/:idProfissional/preferencias` | reescreve as preferências de qualquer conta |
| `PUT /api/notificacao/:idProfissional/todas-lidas` | marca tudo como lido |
| `PUT /api/notificacao/:idProfissional/:idNotificacao/lida` | idem, por item |
| `POST /api/notificacao/` | injeta aviso em qualquer conta |

`:idProfissional` é um inteiro sequencial. Enumerar de 1 em diante varre a base.

> Art. 46; Art. 6º, VII.

### C5 — As 4 rotas de plano alimentar não exigiam autenticação  ✅ CORRIGIDO

> **Corrigido em 2026-11-07.** As 4 ganharam `autenticar`, e o
> `idProfissional` passou a sair do token em todas — inclusive no corpo do
> POST e do PUT, e no `:idProfissional` do GET, que agora precisa bater com
> o token. Com isso as checagens que o `planoRepository` já fazia
> (`garantirPlanoDoProfissional`, e o `WHERE id_profissional = ?` do
> paciente) passaram a valer de verdade: antes bastava mandar outro
> `idProfissional` no corpo para contorná-las.
>
> **Fica em aberto a decisão de produto**: o aplicativo não chama nenhuma
> destas 4 rotas — as telas de plano alimentar saíram do produto —, mas as
> rotas e as tabelas continuam de pé, com dado de paciente dentro. Fechá-las
> foi o mínimo; apagá-las, com as tabelas `plano_alimentar`,
> `plano_refeicao` e `plano_alimento`, é o que a minimização pede (Art. 6º,
> III) e depende de você.

`Api/storage/planoStorage.js:52,67,77,92`. `GET /api/plano/profissional/:idProfissional`
devolvia os planos — que são prescrição nutricional, dado de saúde — de qualquer profissional,
sem token. `PUT /:idPlano` e `PATCH /:idPlano/status` alteravam plano alheio.

### C6 — Cadastro de paciente aberto na rede  ✅ CORRIGIDO

> **Corrigido em 2026-11-07.** A rota exige `autenticar`, e o paciente nasce
> na lista de quem está logado: `idProfissional` sai do token e o campo do
> corpo é ignorado. No app, `cadastrarPaciente()` recebe o token e recusa a
> chamada sem ele.
>
> Verificado com a API no ar: um POST com `idProfissional` de outra conta no
> corpo e token de um terceiro **não criou nenhum paciente** para a conta
> apontada no corpo.

`Api/storage/pacienteStorage.js:249` — `POST /api/paciente/cadastro` sem `autenticar`, e o
`idProfissional` vinha **do corpo da requisição**.

Qualquer um que alcance a API cria fichas de paciente — nome, data de nascimento, sexo,
endereço, CEP, responsável — penduradas em qualquer nutricionista. E o cadastro abre uma conta
`usuario_paciente` cuja senha é a data de nascimento que o próprio invasor escolheu.

Tratamento de dado pessoal sem base legal (Art. 7º/Art. 11) e sem controle de integridade
(Art. 6º, V — qualidade dos dados).

### C7 — Alteração de cadastro profissional sem autenticação  ✅ CORRIGIDO

> **Corrigido em 2026-11-07.** A rota exige `autenticar` e só aceita editar
> a própria conta: `:id` diferente do id do token devolve 403. No app,
> `atualizarNutricionista()` leva o token, que a tela de Perfil já tinha.

`Api/storage/profissionalStorage.js:199` — `PUT /api/profissional/:id` sem token e sem
confirmação de senha. Reescrevia nome, CRN e telefone de qualquer nutricionista.

Trocar o CRN exibido de um profissional de saúde é alteração de dado com efeito regulatório
sobre terceiros.

> Art. 6º, V (qualidade e exatidão); Art. 46.

---

## ALTO

### A1 — Encarregado não designado

`app/pages/Termos/index.js:25` publica ao titular: "Fale com o encarregado:
**privacidade@exemplo.com**". É domínio de exemplo reservado (RFC 2606) — ninguém lê essa caixa.

Não há designação, não há nome, não há canal real.

> Art. 41 — designação e divulgação da identidade e do contato.
> Res. CD/ANPD nº 18/2024 — divulgação obrigatória, em destaque; pode ser pessoa natural ou jurídica; não exige certificação; vedado conflito de interesse.

A dispensa do Art. 11 da Res. 2/2022 não socorre aqui: ela vale para pequeno porte de **baixo**
risco, e este tratamento é de alto risco pelo Art. 4º.

### A2 — Direitos do titular prometidos e não implementados

A tela promete: "Você pode acessar, corrigir, exportar ou excluir seus dados e revogar o
consentimento a qualquer momento" (`Termos/index.js:23`). Confrontando com as rotas existentes:

| Direito (Art. 18) | Situação |
|---|---|
| II — acesso | parcial: `GET /api/paciente/minha-evolucao` mostra a evolução, não a ficha inteira |
| III — correção | ausente para o paciente (só o nutricionista edita) |
| V — portabilidade | **ausente** — não existe rota de exportação |
| VI — eliminação | ausente para o titular; só o nutricionista apaga (`DELETE /api/paciente/:id`) |
| IX — revogação do consentimento | **ausente** — `consentimento_paciente.dt_revogacao` existe na tabela e nunca é escrita por nenhuma linha de código |

> Art. 18; Art. 8º, §5º (revogação a qualquer momento, por procedimento gratuito e facilitado).
> Art. 19, II — **15 dias** para resposta completa.

Promessa não cumprida é agravante: deixa de ser só omissão e passa a ser informação enganosa
ao titular (Art. 6º, VI).

### A3 — Não existe registro de acesso

A tela afirma duas vezes que existe: "Todo acesso fica registrado" (`Termos/index.js:22`) e
"registro de auditoria dos acessos às fichas" (`:24`).

Não há tabela de log no `schema.sql`, nem código que grave acesso. Nenhuma leitura de ficha de
paciente deixa rastro.

> Art. 37 — registro das operações de tratamento.
> Art. 46 — medidas aptas a proteger de acessos não autorizados.
> Art. 48 — sem log não há como saber que houve incidente, quem foi afetado, nem comunicar em 3 dias úteis (Res. 15/2024, Art. 6º).

### A4 — Nenhum rate limit, nenhum bloqueio por tentativas

`Api/package.json` não traz `express-rate-limit` nem equivalente; nada no código conta
tentativas. Quatro superfícies ficam abertas:

- `POST /api/paciente/login` — senha de 8 dígitos previsível (ver C3)
- `POST /api/profissional/login`
- `POST /api/senha/esqueci` — enumeração de e-mails cadastrados
- `PUT /api/senha/:id` — **sem sessão**, e devolve 401 só quando `senhaAtual` erra: é um oráculo de senha por id (`senhaStorage.js:232-272`)

> Art. 46.

### A5 — Sem política de retenção e sem expurgo

Nada no sistema apaga nada por decurso de prazo. Acumulam indefinidamente: `consulta`
cancelada, `assinatura` cancelada, `cobranca`, `notificacao` lida, `token_senha` e
`token_senha_paciente` já usados ou expirados, `avaliacao` de paciente que saiu do
acompanhamento.

> Art. 15 — término do tratamento (fim da finalidade, do período, revogação).
> Art. 16 — eliminação após o término.
> Art. 6º, III — necessidade: mínimo necessário para a finalidade.

### A6 — Colunas de dado sensível desativadas, com dado dentro

O próprio `Api/database/schema.sql:71-87` documenta: `nr_telefone`,
`nr_telefone_responsavel`, `ds_objetivo_consulta`, `ds_restricoes_alimentares`, `ds_alergias`,
`ds_condicoes_saude`, `ds_medicamentos` **não são mais preenchidas**, e o `DROP COLUMN` ficou
para um migration futuro "porque quem já tem banco montado tem dado gravado nelas".

Alergia, condição de saúde e medicamento são dado sensível (Art. 5º, II). Guardado sem
finalidade atual, é tratamento sem base legal.

O comentário do schema já aponta a saída certa ("apagar é o mais provável, justamente pela
LGPD") — falta executá-la.

> Art. 6º, I (finalidade) e III (necessidade); Art. 15, I; Art. 16.

### A7 — Transferência internacional sem instrumento

`Api/.env` configura SMTP do Gmail. Todo e-mail da API — convite de acesso do paciente,
redefinição de senha, aviso de consulta — passa pela infraestrutura da Google LLC, nos EUA,
levando nome e e-mail do paciente e o contexto clínico ("sua consulta é amanhã").

Não há DPA com a Google, não há registro da transferência, não há hipótese do Art. 33 declarada.

> Art. 33 — 9 hipóteses de transferência internacional.
> Res. CD/ANPD nº 19/2024 — Cláusulas-Padrão Contratuais brasileiras, de adoção **integral e sem alteração**. O prazo de adequação de contratos encerrou em agosto de 2025.
> Art. 39 — a Google é operadora; falta o contrato que a vincule às instruções do controlador.

### A8 — Menores sem consentimento parental e sem vinculação a responsável

`Api/storage/pacienteStorage.js:270` exige `nomeResponsavel` quando a idade calculada é menor
de 18. É o único reconhecimento do tema no código. O que falta:

- nada registra o consentimento **do responsável** (a linha em `consentimento_paciente` é gravada em nome do paciente, pelo primeiro login dele — ver C2);
- a conta `usuario_paciente` do menor é criada igual à de um adulto, sem vínculo com o responsável;
- a idade vem de uma data digitada pelo nutricionista, sem verificação.

> Art. 14 — tratamento de dados de crianças e adolescentes no seu melhor interesse.
> Art. 14, §1º — para **crianças** (até 12 anos incompletos), consentimento **específico e destacado** de um dos pais ou do responsável legal.
> Art. 14, §6º — informação sobre o tratamento em linguagem acessível ao menor.

E a partir de **17 de março de 2026** entra a Lei nº 15.211/2025 (ECA Digital):
> Art. 24 — vinculação da conta a responsável legal para usuários **até 16 anos**.
> Art. 9º, §1º — verificação confiável de idade, **vedada a autodeclaração**.
> Art. 35, II — multa de até 10% do faturamento do grupo no Brasil, limite de R$ 50 milhões por infração.

Vale registrar que o eixo (ii) do Mapa de Temas Prioritários 2026–2027 da ANPD
(Res. 30/2025) é exatamente crianças e adolescentes no ambiente digital.

---

## MÉDIO

### M1 — CORS liberado para qualquer origem
`Api/server.js:9` — `app.use(cors())` sem opção `origin`. Qualquer site aberto no navegador da
vítima chama a API. Como a maioria das rotas sensíveis exige Bearer token (não cookie), o
estrago imediato é limitado — mas as rotas de C4/C5/C6/C7 não exigem nada. Art. 46.

### M2 — Sem `helmet` e sem cabeçalhos de segurança
Nenhum `X-Content-Type-Options`, `Strict-Transport-Security`, `X-Frame-Options`. Art. 46.

### M3 — Token de sessão em AsyncStorage
`app/contexto/AuthContext.js:40,55` grava a sessão (JWT de 8h) com `AsyncStorage`, que é
armazenamento em texto claro. O lugar certo é `expo-secure-store` (Keychain/Keystore). Art. 46.

### M4 — Senha provisória e código de redefinição impressos no terminal
`Api/servicos/email.js:41-49` — com `SMTP_PASSWORD` vazia, a API imprime o corpo inteiro do
e-mail no stdout, incluindo o código de redefinição. É deliberado e documentado, e funciona
para desenvolvimento; em produção vai para o log do servidor, que raramente tem o mesmo
controle de acesso do banco. Art. 46.

### M5 — Inquéritos populacionais sem base legal e sem anonimização
`inquerito` e `inquerito_paciente` agrupam pacientes identificados em estudos, com instituição
e responsável. Nenhuma base legal declarada, nenhuma anonimização.
> Art. 7º, IV e Art. 11, II, "c" — estudo por órgão de pesquisa, **garantida, sempre que possível, a anonimização**.
> Art. 5º, XI — definição de anonimização.

### M6 — Sem ROPA (Art. 37) e sem RIPD (Art. 38)
Não existe registro das operações de tratamento, nem relatório de impacto. Pelo Art. 4º da
Res. 2/2022 este tratamento é de alto risco (dado sensível + menores), o que torna o RIPD
exigível. A Fase 1 da Agenda Regulatória 2025–2026 (Res. 31/2025) inclui RIPD.

### M7 — A política de privacidade é um rascunho, e se declara como tal
`app/pages/Termos/index.js` abre com "(texto ilustrativo)" e fecha, na tela que o titular lê,
com "Texto ilustrativo, sujeito à revisão jurídica". Faltam elementos do Art. 9º:
identidade e contato do controlador, base legal de cada finalidade, prazo de retenção,
operadores com quem há compartilhamento, transferência internacional. Não há versionamento
nem data — mas `consentimento_paciente.ds_versao_termos` grava `'v1'`, apontando para um texto
que não tem versão.

### M8 — A exclusão apaga a prova do consentimento
`Api/repository/pacienteRepository.js:698` — `excluirPaciente` roda
`DELETE FROM consentimento_paciente`. Eliminar o dado do titular está certo (Art. 18, VI);
levar embora o único registro de que houve consentimento deixa o controlador sem prova
nenhuma. O caminho usual é guardar o registro mínimo da manifestação (id pseudonimizado, tipo,
versão, datas) fora da ficha. Art. 37.

---

## O que já está em conformidade

Vale registrar, porque é o que não se deve quebrar ao corrigir o resto:

- **Senhas em bcrypt com cost 12**, nunca em texto claro (`senhaStorage.js`, `profissionalStorage.js`).
- **Tokens de redefinição guardados em hash SHA-256**, validade de 30 minutos, uso único (`token_senha`, `token_senha_paciente`); o schema documenta a escolha. Quem lê o banco não redefine senha de ninguém.
- **Rotas de paciente sem IDOR**: `GET /`, `GET /:id`, `GET /:id/evolucao` e `DELETE /:id` filtram por `id_profissional` dentro da própria query (`obterPacientePorIdEProfissional`), e o comentário em `pacienteStorage.js:140` mostra que a checagem foi deliberada.
- **Exclusão do paciente bem feita**: transação, checagem de vínculo, e os DELETEs em ordem de dependência, incluindo avaliações, medidas, resultados, consultas, planos, consentimentos e inquéritos (`pacienteRepository.js:655-710`). Art. 18, VI atendido — pela mão do nutricionista.
- **Dado real fora do Git**: `.gitignore` cobre `Dump*/`, `__MACOSX/` e `.env`; confirmado com `git ls-files` que só os `.env.example` estão versionados. O `schema.sql` carrega estrutura, sem dado de paciente nem hash.
- **Minimização aplicada por decisão própria**: o telefone do paciente deixou de ser coletado, e o comentário do schema diz por quê — "guardar dado pessoal sem uso é exposição de graça pela LGPD".
- **O e-mail de convite não revela a data de nascimento**, só a regra de formação da senha — `conviteEmail.js:8` explica a escolha. (Não resolve C3, mas evita somar um vazamento a ele.)
- **Separação de sessões por tipo**: o token de primeiro acesso não passa no `autenticarPaciente`, e o middleware do profissional recusa token de paciente.
- **Existe tabela de consentimento** com tipo, versão e `dt_revogacao` — a modelagem está no caminho certo; o problema é como ela é preenchida (C2) e que a revogação nunca é usada (A2).

---

## Ordem de correção sugerida

Primeiro o que fecha porta aberta, depois o que exige decisão de produto, por último o papel.

1. ~~**C4, C5, C6, C7** — pôr `autenticar` nas 12 rotas e tirar `idProfissional` do corpo/URL, lendo de `req.usuario`.~~ **Feito em 2026-11-07.**
2. **A4** — `express-rate-limit` nos 4 pontos de autenticação, e exigir sessão em `PUT /api/senha/:id`, que hoje confere a senha atual mas não pede token: é um oráculo de senha por id, e é a única rota de escrita que continua aberta.
3. **C1** — TLS. Em desenvolvimento, ao menos parar de afirmar HTTPS na tela.
4. **C3** — senha provisória aleatória de uso único, com troca obrigatória no primeiro login.
5. **C2 + A8** — tela de consentimento de verdade, para o titular e para o responsável legal, com registro do que foi aceito e em que versão.
6. **A3** — tabela de log de acesso à ficha, e gravação em cada leitura.
7. **A2** — endpoints de exportação, correção e revogação; prazo de 15 dias.
8. **A6, A5** — migration que apaga as colunas sensíveis desativadas; rotina de expurgo.
9. **A1** — designar Encarregado e publicar contato real.
10. **A7** — Cláusulas-Padrão da Res. 19/2024 para o provedor de e-mail, ou SMTP no Brasil.
11. **M7, M6** — política de privacidade com os 7 elementos do Art. 9º, ROPA e RIPD.

## Ressalva

Este é um diagnóstico técnico, feito a partir do código. Não é parecer jurídico. A definição
da base legal de cada finalidade, o texto da política de privacidade, a designação do
Encarregado e a decisão sobre o RIPD devem passar por advogado especializado em proteção de
dados antes de o produto receber paciente real.
