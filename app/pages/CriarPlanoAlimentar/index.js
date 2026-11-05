
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import BarraEtapas from '../../componentes/BarraEtapas';
import CampoTexto from '../../componentes/CampoTexto';
import CampoBusca from '../../componentes/CampoBusca';
import Chip from '../../componentes/Chip';
import Selo from '../../componentes/Selo';
import Icone from '../../componentes/Icone';
import Botao from '../../componentes/Botao';

import { useDados } from '../../contexto/DadosContexto';
import { useDialogo } from '../../contexto/DialogoContexto';
import { useAuth } from '../../contexto/AuthContext';

import {
  cadastrarPlano,
  atualizarPlano,
} from '../../Api/PlanoAlimentar.js';

import { listarPacientes } from '../../Api/Pacientes.js';

import {
  alimentosTaco,
  nomesDasRefeicoes,
} from '../../dados/alimentosTaco';

import { cores } from '../../tema';

import {
  aplicarMascaraData,
  aplicarMascaraDecimal,
  decimalParaNumero,
  apenasDigitos,
} from '../../utilitarios/mascaras';

import {
  converterDataBR,
  formatarDataBR,
  somarDias,
  nomesMeses,
} from '../../utilitarios/datas';

import {
  formatarNumero,
  normalizarTexto,
} from '../../utilitarios/formatos';

import { estilos } from './style';

const TOTAL_ETAPAS = 4;

const titulosDasEtapas = [
  'Paciente e período',
  'Metas diárias',
  'Refeições e alimentos',
  'Revisão',
];

// Soma kcal e macronutrientes.
const somarAlimentos = (alimentos) =>
  alimentos.reduce(
    (total, item) => ({
      kcal: total.kcal + item.kcal,
      proteina: total.proteina + item.proteina,
      carboidrato: total.carboidrato + item.carboidrato,
      gordura: total.gordura + item.gordura,
    }),
    {
      kcal: 0,
      proteina: 0,
      carboidrato: 0,
      gordura: 0,
    }
  );

// Converte DD/MM/AAAA para AAAA-MM-DD.
const dataParaISO = (dataBR) => {
  const [dia, mes, ano] = dataBR.split('/');
  return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
};

const CriarPlanoAlimentar = ({ navigation, route }) => {
  const { avisar } = useDialogo();
  const { profissional, token } = useAuth();

  const {
    planosAlimentares,
    salvarPlanoAlimentar,
  } = useDados();

  // Pacientes carregados pela API.
  const [pacientes, setPacientes] = useState([]);
  const [carregandoPacientes, setCarregandoPacientes] = useState(false);

  // Busca e seleção do paciente.
  const [buscaPaciente, setBuscaPaciente] = useState('');
  const [nomePacienteEscolhido, setNomePacienteEscolhido] = useState('');

  const planoEmEdicao =
    planosAlimentares.find(
      (plano) => plano.id === route.params?.planoId
    ) || null;

  const hoje = new Date();

  const [etapa, setEtapa] = useState(1);
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);

  // ETAPA 1 - PACIENTE E PERÍODO

  const [nomeDoPlano, setNomeDoPlano] = useState(
    planoEmEdicao
      ? planoEmEdicao.nome
      : `Plano Alimentar – ${nomesMeses[hoje.getMonth()]}`
  );

  const [inicio, setInicio] = useState(
    planoEmEdicao
      ? planoEmEdicao.inicio
      : formatarDataBR(hoje)
  );

  const [fim, setFim] = useState(
    planoEmEdicao
      ? planoEmEdicao.fim
      : formatarDataBR(somarDias(hoje, 90))
  );

  // ETAPA 2 - METAS DIÁRIAS

  const [metaKcal, setMetaKcal] = useState(
    planoEmEdicao ? String(planoEmEdicao.metaKcal) : ''
  );

  const [metaAgua, setMetaAgua] = useState(
    planoEmEdicao
      ? formatarNumero(planoEmEdicao.metaAguaLitros)
      : '1,5'
  );

  const [observacoes, setObservacoes] = useState(
    planoEmEdicao?.observacoes || ''
  );

  // ETAPA 3 - REFEIÇÕES E ALIMENTOS

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

  const [refeicaoAtiva, setRefeicaoAtiva] = useState(
    nomesDasRefeicoes[0]
  );

  const [buscaAlimento, setBuscaAlimento] = useState('');

  // CARREGAMENTO DOS PACIENTES

  useEffect(() => {
    const carregarPacientes = async () => {
      if (!token) {
        console.log('[CriarPlano] Token não encontrado.');
        return;
      }

      try {
        setCarregandoPacientes(true);

        const resposta = await listarPacientes(token);

        // Preserva os campos originais que já chegam da API.
        // Não sobrescreve nome ou id com campos inexistentes.
        const pacientesFormatados = resposta.map((paciente) => ({
          ...paciente,
          idBanco:
            paciente.idBanco ??
            paciente.id ??
            paciente.id_paciente ??
            paciente.idPaciente,
        }));

        setPacientes(pacientesFormatados);

        console.log(
          '[CriarPlano] Pacientes carregados:',
          pacientesFormatados
        );
      } catch (erro) {
        console.log(
          '[CriarPlano] Erro ao carregar pacientes:',
          erro
        );

        avisar({
          titulo: 'Erro ao carregar pacientes',
          mensagem: erro.message,
        });
      } finally {
        setCarregandoPacientes(false);
      }
    };

    carregarPacientes();
  }, [token]);

  // RECUPERA O PACIENTE AO EDITAR UM PLANO

  useEffect(() => {
    const pacienteId =
      planoEmEdicao?.pacienteId ||
      route.params?.pacienteId;

    if (!pacienteId || pacientes.length === 0) return;

    const paciente = pacientes.find(
      (item) =>
        String(
          item.idBanco ?? item.id ?? item.id_paciente
        ) === String(pacienteId)
    );

    if (paciente) {
      setNomePacienteEscolhido(paciente.nome);
      setBuscaPaciente(paciente.nome);
    }
  }, [
    pacientes,
    planoEmEdicao?.pacienteId,
    route.params?.pacienteId,
  ]);

  // CÁLCULOS

  const alimentosDaRefeicao =
    refeicoes[refeicaoAtiva] || [];

  const totalDaRefeicao =
    somarAlimentos(alimentosDaRefeicao);

  const todosOsAlimentos =
    Object.values(refeicoes).flat();

  const totalDoDia =
    somarAlimentos(todosOsAlimentos);

  const metaKcalNumero =
    decimalParaNumero(metaKcal) || 0;

  // FILTRO DA BUSCA DE PACIENTES

  const pacientesFiltrados = buscaPaciente.trim()
    ? pacientes.filter((paciente) =>
        normalizarTexto(paciente.nome || '').includes(
          normalizarTexto(buscaPaciente)
        )
      )
    : [];

  // BUSCA DE ALIMENTOS

  const resultadosDaBusca = buscaAlimento.trim()
    ? alimentosTaco
        .filter((item) =>
          normalizarTexto(item.nome).includes(
            normalizarTexto(buscaAlimento)
          )
        )
        .slice(0, 5)
    : [];

  // SELECIONAR PACIENTE

  const selecionarPaciente = (paciente) => {
    setNomePacienteEscolhido(paciente.nome);
    setBuscaPaciente(paciente.nome);
    setErros((atuais) => ({
      ...atuais,
      paciente: undefined,
    }));
  };

  // ADICIONAR ALIMENTO

  const adicionarAlimento = (alimento) => {
    const linha = {
      ...alimento,
      idLinha: `${alimento.id}-${Date.now()}`,
    };

    setRefeicoes((atuais) => ({
      ...atuais,
      [refeicaoAtiva]: [
        ...atuais[refeicaoAtiva],
        linha,
      ],
    }));

    setBuscaAlimento('');
  };

  // REMOVER ALIMENTO

  const removerAlimento = (idLinha) => {
    setRefeicoes((atuais) => ({
      ...atuais,
      [refeicaoAtiva]: atuais[refeicaoAtiva].filter(
        (item) => item.idLinha !== idLinha
      ),
    }));
  };

  // VALIDAÇÃO DAS ETAPAS

  const validarEtapa = (numeroDaEtapa) => {
    const novosErros = {};

    if (numeroDaEtapa === 1) {
      if (!nomePacienteEscolhido) {
        novosErros.paciente = 'Selecione o paciente.';
      }

      if (nomeDoPlano.trim().length < 3) {
        novosErros.nome = 'Informe o nome do plano.';
      }

      const dataInicio = converterDataBR(inicio);
      const dataFim = converterDataBR(fim);

      if (!dataInicio) {
        novosErros.inicio = 'Data inválida.';
      }

      if (!dataFim) {
        novosErros.fim = 'Data inválida.';
      }

      if (
        dataInicio &&
        dataFim &&
        dataFim < dataInicio
      ) {
        novosErros.fim =
          'O fim deve ser depois do início.';
      }
    }

    if (numeroDaEtapa === 2) {
      if (!metaKcalNumero || metaKcalNumero < 500) {
        novosErros.metaKcal =
          'Informe a meta de calorias (mín. 500).';
      }
    }

    if (numeroDaEtapa === 3) {
      if (todosOsAlimentos.length === 0) {
        novosErros.alimentos =
          'Adicione ao menos um alimento.';
      }
    }

    return novosErros;
  };

  // SALVAR PLANO

  const salvarPlano = async () => {
    if (salvando) return;

    const paciente = pacientes.find(
      (item) => item.nome === nomePacienteEscolhido
    );

    if (!paciente) {
      avisar({
        titulo: 'Paciente não encontrado',
        mensagem:
          'Volte à etapa 1 e selecione o paciente novamente.',
      });
      return;
    }

    if (!profissional?.id_profissional) {
      avisar({
        titulo: 'Sessão expirada',
        mensagem:
          'Entre novamente na sua conta para salvar o plano.',
      });
      return;
    }

    // Somente refeições com alimentos.
    const refeicoesParaEnviar = nomesDasRefeicoes
      .map((nome, indice) => ({
        nome,
        ordem: indice,
        alimentos: refeicoes[nome].map((alimento) => ({
          idAlimento: alimento.id,
          nome: alimento.nome,
          porcao: alimento.porcao,
          kcal: alimento.kcal,
          proteina: alimento.proteina,
          carboidrato: alimento.carboidrato,
          gordura: alimento.gordura,
        })),
      }))
      .filter(
        (refeicao) => refeicao.alimentos.length > 0
      );

    const dadosDoPlano = {
      idProfissional: profissional.id_profissional,
      idPaciente:
        paciente.idBanco ??
        paciente.id ??
        paciente.id_paciente,
      nome: nomeDoPlano.trim(),
      inicio: dataParaISO(inicio),
      fim: dataParaISO(fim),
      metaKcal: metaKcalNumero,
      metaAguaLitros:
        decimalParaNumero(metaAgua) || 0,
      observacoes: observacoes.trim(),
      refeicoes: refeicoesParaEnviar,
    };

    try {
      setSalvando(true);

      const resposta = planoEmEdicao?.idBanco
        ? await atualizarPlano(
            planoEmEdicao.idBanco,
            dadosDoPlano
          )
        : await cadastrarPlano(dadosDoPlano);

      // Atualiza a lista local de planos.
      salvarPlanoAlimentar({
        id: planoEmEdicao
          ? planoEmEdicao.id
          : 'novo',
        idBanco:
          planoEmEdicao?.idBanco ?? resposta.idPlano,
        nome: nomeDoPlano.trim(),
        pacienteId:
          paciente.idBanco ??
          paciente.id ??
          paciente.id_paciente,
        pacienteNome: paciente.nome,
        inicio,
        fim,
        metaKcal: metaKcalNumero,
        metaAguaLitros:
          decimalParaNumero(metaAgua) || 0,
        observacoes,
        status: planoEmEdicao
          ? planoEmEdicao.status
          : 'ativo',
        refeicoes: refeicoesParaEnviar.map(
          (refeicao) => ({
            nome: refeicao.nome,
            alimentos: refeicoes[refeicao.nome],
          })
        ),
      });

      await avisar({
        titulo: 'Plano salvo!',
        mensagem:
          'O plano alimentar foi salvo com sucesso.',
        tom: 'sucesso',
      });

      navigation.replace('PlanosAlimentares');
    } catch (erro) {
      console.log('[CriarPlano] ERRO:', erro);

      avisar({
        titulo: 'Erro ao salvar plano',
        mensagem: erro.message,
      });
    } finally {
      setSalvando(false);
    }
  };

  // CONTINUAR ETAPA

  const continuar = () => {
    const novosErros = validarEtapa(etapa);

    setErros(novosErros);

    if (Object.keys(novosErros).length > 0) return;

    if (etapa < TOTAL_ETAPAS) {
      setEtapa(etapa + 1);
    } else {
      salvarPlano();
    }
  };

  // VOLTAR ETAPA

  const voltarEtapa = () => {
    setErros({});

    if (etapa > 1) {
      setEtapa(etapa - 1);
    } else {
      navigation.goBack();
    }
  };

  // DIFERENÇA ENTRE CALORIAS E META

  const diferencaDaMeta = metaKcalNumero
    ? Math.abs(
        totalDoDia.kcal - metaKcalNumero
      ) / metaKcalNumero
    : 1;

  return (
    <Tela
      titulo={
        planoEmEdicao
          ? 'Editar plano alimentar'
          : 'Criar plano alimentar'
      }
      subtitulo={`Etapa ${etapa} de ${TOTAL_ETAPAS} – ${
        titulosDasEtapas[etapa - 1]
      }`}
      aoVoltar={voltarEtapa}
      cabecalhoFilhos={
        <BarraEtapas
          total={TOTAL_ETAPAS}
          atual={etapa}
        />
      }
      rodape={
        <View style={estilos.linhaBotoes}>
          <Botao
            titulo="Voltar"
            variante="contorno"
            aoPressionar={voltarEtapa}
            estilo={estilos.botaoVoltar}
          />

          <Botao
            titulo={
              etapa === TOTAL_ETAPAS
                ? salvando
                  ? 'Salvando...'
                  : 'Salvar plano'
                : 'Continuar'
            }
            aoPressionar={continuar}
            desabilitado={salvando}
            estilo={estilos.botaoContinuar}
          />
        </View>
      }
    >
      <Cartao>

        {/* ETAPA 1 - PACIENTE E PERÍODO */}

        {etapa === 1 && (
          <View>
            <Text style={estilos.rotulo}>
              Paciente
            </Text>

            <CampoBusca
              valor={buscaPaciente}
              aoMudar={(texto) => {
                setBuscaPaciente(texto);
                setNomePacienteEscolhido('');
              }}
              placeholder={
                carregandoPacientes
                  ? 'Carregando pacientes...'
                  : 'Digite o nome do paciente'
              }
            />

            {pacientesFiltrados.map((paciente, indice) => (
              <TouchableOpacity
                key={
                  paciente.idBanco ??
                  paciente.id ??
                  paciente.id_paciente ??
                  indice
                }
                style={estilos.itemBusca}
                onPress={() =>
                  selecionarPaciente(paciente)
                }
              >
                <View style={estilos.textosAlimento}>
                  <Text style={estilos.nomeAlimento}>
                    {paciente.nome}
                  </Text>

                  <Text style={estilos.porcaoAlimento}>
                    {paciente.statusAcesso === 'ativo'
                      ? 'Conta ativa'
                      : paciente.statusAcesso === 'pendente'
                      ? 'Convite pendente'
                      : paciente.statusAcesso === 'sem_acesso'
                      ? 'Sem acesso'
                      : paciente.statusAcesso}
                  </Text>
                </View>

                <Icone
                  nome="mais"
                  tamanho={20}
                  cor={cores.verdeBotao}
                />
              </TouchableOpacity>
            ))}

            {!carregandoPacientes &&
              buscaPaciente.trim().length > 0 &&
              pacientesFiltrados.length === 0 && (
                <Text style={estilos.vazio}>
                  Nenhum paciente encontrado.
                </Text>
              )}

            {nomePacienteEscolhido ? (
              <Text style={estilos.detalheResumo}>
                Paciente selecionado: {nomePacienteEscolhido}
              </Text>
            ) : null}

            {erros.paciente ? (
              <Text style={estilos.erro}>
                {erros.paciente}
              </Text>
            ) : null}

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
                aoMudar={(texto) =>
                  setInicio(aplicarMascaraData(texto))
                }
                aoLimpar={() => setInicio('')}
                selecionarAoFocar
                maxCaracteres={10}
                placeholder="DD/MM/AAAA"
                teclado="number-pad"
                icone="calendario"
                erro={erros.inicio}
                estilo={estilos.campoMetade}
              />

              <CampoTexto
                rotulo="Fim da vigência"
                valor={fim}
                aoMudar={(texto) =>
                  setFim(aplicarMascaraData(texto))
                }
                aoLimpar={() => setFim('')}
                selecionarAoFocar
                maxCaracteres={10}
                placeholder="DD/MM/AAAA"
                teclado="number-pad"
                icone="calendario"
                erro={erros.fim}
                estilo={estilos.campoMetade}
              />
            </View>
          </View>
        )}

        {/* ETAPA 2 - METAS DIÁRIAS */}

        {etapa === 2 && (
          <View>
            <CampoTexto
              rotulo="Meta diária de calorias (kcal)"
              valor={metaKcal}
              aoMudar={(texto) =>
                setMetaKcal(apenasDigitos(texto))
              }
              placeholder="Ex.: 1400"
              teclado="number-pad"
              erro={erros.metaKcal}
            />

            <CampoTexto
              rotulo="Meta de água (litros por dia)"
              valor={metaAgua}
              aoMudar={(texto) =>
                setMetaAgua(
                  aplicarMascaraDecimal(texto)
                )
              }
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

        {/* ETAPA 3 - REFEIÇÕES E ALIMENTOS */}

        {etapa === 3 && (
          <View>
            <Text style={estilos.rotulo}>
              Refeição
            </Text>

            <View style={estilos.linhaChips}>
              {nomesDasRefeicoes.map((nome) => (
                <Chip
                  key={nome}
                  rotulo={nome}
                  comCheck
                  ativo={refeicaoAtiva === nome}
                  aoPressionar={() =>
                    setRefeicaoAtiva(nome)
                  }
                />
              ))}
            </View>

            <Text style={estilos.rotulo}>
              Buscar alimento (TACO)
            </Text>

            <CampoBusca
              valor={buscaAlimento}
              aoMudar={setBuscaAlimento}
              placeholder="Ex.: pão integral, ovo"
            />

            {resultadosDaBusca.map((alimento) => (
              <TouchableOpacity
                key={alimento.id}
                style={estilos.itemBusca}
                onPress={() =>
                  adicionarAlimento(alimento)
                }
              >
                <View style={estilos.textosAlimento}>
                  <Text style={estilos.nomeAlimento}>
                    {alimento.nome}
                  </Text>

                  <Text style={estilos.porcaoAlimento}>
                    {alimento.porcao} · {alimento.kcal} kcal
                  </Text>
                </View>

                <Icone
                  nome="mais"
                  tamanho={20}
                  cor={cores.verdeBotao}
                />
              </TouchableOpacity>
            ))}

            <Text
              style={[
                estilos.rotulo,
                estilos.rotuloLista,
              ]}
            >
              Alimentos da refeição
            </Text>

            {alimentosDaRefeicao.length === 0 ? (
              <Text style={estilos.vazio}>
                Nenhum alimento adicionado em "{refeicaoAtiva}".
              </Text>
            ) : (
              alimentosDaRefeicao.map((alimento) => (
                <View
                  key={alimento.idLinha}
                  style={estilos.itemAlimento}
                >
                  <View style={estilos.textosAlimento}>
                    <Text style={estilos.nomeAlimento}>
                      {alimento.nome}
                    </Text>

                    <Text style={estilos.porcaoAlimento}>
                      {alimento.porcao} · {alimento.kcal} kcal
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() =>
                      removerAlimento(alimento.idLinha)
                    }
                    hitSlop={10}
                  >
                    <Icone
                      nome="fechar"
                      tamanho={18}
                      cor={cores.textoSecundario}
                    />
                  </TouchableOpacity>
                </View>
              ))
            )}

            {erros.alimentos ? (
              <Text style={estilos.erro}>
                {erros.alimentos}
              </Text>
            ) : null}

            <View style={estilos.totalRefeicao}>
              <View style={estilos.linhaTotal}>
                <Text style={estilos.rotuloTotal}>
                  Total da refeição
                </Text>

                <Text style={estilos.valorTotal}>
                  {formatarNumero(
                    totalDaRefeicao.kcal,
                    0
                  )} kcal
                </Text>
              </View>

              <Text style={estilos.macros}>
                Prot. {formatarNumero(totalDaRefeicao.proteina, 0)} g
                {' · '}
                Carb. {formatarNumero(totalDaRefeicao.carboidrato, 0)} g
                {' · '}
                Gord. {formatarNumero(totalDaRefeicao.gordura, 0)} g
              </Text>

              <Text style={estilos.notaMacros}>
                Valores de exemplo (base TACO).
              </Text>
            </View>
          </View>
        )}

        {/* ETAPA 4 - REVISÃO */}

        {etapa === 4 && (
          <View>
            <Text style={estilos.nomeResumo}>
              {nomeDoPlano}
            </Text>

            <Text style={estilos.detalheResumo}>
              Paciente: {nomePacienteEscolhido}
            </Text>

            <Text style={estilos.detalheResumo}>
              Vigência: {inicio.slice(0, 5)} a {fim.slice(0, 5)}
            </Text>

            <View style={estilos.caixaMeta}>
              <View style={estilos.linhaTotal}>
                <Text style={estilos.rotuloTotal}>
                  Total do dia
                </Text>

                <Text style={estilos.valorTotal}>
                  {formatarNumero(totalDoDia.kcal, 0)} kcal
                </Text>
              </View>

              <Text style={estilos.macros}>
                Meta: {formatarNumero(metaKcalNumero, 0)} kcal
              </Text>

              <Selo
                texto={
                  diferencaDaMeta <= 0.15
                    ? 'Dentro da meta'
                    : 'Longe da meta'
                }
                tom={
                  diferencaDaMeta <= 0.15
                    ? 'sucesso'
                    : 'alerta'
                }
                estilo={estilos.seloMeta}
              />
            </View>

            {nomesDasRefeicoes
              .filter(
                (nome) => refeicoes[nome].length > 0
              )
              .map((nome) => (
                <View
                  key={nome}
                  style={estilos.linhaResumoRefeicao}
                >
                  <View style={estilos.textosAlimento}>
                    <Text style={estilos.nomeAlimento}>
                      {nome}
                    </Text>

                    <Text style={estilos.porcaoAlimento}>
                      {refeicoes[nome]
                        .map((alimento) => alimento.nome)
                        .join(', ')}
                    </Text>
                  </View>

                  <Text style={estilos.kcalResumo}>
                    {formatarNumero(
                      somarAlimentos(refeicoes[nome]).kcal,
                      0
                    )} kcal
                  </Text>
                </View>
              ))}
          </View>
        )}

      </Cartao>
    </Tela>
  );
};

export default CriarPlanoAlimentar;
