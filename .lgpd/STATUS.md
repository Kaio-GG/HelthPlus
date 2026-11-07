# LGPD Audit Status

**Projeto**: Health Plus
**Cenário**: B — Legacy retrofit (sistema já escrito, auditado antes de receber paciente real)
**Início**: 2026-11-07
**Última atualização**: 2026-11-07
**Encarregado**: pendente designação (ver gap A1)

## Classificação de risco

Alto risco pelo Art. 4º da Res. CD/ANPD nº 2/2022: dado pessoal sensível de saúde
(Art. 5º, II) de crianças e adolescentes. Consequências práticas:

- a dispensa de Encarregado formal do Art. 11 da Res. 2/2022 **não se aplica**;
- incidente notificável em **3 dias úteis**, não 6 (Res. 15/2024, Art. 6º);
- **RIPD exigível** (Art. 38 da LGPD);
- a partir de **17/03/2026**, Lei 15.211/2025 (ECA Digital) incide sobre o acesso de menores.

## Pipeline atual (B — Legacy retrofit)

- [x] L0 — Setup `.lgpd/`
- [x] L1 — Gap analysis  →  `.lgpd/gaps.md`
- [ ] L2 — `lgpd-data-mapping` — ROPA reverso, a partir do código
- [ ] L3 — `lgpd-legal-basis` — base legal por atividade (Art. 7º / Art. 11)
- [ ] L4 — `lgpd-vendor-audit` — operadores ativos + DPAs (provedor de e-mail)
- [ ] L5 — `lgpd-retention-erasure` — retenção e expurgo
- [ ] L6 — `lgpd-anonymization` — inquéritos populacionais
- [ ] L7 — `lgpd-dsar` — endpoints de acesso, correção, exportação e revogação
- [ ] L8 — `lgpd-incident-response` — runbook
- [ ] L9 — `lgpd-privacy-policy` — política com os elementos do Art. 9º  ⏸ CHECKPOINT
- [ ] L10 — `lgpd-eca-digital-minors` — aplicável (pacientes pediátricos)
- [ ] L11 — `lgpd-ripd` — alto risco  ⏸ CHECKPOINT
- [ ] L12 — `lgpd-dpo-encarregado` — designação e publicação
- [ ] L13 — Plano de remediação priorizado

## Artefatos gerados

- `.lgpd/gaps.md` — v2, 2026-11-07 — 23 não-conformidades, 4 corrigidas

## Gaps

Lista completa, com citação de artigo e caminho de arquivo, em `.lgpd/gaps.md`.

| Severidade | Abertos | Corrigidos | Resumo dos que seguem abertos |
|---|---|---|---|
| Crítico | 3 | 4 | HTTP sem TLS (C1); consentimento gravado pelo sistema (C2); senha = data de nascimento (C3) |
| Alto | 8 | 0 | Encarregado ausente; direitos do titular não implementados; sem log de acesso; sem rate limit; sem retenção; colunas sensíveis órfãs; transferência internacional sem instrumento; menores sem consentimento parental |
| Médio | 8 | 0 | CORS aberto; sem helmet; token em AsyncStorage; segredo em stdout; inquéritos sem base legal; sem ROPA/RIPD; política ilustrativa; exclusão apaga prova do consentimento |

### Corrigidos em 2026-11-07

C4, C5, C6 e C7 — as 12 rotas que não exigiam autenticação. Todas passaram a
exigir token de nutricionista, e o profissional dono dos dados sai do token,
não mais do corpo da requisição nem do id na URL.

Arquivos: `Api/storage/notificacaoStorage.js`, `planoStorage.js`,
`pacienteStorage.js` e `profissionalStorage.js`; no app,
`Api/notificacoes.js`, `Api/Pacientes.js`, `Api/loginCadastro.js`,
`contexto/NotificacoesContexto.js`, e as telas `CadastroPaciente`,
`NovaConsulta` e `Perfil`.

Verificado com a API no ar: as 12 devolvem 401 sem token; as 7 que têm o
alvo no caminho devolvem 403 para token de outra conta; e um POST com
`idProfissional` alheio no corpo não cria nada para aquela conta.

Fica em aberto uma decisão de produto registrada em C5: o aplicativo não
chama nenhuma das 4 rotas de plano alimentar — as telas saíram do produto —,
mas as rotas e as tabelas continuam de pé, com dado de paciente dentro.
Apagá-las é o que a minimização pede (Art. 6º, III).

## Próximo passo

A4 — `express-rate-limit` nos quatro pontos de autenticação, e exigir sessão
em `PUT /api/senha/:id`. É a última rota de escrita sem token: ela confere a
senha atual, mas sem sessão e sem limite de tentativas funciona como oráculo
de senha por id — e a senha do paciente tem 8 dígitos previsíveis (C3).

Depois dela, a ordem do `gaps.md` segue em C1 (TLS) e C2/A8 (consentimento
de verdade, do titular e do responsável legal).

## Ressalva

Diagnóstico técnico a partir do código. Não é parecer jurídico. Base legal, texto da política,
designação do Encarregado e decisão sobre o RIPD pedem advogado especializado em proteção de
dados antes de o produto receber paciente real.
