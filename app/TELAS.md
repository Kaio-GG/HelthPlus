# Telas do Health Plus (Figma → código)

Padrão do projeto: cada tela fica em `pages/<NomeDaTela>/` com **`index.js`** (código) e **`style.js`** (estilo, exportando `estilos`).
Componentes reutilizáveis ficam em `componentes/<Nome>/` com o mesmo padrão. Textos, variáveis, funções e comentários em português.

| Tela do Figma | Rota (`App.js`) | Pasta |
|---|---|---|
| Login nutricionista (Entrar / Criar conta) | `Nutricionista` | `pages/Nutricionista` |
| Login paciente | `Paciente` | `pages/Paciente` |
| Esqueci a senha | `EsqueciSenha` | `pages/EsqueciSenha` |
| Verificação de e-mail | `VerificacaoEmail` | `pages/VerificacaoEmail` |
| Redefinir senha | `RedefinirSenha` | `pages/RedefinirSenha` |
| Primeiro acesso | `PrimeiroAcesso` | `pages/PrimeiroAcesso` |
| Tela inicial | `HomeNutricionista` | `pages/HomeNutricionista` |
| Cadastro de paciente (4 etapas) | `CadastroPaciente` | `pages/CadastroPaciente` |
| Consultar pacientes (lista) | `Pacientes` | `pages/Pacientes` |
| Ficha: Resumo / Avaliações / Planos / Registros | `FichaPaciente` | `pages/FichaPaciente` |
| Planos alimentares (lista) | `PlanosAlimentares` | `pages/PlanosAlimentares` |
| Criar plano alimentar | `CriarPlanoAlimentar` | `pages/CriarPlanoAlimentar` |
| Calculadora OMS | `Calculadora` | `pages/Calculadora` |
| Resultados da calculadora | `ResultadoCalculadora` | `pages/ResultadoCalculadora` |
| Pacotes de planos (Individual / Clínica) | `Pacotes` | `pages/Pacotes` |
| Agenda | `Agenda` | `pages/Agenda` |
| Nova consulta (cadastrado / avulso) | `NovaConsulta` | `pages/NovaConsulta` |
| Perfil | `Perfil` | `pages/Perfil` |
| Termos de uso / Privacidade | `Termos` | `pages/Termos` |
| **Paciente** · Tela inicial (hoje, próxima consulta, atalhos) | `HomePaciente` | `pages/HomePaciente` |
| **Paciente** · Registros do dia (água e refeições) | `RegistrosPaciente` | `pages/RegistrosPaciente` |
| **Paciente** · Meu plano alimentar | `MeuPlano` | `pages/MeuPlano` |
| **Paciente** · Minha evolução (peso e avaliações) | `EvolucaoPaciente` | `pages/EvolucaoPaciente` |
| **Paciente** · Consultas | `AgendaPaciente` | `pages/AgendaPaciente` |
| **Paciente** · Perfil | `PerfilPaciente` | `pages/PerfilPaciente` |

## Pastas novas
- `tema/` — cores, espaçamentos, raios e sombras (um só lugar para o visual).
- `componentes/` — Tela, Cabecalho, BarraInferior, Botao, CampoTexto, CampoBusca, CampoSelecao, Alternador, Chip, Selo, Cartao, CaixaAviso, CaixaSelecao, BarraEtapas, BarraProgresso, Avatar, Abas, Calendario, GraficoLinha, BotaoCircular, CartaoPlano, Icone.
- `contexto/DadosContexto.js` — dados em memória (pacientes, consultas, planos, avaliações, assinatura).
- `dados/` — dados de exemplo (trocar por chamadas à API quando ela estiver pronta; procure por `TODO: integrar com a API`).
- `utilitarios/` — máscaras, validações, datas, formatos e o motor da calculadora OMS (`utilitarios/oms`).

## Atenção
- **Tabelas da OMS**: as de `utilitarios/oms/dados` são de **demonstração** (poucos pontos). Troque pelas oficiais antes de usar com pacientes reais. PB, PCT e PCS ainda não têm tabela (aparecem como "—").
- Etapas 1, 2 e 4 do "Criar plano alimentar" não estavam no Figma; foram feitas no mesmo estilo da etapa 3.
- Nenhuma dependência nova: só `react-native-svg`, `react-navigation` e `safe-area-context`, que já estavam no projeto.

## Área do paciente
- Abas da barra inferior do paciente: Início (`HomePaciente`), Registros (`RegistrosPaciente`), Consultas (`AgendaPaciente`) e Perfil (`PerfilPaciente`). `MeuPlano` e `EvolucaoPaciente` abrem a partir dos atalhos da tela inicial.
- `BarraInferior` e `Tela` ganharam a prop `perfil` / `perfilBarra` (`'nutricionista'` padrão ou `'paciente'`).
- `componentes/SemSessaoPaciente` — aviso mostrado quando não há paciente logado.
- `contexto/DadosContexto.js` agora guarda os registros do paciente (`montarRegistrosDoDia`, `obterRegistrosDoDia`, `registrarAgua`, `registrarRefeicao`) e o paciente logado (`pacienteAtual`, `entrarComoPaciente`, `sairComoPaciente`). A aba "Registros" da `FichaPaciente` lê desses dados.
- **Login do paciente em modo demonstração**: a tela `Paciente` procura o e-mail entre os pacientes cadastrados neste aparelho e **não confere a senha** — a API ainda não tem rota de login do paciente (tabela `usuario_paciente`). Procure por `TODO: integrar com a API`.
- A meta de água padrão (`META_AGUA_PADRAO_LITROS`, em `dados/registros.js`) só é usada quando o plano do paciente não define uma.
