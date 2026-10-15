// Criação/edição de plano alimentar em 4 etapas:
// 1) paciente e período  2) metas diárias  3) refeições e alimentos  4) revisão
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import BarraEtapas from '../../componentes/BarraEtapas';
import CampoTexto from '../../componentes/CampoTexto';
import CampoSelecao from '../../componentes/CampoSelecao';
import CampoBusca from '../../componentes/CampoBusca';
import Chip from '../../componentes/Chip';
import Selo from '../../componentes/Selo';
import Icone from '../../componentes/Icone';
import Botao from '../../componentes/Botao';
import { useDados } from '../../contexto/DadosContexto';
import { alimentosTaco, nomesDasRefeicoes } from '../../dados/alimentosTaco';
import { cores } from '../../tema';
import { aplicarMascaraData, aplicarMascaraDecimal, decimalParaNumero, apenasDigitos } from '../../utilitarios/mascaras';
import { converterDataBR, formatarDataBR, somarDias, nomesMeses } from '../../utilitarios/datas';
import { formatarNumero, normalizarTexto } from '../../utilitarios/formatos';
import { estilos } from './style';

const TOTAL_ETAPAS = 4;
const titulosDasEtapas = ['Paciente e período', 'Metas diárias', 'Refeições e alimentos', 'Revisão'];

// Soma kcal e macronutrientes de uma lista de alimentos.
const somarAlimentos = (alimentos) =>
  alimentos.reduce(
    (total, item) => ({
      kcal: total.kcal + item.kcal,
      proteina: total.proteina + item.proteina,
      carboidrato: total.carboidrato + item.carboidrato,
      gordura: total.gordura + item.gordura,
    }),
    { kcal: 0, proteina: 0, carboidrato: 0, gordura: 0 }
  );

const CriarPlanoAlimentar = ({ navigation, route }) => {
  const { pacientes, planosAlimentares, salvarPlanoAlimentar } = useDados();

  const planoEmEdicao = planosAlimentares.find((plano) => plano.id === route.params?.planoId) || null;
  const pacienteInicial = pacientes.find((p) => p.id === (planoEmEdicao?.pacienteId || route.params?.pacienteId));

  const hoje = new Date();

  const [etapa, setEtapa] = useState(1);
  const [erros, setErros] = useState({});

  // Etapa 1
  const [nomePacienteEscolhido, setNomePacienteEscolhido] = useState(pacienteInicial ? pacienteInicial.nome : '');
  const [nomeDoPlano, setNomeDoPlano] = useState(
    planoEmEdicao ? planoEmEdicao.nome : `Plano Alimentar – ${nomesMeses[hoje.getMonth()]}`
  );
  const [inicio, setInicio] = useState(planoEmEdicao ? planoEmEdicao.inicio : formatarDataBR(hoje));
  const [fim, setFim] = useState(planoEmEdicao ? planoEmEdicao.fim : formatarDataBR(somarDias(hoje, 90)));

  // Etapa 2
  const [metaKcal, setMetaKcal] = useState(planoEmEdicao ? String(planoEmEdicao.metaKcal) : '');
  const [metaAgua, setMetaAgua] = useState(
    planoEmEdicao ? formatarNumero(planoEmEdicao.metaAguaLitros) : '1,5'
  );
  const [observacoes, setObservacoes] = useState(planoEmEdicao?.observacoes || '');

  // Etapa 3: refeições guardadas em um objeto { 'Café da manhã': [alimentos...] }
  const [refeicoes, setRefeicoes] = useState(() => {
    const inicial = {};
    nomesDasRefeicoes.forEach((nome) => {
      inicial[nome] = [];
    });
    (planoEmEdicao?.refeicoes || []).forEach((refeicao) => {
      inicial[refeicao.nome] = refeicao.alimentos;
    });
    return inicial;
  });
  const [refeicaoAtiva, setRefeicaoAtiva] = useState(nomesDasRefeicoes[0]);
  const [buscaAlimento, setBuscaAlimento] = useState('');

  const alimentosDaRefeicao = refeicoes[refeicaoAtiva] || [];
  const totalDaRefeicao = somarAlimentos(alimentosDaRefeicao);
  const todosOsAlimentos = Object.values(refeicoes).flat();
  const totalDoDia = somarAlimentos(todosOsAlimentos);
  const metaKcalNumero = decimalParaNumero(metaKcal) || 0;

  const resultadosDaBusca = buscaAlimento.trim()
    ? alimentosTaco.filter((item) => normalizarTexto(item.nome).includes(normalizarTexto(buscaAlimento))).slice(0, 5)
    : [];

  const adicionarAlimento = (alimento) => {
    const linha = { ...alimento, idLinha: `${alimento.id}-${Date.now()}` };
    setRefeicoes((atuais) => ({ ...atuais, [refeicaoAtiva]: [...atuais[refeicaoAtiva], linha] }));
    setBuscaAlimento('');
  };

  const removerAlimento = (idLinha) => {
    setRefeicoes((atuais) => ({
      ...atuais,
      [refeicaoAtiva]: atuais[refeicaoAtiva].filter((item) => item.idLinha !== idLinha),
    }));
  };

  const validarEtapa = (numeroDaEtapa) => {
    const novosErros = {};

    if (numeroDaEtapa === 1) {
      if (!nomePacienteEscolhido) novosErros.paciente = 'Selecione o paciente.';
      if (nomeDoPlano.trim().length < 3) novosErros.nome = 'Informe o nome do plano.';
      const dataInicio = converterDataBR(inicio);
      const dataFim = converterDataBR(fim);
      if (!dataInicio) novosErros.inicio = 'Data inválida.';
      if (!dataFim) novosErros.fim = 'Data inválida.';
      if (dataInicio && dataFim && dataFim < dataInicio) novosErros.fim = 'O fim deve ser depois do início.';
    }

    if (numeroDaEtapa === 2) {
      if (!metaKcalNumero || metaKcalNumero < 500) novosErros.metaKcal = 'Informe a meta de calorias (mín. 500).';
    }

    if (numeroDaEtapa === 3) {
      if (todosOsAlimentos.length === 0) novosErros.alimentos = 'Adicione ao menos um alimento.';
    }

    return novosErros;
  };

  const salvarPlano = () => {
    const paciente = pacientes.find((item) => item.nome === nomePacienteEscolhido);

    // TODO: integrar com a API (salvar o plano alimentar).
    salvarPlanoAlimentar({
      id: planoEmEdicao ? planoEmEdicao.id : 'novo',
      nome: nomeDoPlano.trim(),
      pacienteId: paciente.id,
      pacienteNome: paciente.nome,
      inicio,
      fim,
      metaKcal: metaKcalNumero,
      metaAguaLitros: decimalParaNumero(metaAgua) || 0,
      observacoes,
      status: planoEmEdicao ? planoEmEdicao.status : 'ativo',
      refeicoes: nomesDasRefeicoes
        .filter((nome) => refeicoes[nome].length > 0)
        .map((nome) => ({ nome, alimentos: refeicoes[nome] })),
    });

    Alert.alert('Plano salvo!', 'O plano alimentar foi salvo com sucesso.', [
      { text: 'OK', onPress: () => navigation.replace('PlanosAlimentares') },
    ]);
  };

  const continuar = () => {
    const novosErros = validarEtapa(etapa);
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;
    if (etapa < TOTAL_ETAPAS) setEtapa(etapa + 1);
    else salvarPlano();
  };

  const voltarEtapa = () => {
    setErros({});
    if (etapa > 1) setEtapa(etapa - 1);
    else navigation.goBack();
  };

  // Na revisão: o total do dia está perto da meta? (±15%)
  const diferencaDaMeta = metaKcalNumero ? Math.abs(totalDoDia.kcal - metaKcalNumero) / metaKcalNumero : 1;

  return (
    <Tela
      titulo={planoEmEdicao ? 'Editar plano alimentar' : 'Criar plano alimentar'}
      subtitulo={`Etapa ${etapa} de ${TOTAL_ETAPAS} – ${titulosDasEtapas[etapa - 1]}`}
      aoVoltar={voltarEtapa}
      cabecalhoFilhos={<BarraEtapas total={TOTAL_ETAPAS} atual={etapa} />}
      rodape={
        <View style={estilos.linhaBotoes}>
          <Botao titulo="Voltar" variante="contorno" aoPressionar={voltarEtapa} estilo={estilos.botaoVoltar} />
          <Botao
            titulo={etapa === TOTAL_ETAPAS ? 'Salvar plano' : 'Continuar'}
            aoPressionar={continuar}
            estilo={estilos.botaoContinuar}
          />
        </View>
      }
    >
      <Cartao>
        {/* ---------- Etapa 1 ---------- */}
        {etapa === 1 && (
          <View>
            <CampoSelecao
              rotulo="Paciente"
              valor={nomePacienteEscolhido}
              opcoes={pacientes.map((paciente) => paciente.nome)}
              aoMudar={setNomePacienteEscolhido}
              placeholder="Selecione o paciente"
              erro={erros.paciente}
            />
            <CampoTexto
              rotulo="Nome do plano"
              valor={nomeDoPlano}
              aoMudar={setNomeDoPlano}
              placeholder="Ex.: Plano Emagrecimento"
              erro={erros.nome}
            />
            <View style={estilos.linhaCampos}>
              <CampoTexto
                rotulo="Início da vigência"
                valor={inicio}
                aoMudar={(texto) => setInicio(aplicarMascaraData(texto))}
                placeholder="DD/MM/AAAA"
                teclado="number-pad"
                icone="calendario"
                erro={erros.inicio}
                estilo={estilos.campoMetade}
              />
              <CampoTexto
                rotulo="Fim da vigência"
                valor={fim}
                aoMudar={(texto) => setFim(aplicarMascaraData(texto))}
                placeholder="DD/MM/AAAA"
                teclado="number-pad"
                icone="calendario"
                erro={erros.fim}
                estilo={estilos.campoMetade}
              />
            </View>
          </View>
        )}

        {/* ---------- Etapa 2 ---------- */}
        {etapa === 2 && (
          <View>
            <CampoTexto
              rotulo="Meta diária de calorias (kcal)"
              valor={metaKcal}
              aoMudar={(texto) => setMetaKcal(apenasDigitos(texto))}
              placeholder="Ex.: 1400"
              teclado="number-pad"
              erro={erros.metaKcal}
            />
            <CampoTexto
              rotulo="Meta de água (litros por dia)"
              valor={metaAgua}
              aoMudar={(texto) => setMetaAgua(aplicarMascaraDecimal(texto))}
              placeholder="Ex.: 1,5"
              teclado="decimal-pad"
            />
            <CampoTexto
              rotulo="Observações gerais (opcional)"
              valor={observacoes}
              aoMudar={setObservacoes}
              placeholder="Orientações para o paciente"
              multilinha
            />
          </View>
        )}

        {/* ---------- Etapa 3 ---------- */}
        {etapa === 3 && (
          <View>
            <Text style={estilos.rotulo}>Refeição</Text>
            <View style={estilos.linhaChips}>
              {nomesDasRefeicoes.map((nome) => (
                <Chip
                  key={nome}
                  rotulo={nome}
                  comCheck
                  ativo={refeicaoAtiva === nome}
                  aoPressionar={() => setRefeicaoAtiva(nome)}
                />
              ))}
            </View>

            <Text style={estilos.rotulo}>Buscar alimento (TACO)</Text>
            <CampoBusca valor={buscaAlimento} aoMudar={setBuscaAlimento} placeholder="Ex.: pão integral, ovo" />
            {resultadosDaBusca.map((alimento) => (
              <TouchableOpacity key={alimento.id} style={estilos.itemBusca} onPress={() => adicionarAlimento(alimento)}>
                <View style={estilos.textosAlimento}>
                  <Text style={estilos.nomeAlimento}>{alimento.nome}</Text>
                  <Text style={estilos.porcaoAlimento}>
                    {alimento.porcao} · {alimento.kcal} kcal
                  </Text>
                </View>
                <Icone nome="mais" tamanho={20} cor={cores.verdeBotao} />
              </TouchableOpacity>
            ))}

            <Text style={[estilos.rotulo, estilos.rotuloLista]}>Alimentos da refeição</Text>
            {alimentosDaRefeicao.length === 0 ? (
              <Text style={estilos.vazio}>Nenhum alimento adicionado em "{refeicaoAtiva}".</Text>
            ) : (
              alimentosDaRefeicao.map((alimento) => (
                <View key={alimento.idLinha} style={estilos.itemAlimento}>
                  <View style={estilos.textosAlimento}>
                    <Text style={estilos.nomeAlimento}>{alimento.nome}</Text>
                    <Text style={estilos.porcaoAlimento}>
                      {alimento.porcao} · {alimento.kcal} kcal
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => removerAlimento(alimento.idLinha)} hitSlop={10}>
                    <Icone nome="fechar" tamanho={18} cor={cores.textoSecundario} />
                  </TouchableOpacity>
                </View>
              ))
            )}
            {erros.alimentos ? <Text style={estilos.erro}>{erros.alimentos}</Text> : null}

            <View style={estilos.totalRefeicao}>
              <View style={estilos.linhaTotal}>
                <Text style={estilos.rotuloTotal}>Total da refeição</Text>
                <Text style={estilos.valorTotal}>{formatarNumero(totalDaRefeicao.kcal, 0)} kcal</Text>
              </View>
              <Text style={estilos.macros}>
                Prot. {formatarNumero(totalDaRefeicao.proteina, 0)} g · Carb. {formatarNumero(totalDaRefeicao.carboidrato, 0)} g · Gord.{' '}
                {formatarNumero(totalDaRefeicao.gordura, 0)} g
              </Text>
              <Text style={estilos.notaMacros}>Valores de exemplo (base TACO).</Text>
            </View>
          </View>
        )}

        {/* ---------- Etapa 4 ---------- */}
        {etapa === 4 && (
          <View>
            <Text style={estilos.nomeResumo}>{nomeDoPlano}</Text>
            <Text style={estilos.detalheResumo}>Paciente: {nomePacienteEscolhido}</Text>
            <Text style={estilos.detalheResumo}>
              Vigência: {inicio.slice(0, 5)} a {fim.slice(0, 5)}
            </Text>

            <View style={estilos.caixaMeta}>
              <View style={estilos.linhaTotal}>
                <Text style={estilos.rotuloTotal}>Total do dia</Text>
                <Text style={estilos.valorTotal}>{formatarNumero(totalDoDia.kcal, 0)} kcal</Text>
              </View>
              <Text style={estilos.macros}>Meta: {formatarNumero(metaKcalNumero, 0)} kcal</Text>
              <Selo
                texto={diferencaDaMeta <= 0.15 ? 'Dentro da meta' : 'Longe da meta'}
                tom={diferencaDaMeta <= 0.15 ? 'sucesso' : 'alerta'}
                estilo={estilos.seloMeta}
              />
            </View>

            {nomesDasRefeicoes
              .filter((nome) => refeicoes[nome].length > 0)
              .map((nome) => (
                <View key={nome} style={estilos.linhaResumoRefeicao}>
                  <View style={estilos.textosAlimento}>
                    <Text style={estilos.nomeAlimento}>{nome}</Text>
                    <Text style={estilos.porcaoAlimento}>
                      {refeicoes[nome].map((alimento) => alimento.nome).join(', ')}
                    </Text>
                  </View>
                  <Text style={estilos.kcalResumo}>{formatarNumero(somarAlimentos(refeicoes[nome]).kcal, 0)} kcal</Text>
                </View>
              ))}
          </View>
        )}
      </Cartao>
    </Tela>
  );
};

export default CriarPlanoAlimentar;
