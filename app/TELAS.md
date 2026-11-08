# Telas do Health Plus

Padrão do projeto: cada tela fica em `pages/<NomeDaTela>/` com **`index.js`** (código) e **`style.js`** (estilo, exportando `estilos`).
Componentes reutilizáveis ficam em `componentes/<Nome>/` com o mesmo padrão. Textos, variáveis, funções e comentários em português.

## Entrada e acesso

| Tela | Rota (`App.js`) | Pasta |
|---|---|---|
| Abertura (escolher o perfil) | `Inicio` | `pages/inicialHome` |
| Login nutricionista (Entrar / Criar conta) | `Nutricionista` | `pages/Nutricionista` |
| Login paciente | `Paciente` | `pages/Paciente` |
| Esqueci a senha | `EsqueciSenha` | `pages/EsqueciSenha` |
| Verificação de e-mail | `VerificacaoEmail` | `pages/VerificacaoEmail` |
| Redefinir senha (com o código do e-mail) | `RedefinirSenha` | `pages/RedefinirSenha` |
| Primeiro acesso do paciente (aceite LGPD + senha própria) | `PrimeiroAcessoPaciente` | `pages/PrimeiroAcessoPaciente` |
| Acessibilidade (texto, contraste, animações) | `Acessibilidade` | `pages/Acessibilidade` |

O nutricionista cria a própria conta na aba ao lado do login. O paciente
entra com o e-mail do cadastro e a **data de nascimento** como senha, e cai
na tela de **primeiro acesso**: ele (ou o responsável, se for menor) aceita os
termos e cria uma senha só dele. Sem isso a API não libera dado nenhum (ver o
README, "A senha do paciente").

## Privacidade e auditoria (LGPD)

| Tela | Rota | Pasta |
|---|---|---|
| Meus dados e privacidade (paciente) | `PrivacidadePaciente` | `pages/PrivacidadePaciente` |
| Privacidade e auditoria (nutricionista: pedidos, atividade, conta) | `PrivacidadeNutricionista` | `pages/PrivacidadeNutricionista` |
| Histórico de acessos (os dois perfis) | `HistoricoAcessos` | `pages/HistoricoAcessos` |

Na ficha do paciente, a aba **Resumo** ganhou o cartão *Privacidade (LGPD)*,
com *Exportar dados do paciente* e *Histórico de acessos*.

## Área do nutricionista

| Tela | Rota | Pasta |
|---|---|---|
| Tela inicial | `HomeNutricionista` | `pages/HomeNutricionista` |
| Cadastro de paciente (3 etapas) | `CadastroPaciente` | `pages/CadastroPaciente` |
| Consultar pacientes (lista) | `Pacientes` | `pages/Pacientes` |
| Ficha: Resumo / Avaliações / Evolução | `FichaPaciente` | `pages/FichaPaciente` |

A aba **Resumo** traz a ficha, o acesso ao aplicativo e as consultas
marcadas; **Avaliações** é a lista, consulta por consulta; **Evolução** é a
leitura do conjunto, em gráficos. Os gráficos mostram as
`MAXIMO_NO_GRAFICO` (4) avaliações mais recentes — com mais que isso os
rótulos de data encavalam no celular —, mas o "desde a primeira" compara
sempre o histórico inteiro.
| Escolha da faixa da calculadora | `FaixaCalculadora` | `pages/FaixaCalculadora` |
| Calculadora OMS | `Calculadora` | `pages/Calculadora` |
| Resultados da calculadora | `ResultadoCalculadora` | `pages/ResultadoCalculadora` |
| Previsão de altura adulta da criança | `PrevisaoAltura` | `pages/PrevisaoAltura` |
| Pacotes de planos (Individual / Clínica) | `Pacotes` | `pages/Pacotes` |
| Agenda | `Agenda` | `pages/Agenda` |
| Nova consulta (cadastrado / avulso) | `NovaConsulta` | `pages/NovaConsulta` |
| Perfil | `Perfil` | `pages/Perfil` |
| Alterar senha | `AlterarSenha` | `pages/AlterarSenha` |
| Central de notificações | `Notificacoes` | `pages/Notificacoes` |
| Preferências de notificação | `PreferenciasNotificacao` | `pages/PreferenciasNotificacao` |
| Termos de uso / Privacidade | `Termos` | `pages/Termos` |

## Área do paciente

| Tela | Rota | Pasta |
|---|---|---|
| Tela inicial (última avaliação, próxima consulta, dica do dia) | `HomePaciente` | `pages/HomePaciente` |
| Minha evolução (gráficos e avaliações) | `EvolucaoPaciente` | `pages/EvolucaoPaciente` |
| Consultas | `AgendaPaciente` | `pages/AgendaPaciente` |
| Perfil | `PerfilPaciente` | `pages/PerfilPaciente` |
| Alterar senha | `AlterarSenhaPaciente` | `pages/AlterarSenhaPaciente` |
| Saúde e dicas (conteúdo, sem banco) | `Dicas` | `pages/Dicas` |

Abas da barra inferior do paciente: Início (`HomePaciente`), Evolução
(`EvolucaoPaciente`), Consultas (`AgendaPaciente`) e Perfil
(`PerfilPaciente`).

## Usada pelos dois perfis

| Tela | Rota | Pasta |
|---|---|---|
| Uma avaliação por extenso (como a tela de resultados) | `DetalheAvaliacao` | `pages/DetalheAvaliacao` |

O nutricionista chega nela tocando numa avaliação da ficha; o paciente,
tocando numa avaliação de "Minha evolução". A prop de rota `perfil`
(`'nutricionista'` ou `'paciente'`) muda só o texto do rodapé.

## Pastas

- `tema/` — cores, espaçamentos, raios, sombras e a escala de tipografia (um só lugar para o visual).
- `componentes/` — Tela, Cabecalho, BarraInferior, Botao, BotaoCircular, CampoTexto, CampoBusca, CampoSelecao, CampoData, Alternador, Chip, Selo, Cartao, CaixaAviso, CaixaSelecao, BarraEtapas, BarraProgresso, Avatar, Abas, Calendario, Dialogo, Logo, Icone, RequisitosSenha, SemSessaoPaciente, SinoNotificacoes e os três gráficos: **GraficoLinha**, **GraficoBarra** e **GraficoPizza**.
- `contexto/` — `AuthContext` (sessão do nutricionista), `DadosContexto` (pacientes, consultas e assinatura, todos lidos do banco), `NotificacoesContexto` e `DialogoContexto`.
- `Api/` — uma chamada por arquivo de assunto: `loginCadastro`, `Pacientes`, `avaliacoes`, `consultas`, `convite`, `senha`, `notificacoes`, `assinatura`.
- `dados/` — o que é texto fixo e não vem do banco: `planosAssinatura.js` (catálogo dos planos pagos), `consultas.js` (durações, tipos e horários do formulário) e `conteudoSaude.js` (o conteúdo da tela "Saúde e dicas").
- `utilitarios/` — máscaras, validações, datas, formatos, a leitura da evolução (`evolucao.js`) e o motor da calculadora OMS (`utilitarios/oms`, com `previsaoAltura.js`).

## Atenção

- **Tabelas da OMS**: as de `utilitarios/oms/dados` são as **oficiais**, com todos os indicadores (inclusive PB, PCT e PCS). Conferidas contra as tabelas publicadas pela OMS e contra o conjunto de teste do WHO AnthroPlus. Detalhes no README.
- **A calculadora começa pela faixa**: `FaixaCalculadora` pergunta 0–5, 5–19 ou adulto, e a escolha define quais campos e indicadores a tela de medidas mostra. Quem manda no cálculo, porém, é sempre a idade real — se a data de nascimento não combinar com a faixa, a tela avisa e oferece a troca.
- **O cálculo é feito no aplicativo, não na API.** As curvas da OMS estão aqui; a API recebe o resultado pronto e grava (`POST /api/avaliacao`). Não é o ideal, mas é o que mantém uma fonte só para o cálculo. O porquê está em `Api/repository/avaliacaoRepository.js`.
- **A evolução é lida pelos dois lados da mesma rota.** `utilitarios/evolucao.js` monta as séries dos gráficos e refaz o cálculo da OMS de uma avaliação antiga; a aba Evolução da ficha e "Minha evolução" usam as mesmas funções, para os dois perfis não mostrarem números diferentes.
- **A previsão de altura é estimativa, não diagnóstico.** São duas leituras: a altura-alvo dos pais (Tanner) e a projeção pela curva da OMS mantendo o escore-z atual. A tela diz, com todas as letras, a margem de erro das duas.
- **A tela "Saúde e dicas" não toca no banco.** O conteúdo é texto fixo (`dados/conteudoSaude.js`): a dica do dia, o prato saudável, a calculadora de água e as perguntas frequentes. O checklist "Como foi o seu dia" existiu e foi removido.
- **A legenda do gráfico de rosca é tocável.** Cada fatia pode trazer uma `descricao`, e tocá-la abre um balão com ela. Os textos estão em `TONS`, no `utilitarios/evolucao.js`, em duas versões: a do nutricionista fala em escore-z e conduta, a do paciente fala no que ele faz com aquilo.
- **Dependências**: nenhuma nova. No aplicativo, `react-native-svg`, `react-navigation`, `safe-area-context` e `expo-linking`; na API, `express`, `mysql2`, `bcryptjs`, `jsonwebtoken`, `nodemailer` e `dotenv`.
