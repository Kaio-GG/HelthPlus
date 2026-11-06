// Ficha do paciente, em três abas: Resumo, Avaliações e Evolução.
//
// Saíram as abas "Planos" e "Registros": os planos alimentares e os
// registros de água e refeições foram removidos do produto. No lugar delas
// entrou "Evolução", que é a leitura do histórico de avaliações em
// gráficos — a informação que o nutricionista procura na ficha e que antes
// estava espalhada em um gráfico de peso solto no Resumo.
//
// De onde vêm os dados desta tela:
//   a ficha                GET /api/paciente/:id
//   as avaliações          GET /api/paciente/:id/evolucao
//   as consultas           a agenda do DadosContexto (tabela "consulta")
//
// As avaliações não ficam mais numa lista em memória: eram perdidas ao
// fechar o aplicativo, e o paciente nunca as via no aplicativo dele.
import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import Abas from '../../componentes/Abas';
import Logo from '../../componentes/Logo';
import Selo from '../../componentes/Selo';
import Botao from '../../componentes/Botao';
import Icone from '../../componentes/Icone';
import CaixaAviso from '../../componentes/CaixaAviso';
import GraficoLinha from '../../componentes/GraficoLinha';
import GraficoBarra from '../../componentes/GraficoBarra';
import GraficoPizza from '../../componentes/GraficoPizza';

import { useDados } from '../../contexto/DadosContexto';
import { useDialogo } from '../../contexto/DialogoContexto';
import { useAuth } from '../../contexto/AuthContext';

import {
  obterPaciente,
  excluirPaciente,
  obterEvolucaoDoPaciente,
} from '../../Api/Pacientes';
import { reenviarConviteDoPaciente } from '../../Api/convite';
import { cores } from '../../tema';

import {
  calcularIdadeEmMeses,
  formatarIdade,
  formatarDataBR,
  formatarDataExtensa,
  formatarHora,
} from '../../utilitarios/datas';

import { formatarNumero } from '../../utilitarios/formatos';
import { faixaDaIdade } from '../../utilitarios/oms/faixasOms';
import {
  serieDasAvaliacoes,
  serieDeImcColorida,
  variacaoDoIndicador,
  contagemPorTomNoHistorico,
  MAXIMO_NO_GRAFICO,
} from '../../utilitarios/evolucao';
import { estilos } from './style';

const abasDaFicha = [
  { chave: 'resumo', rotulo: 'Resumo' },
  { chave: 'avaliacoes', rotulo: 'Avaliações' },
  { chave: 'evolucao', rotulo: 'Evolução' },
];

const statusDaConsulta = {
  confirmada: { texto: 'Confirmada', tom: 'sucesso' },
  pendente: { texto: 'Pendente', tom: 'alerta' },
  realizada: { texto: 'Realizada', tom: 'neutro' },
  cancelada: { texto: 'Cancelada', tom: 'erro' },
};

const semStatus = { texto: '—', tom: 'neutro' };

// A seta e a cor da variação de um indicador.
//
// Subir não é bom nem ruim por si: ganhar peso é esperado numa criança em
// crescimento e pode ser o problema num adulto. Por isso aqui a cor é
// neutra, e quem interpreta é o nutricionista.
const setaDaVariacao = (sentido) =>
  sentido === 'subiu' ? '▲' : sentido === 'desceu' ? '▼' : '■';

const FichaPaciente = ({ navigation, route }) => {
  const { recarregarPacientes, consultasDoPaciente } = useDados();
  const { avisar, confirmar } = useDialogo();
  const { token } = useAuth();

  const [aba, setAba] = useState(route.params?.aba || 'resumo');

  const [paciente, setPaciente] = useState(null);
  const [carregandoPaciente, setCarregandoPaciente] = useState(true);
  const [erroPaciente, setErroPaciente] = useState('');

  // Histórico de avaliações, vindo do banco.
  // As séries dos gráficos saem das avaliações (utilitarios/evolucao.js),
  // então o historicoPeso que a API também manda não é usado aqui.
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [carregandoEvolucao, setCarregandoEvolucao] = useState(false);
  const [erroEvolucao, setErroEvolucao] = useState('');

  // Envio do e-mail de acesso do paciente.
  const [enviandoConvite, setEnviandoConvite] = useState(false);
  const [apagando, setApagando] = useState(false);

  const pacienteId = route.params?.pacienteId;

  // Busca a ficha e o histórico de avaliações.
  //
  // É em useFocusEffect, e não em useEffect, porque o nutricionista volta
  // para esta tela depois de salvar uma avaliação: sem recarregar ao ganhar
  // o foco, a avaliação que ele acabou de gravar não apareceria.
  const carregar = useCallback(
    async (estaAtivo = () => true) => {
      if (!pacienteId || !token) {
        if (!estaAtivo()) return;

        setPaciente(null);
        setErroPaciente(
          !pacienteId
            ? 'O identificador do paciente não foi informado.'
            : 'Sessão não encontrada. Entre novamente como nutricionista.'
        );
        setCarregandoPaciente(false);
        return;
      }

      setCarregandoPaciente(true);
      setCarregandoEvolucao(true);
      setErroPaciente('');
      setErroEvolucao('');

      try {
        const dadosPaciente = await obterPaciente(pacienteId, token);

        if (!estaAtivo()) return;

        if (!dadosPaciente) {
          setPaciente(null);
          setErroPaciente('Paciente não encontrado.');
          return;
        }

        // Aceita os nomes de campos usados pela API.
        const normalizado = {
          ...dadosPaciente,
          id: String(
            dadosPaciente.id ?? dadosPaciente.id_paciente ?? dadosPaciente.idBanco ?? ''
          ),
          nome: dadosPaciente.nome ?? dadosPaciente.nm_paciente ?? '',
          nascimento:
            dadosPaciente.nascimento ??
            dadosPaciente.dataNascimento ??
            dadosPaciente.dt_nascimento ??
            '',
          sexo: dadosPaciente.sexo ?? dadosPaciente.sg_sexo ?? '',
          email: dadosPaciente.email ?? dadosPaciente.ds_email ?? '',
          statusAcesso:
            dadosPaciente.statusAcesso ?? dadosPaciente.status_acesso ?? 'sem_convite',
        };

        if (!normalizado.id || !normalizado.nome) {
          setPaciente(null);
          setErroPaciente(
            'A API retornou os dados do paciente em um formato inesperado.'
          );
          return;
        }

        setPaciente(normalizado);
      } catch (erro) {
        if (!estaAtivo()) return;

        setPaciente(null);
        setErroPaciente(erro.message || 'Não foi possível carregar a ficha do paciente.');
      } finally {
        if (estaAtivo()) setCarregandoPaciente(false);
      }

      // A evolução é uma segunda chamada, e de propósito: um erro aqui não
      // pode esconder a ficha inteira. A aba Resumo continua útil sem o
      // histórico, e o erro aparece dentro das abas que o usam.
      try {
        const evolucao = await obterEvolucaoDoPaciente(pacienteId, token);

        if (!estaAtivo()) return;

        setAvaliacoes(Array.isArray(evolucao?.avaliacoes) ? evolucao.avaliacoes : []);
      } catch (erro) {
        if (estaAtivo()) {
          setErroEvolucao(erro.message || 'Não foi possível carregar as avaliações.');
        }
      } finally {
        if (estaAtivo()) setCarregandoEvolucao(false);
      }
    },
    [pacienteId, token]
  );

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      carregar(() => ativo);

      return () => {
        ativo = false;
      };
    }, [carregar])
  );

  // Manda (ou remanda) o e-mail que avisa o paciente de que ele tem acesso.
  //
  // A senha provisória é a data de nascimento dele, então este e-mail não
  // carrega senha nenhuma: ele serve para o paciente DESCOBRIR que tem
  // acesso e com qual e-mail entrar. Quando o paciente foi cadastrado sem
  // o aviso, a API também cria o acesso aqui.
  const enviarAcesso = async () => {
    if (enviandoConvite || !paciente) return;

    try {
      setEnviandoConvite(true);

      const resposta = await reenviarConviteDoPaciente(token, paciente.id);

      // O acesso passa a existir e fica pendente até o paciente entrar.
      setPaciente((atual) =>
        atual ? { ...atual, statusAcesso: 'convite_pendente' } : atual
      );

      avisar({
        titulo: resposta.conviteEnviado ? 'E-mail enviado' : 'E-mail não enviado',
        mensagem: resposta.mensagem,
        tom: resposta.conviteEnviado ? 'sucesso' : 'alerta',
      });
    } catch (erro) {
      avisar({
        titulo: 'Não foi possível enviar',
        mensagem: erro.message || 'Tente de novo em instantes.',
        tom: 'erro',
      });
    } finally {
      setEnviandoConvite(false);
    }
  };

  // Apaga o paciente. Não tem volta, então o aviso diz exatamente o
  // que vai embora antes de perguntar.
  const apagarPaciente = async () => {
    if (apagando || !paciente) return;

    const confirmou = await confirmar({
      titulo: `Apagar ${paciente.nome}?`,
      mensagem:
        'Isto apaga a ficha, as avaliações, as consultas marcadas e o acesso ' +
        'do paciente ao aplicativo. Não é possível desfazer, e libera uma vaga ' +
        'no seu plano.',
      rotuloConfirmar: 'Apagar paciente',
      rotuloCancelar: 'Manter',
      perigo: true,
    });

    if (!confirmou) return;

    try {
      setApagando(true);

      const resposta = await excluirPaciente(paciente.id, token);

      // A lista do contexto é a que conta os pacientes do plano.
      await recarregarPacientes();

      await avisar({
        titulo: 'Paciente apagado',
        mensagem: resposta.mensagem,
        tom: 'sucesso',
      });

      // A ficha que estava aberta não existe mais: volta para a lista.
      navigation.replace('Pacientes');
    } catch (erro) {
      avisar({
        titulo: 'Não foi possível apagar',
        mensagem: erro.message || 'Tente de novo em instantes.',
        tom: 'erro',
      });
    } finally {
      setApagando(false);
    }
  };

  // Mostra o carregamento enquanto a API responde.
  if (carregandoPaciente && !paciente) {
    return (
      <Tela titulo="Paciente" subtitulo="Carregando ficha" direita={<Logo />}>
        <Cartao>
          <ActivityIndicator size="large" color={cores.verdeBotao} />
          <Text style={estilos.vazio}>Buscando os dados do paciente...</Text>
        </Cartao>
      </Tela>
    );
  }

  if (!paciente) {
    return (
      <Tela
        titulo="Paciente"
        subtitulo="Não foi possível abrir a ficha"
        direita={<Logo />}
      >
        <Cartao>
          <Text style={estilos.vazio}>{erroPaciente || 'Paciente não encontrado.'}</Text>
          <Botao
            titulo="Tentar novamente"
            variante="contorno"
            aoPressionar={() => carregar()}
            estilo={estilos.botaoTopo}
          />
        </Cartao>
      </Tela>
    );
  }

  // ---------- Dados derivados ----------

  const idadeEmMeses = paciente.nascimento
    ? calcularIdadeEmMeses(paciente.nascimento)
    : 0;

  const sexoPorExtenso =
    String(paciente.sexo).toUpperCase() === 'F'
      ? 'Feminino'
      : String(paciente.sexo).toUpperCase() === 'M'
        ? 'Masculino'
        : 'Não informado';

  // O que detalharAvaliacao() precisa para refazer o cálculo da OMS.
  const dadosDoPaciente = {
    nome: paciente.nome,
    nascimento: paciente.nascimento,
    sexo: paciente.sexo,
  };

  const consultas = consultasDoPaciente(paciente.id);
  const agora = new Date();

  const proximasConsultas = consultas
    .filter(
      (consulta) =>
        consulta.inicio >= agora &&
        (consulta.status === 'pendente' || consulta.status === 'confirmada')
    )
    .slice(0, 3);

  const consultasPassadas = consultas
    .filter((consulta) => !proximasConsultas.includes(consulta))
    .sort((a, b) => b.inicio - a.inicio);

  // Daqui a calculadora abre direto, sem passar pela escolha da faixa: a
  // data de nascimento do paciente já diz qual referência da OMS vale, e
  // perguntar seria pedir ao nutricionista um dado que a ficha tem.
  //
  // Sem data de nascimento não há como saber a faixa — aí sim a tela de
  // escolha aparece, em vez de a calculadora abrir na referência errada.
  const novaAvaliacao = () => {
    const faixa = faixaDaIdade(calcularIdadeEmMeses(paciente.nascimento));

    if (!faixa) {
      navigation.navigate('FaixaCalculadora', { pacienteId: paciente.id });
      return;
    }

    navigation.navigate('Calculadora', {
      faixa: faixa.chave,
      pacienteId: paciente.id,
    });
  };

  const abrirAvaliacao = (avaliacao) =>
    navigation.navigate('DetalheAvaliacao', {
      avaliacao,
      paciente: dadosDoPaciente,
      perfil: 'nutricionista',
    });

  const marcarConsulta = () =>
    navigation.navigate('NovaConsulta', { pacienteId: paciente.id });

  // ---------- Pedaços que mais de uma aba usa ----------

  const cartaoDeAvaliacao = (avaliacao, indice) => (
    <TouchableOpacity
      key={avaliacao.id ?? `${avaliacao.data}-${indice}`}
      activeOpacity={0.85}
      onPress={() => abrirAvaliacao(avaliacao)}
      accessibilityRole="button"
      accessibilityLabel={`Ver a avaliação de ${avaliacao.data} por extenso`}
    >
      <Cartao estilo={estilos.cartaoAvaliacao}>
        <View style={estilos.linhaTituloGrafico}>
          <Text style={estilos.dataAvaliacao}>{avaliacao.data || 'Sem data'}</Text>

          {avaliacao.naFaixa != null && avaliacao.total != null ? (
            <Selo
              texto={`${avaliacao.naFaixa} de ${avaliacao.total} na faixa`}
              tom={avaliacao.naFaixa === avaliacao.total ? 'sucesso' : 'alerta'}
            />
          ) : null}
        </View>

        {avaliacao.idade ? (
          <Text style={estilos.idadeAvaliacao}>Idade: {avaliacao.idade}</Text>
        ) : null}

        <View style={estilos.linhaMedidas}>
          <View style={estilos.medida}>
            <Text style={estilos.rotuloDado}>Peso</Text>
            <Text style={estilos.valorMedida}>
              {avaliacao.pesoKg != null ? `${formatarNumero(avaliacao.pesoKg)} kg` : '—'}
            </Text>
          </View>

          <View style={estilos.medida}>
            <Text style={estilos.rotuloDado}>Altura</Text>
            <Text style={estilos.valorMedida}>
              {avaliacao.alturaCm != null
                ? `${formatarNumero(avaliacao.alturaCm)} cm`
                : '—'}
            </Text>
          </View>

          <View style={estilos.medida}>
            <Text style={estilos.rotuloDado}>IMC</Text>
            <Text style={estilos.valorMedida}>
              {avaliacao.imc != null ? `${formatarNumero(avaliacao.imc)} kg/m²` : '—'}
            </Text>
          </View>
        </View>

        {/* Sem esta linha nada indicava que o cartão abre. */}
        <View style={estilos.linhaVerDetalhe}>
          <Text style={estilos.verDetalhe}>Ver por extenso</Text>
          <Icone nome="chevron-direita" tamanho={16} cor={cores.verdeLink} />
        </View>
      </Cartao>
    </TouchableOpacity>
  );

  // ---------- Aba Resumo ----------
  const renderizarResumo = () => (
    <View>
      <Cartao>
        <Text style={estilos.tituloCartao}>Dados do paciente</Text>

        <View style={estilos.grade}>
          <View style={estilos.colunaDado}>
            <Text style={estilos.rotuloDado}>Nascimento</Text>
            <Text style={estilos.valorDado}>
              {paciente.nascimento ? formatarDataBR(paciente.nascimento) : '—'}
            </Text>
          </View>

          <View style={estilos.colunaDado}>
            <Text style={estilos.rotuloDado}>Sexo</Text>
            <Text style={estilos.valorDado}>{sexoPorExtenso}</Text>
          </View>

          {/* O telefone saiu da ficha: o cadastro não pede mais, e o que
              estava gravado não é mais mostrado (LGPD). */}
          <View style={estilos.colunaDado}>
            <Text style={estilos.rotuloDado}>Responsável</Text>
            <Text style={estilos.valorDado}>{paciente.responsavel || '—'}</Text>
          </View>

          <View style={estilos.colunaDado}>
            <Text style={estilos.rotuloDado}>Acesso ao app</Text>
            <Selo
              texto={
                paciente.statusAcesso === 'ativo'
                  ? 'Em uso'
                  : paciente.statusAcesso === 'convite_pendente' ||
                      paciente.statusAcesso === 'pendente'
                    ? 'Liberado'
                    : 'Sem acesso'
              }
              tom={paciente.statusAcesso === 'ativo' ? 'sucesso' : 'alerta'}
            />
          </View>
        </View>

        <Text style={estilos.rotuloDado}>E-mail</Text>
        <Text style={estilos.valorDado}>{paciente.email || '—'}</Text>

        {/* Como o paciente entra. É a pergunta que o nutricionista mais
            ouve na consulta, e a resposta não estava em lugar nenhum. */}
        {paciente.statusAcesso !== 'ativo' ? (
          <CaixaAviso
            tom="info"
            estilo={estilos.avisoAcesso}
            texto={`Ele entra com esse e-mail e os oito números da data de nascimento como senha: ${
              paciente.nascimento
                ? formatarDataBR(paciente.nascimento).replace(/\D/g, '')
                : '—'
            }. Dentro do app pode trocá-la.`}
          />
        ) : null}

        {paciente.statusAcesso !== 'ativo' ? (
          <Botao
            titulo={
              enviandoConvite
                ? 'Enviando...'
                : paciente.statusAcesso === 'convite_pendente' ||
                    paciente.statusAcesso === 'pendente'
                  ? 'Reenviar e-mail de acesso'
                  : 'Enviar e-mail de acesso'
            }
            variante="contorno"
            icone="email"
            desabilitado={enviandoConvite}
            aoPressionar={enviarAcesso}
            estilo={estilos.botaoConvite}
          />
        ) : null}
      </Cartao>

      {/* ---------- Consultas deste paciente ---------- */}
      <Cartao>
        <View style={estilos.linhaTituloGrafico}>
          <Text style={estilos.tituloCartao}>Consultas</Text>
          {consultas.length > 0 ? (
            <Selo
              texto={`${consultas.length} ${consultas.length === 1 ? 'marcada' : 'marcadas'}`}
              tom="neutro"
            />
          ) : null}
        </View>

        {proximasConsultas.length === 0 && consultasPassadas.length === 0 ? (
          <Text style={estilos.vazio}>Nenhuma consulta marcada para este paciente.</Text>
        ) : null}

        {proximasConsultas.map((consulta) => {
          const status = statusDaConsulta[consulta.status] ?? semStatus;

          return (
            <View key={consulta.id} style={estilos.linhaConsulta}>
              <View style={estilos.circuloConsulta}>
                <Icone nome="calendario" tamanho={18} cor={cores.verdeEscuro} />
              </View>
              <View style={estilos.dadosConsulta}>
                <Text style={estilos.dataConsulta}>
                  {formatarDataExtensa(consulta.inicio)}
                </Text>
                <Text style={estilos.detalheConsulta}>
                  {formatarHora(consulta.inicio)} · {consulta.tipo}
                </Text>
              </View>
              <Selo texto={status.texto} tom={status.tom} />
            </View>
          );
        })}

        {consultasPassadas.length > 0 ? (
          <Text style={estilos.subtituloLista}>
            {consultasPassadas.length}{' '}
            {consultasPassadas.length === 1 ? 'consulta anterior' : 'consultas anteriores'}
            {consultasPassadas[0]
              ? ` · última em ${formatarDataBR(consultasPassadas[0].inicio)}`
              : ''}
          </Text>
        ) : null}

        <Botao
          titulo="Marcar consulta"
          variante="contorno"
          aoPressionar={marcarConsulta}
          estilo={estilos.botaoConvite}
        />
      </Cartao>

      {/* O gráfico de peso saiu daqui: ele é da aba Evolução, e no Resumo
          duplicava a mesma informação a dois toques de distância. */}

      <Botao
        titulo="Nova avaliação"
        aoPressionar={novaAvaliacao}
        estilo={estilos.botaoTopo}
      />

      {/* Fica por último, e sozinho, para ninguém tocar sem querer. */}
      <Botao
        titulo={apagando ? 'Apagando...' : 'Apagar paciente'}
        variante="perigo"
        desabilitado={apagando}
        aoPressionar={apagarPaciente}
        estilo={estilos.botaoApagar}
      />
    </View>
  );

  // ---------- Aba Avaliações ----------
  const renderizarAvaliacoes = () => (
    <View>
      <Botao titulo="Nova avaliação" aoPressionar={novaAvaliacao} estilo={estilos.botaoTopo} />

      {erroEvolucao ? (
        <CaixaAviso tom="alerta" icone="alerta" texto={erroEvolucao} />
      ) : null}

      {carregandoEvolucao && avaliacoes.length === 0 ? (
        <Cartao>
          <ActivityIndicator color={cores.verdeBotao} />
          <Text style={estilos.vazio}>Buscando as avaliações...</Text>
        </Cartao>
      ) : null}

      {!carregandoEvolucao && avaliacoes.length === 0 && !erroEvolucao ? (
        <Text style={estilos.vazio}>
          Nenhuma avaliação registrada ainda. Toque em Nova avaliação, meça o
          paciente e salve: a avaliação entra aqui e também no aplicativo dele.
        </Text>
      ) : null}

      {avaliacoes.map(cartaoDeAvaliacao)}
    </View>
  );

  // ---------- Aba Evolução ----------
  //
  // Três leituras do mesmo histórico, cada uma no gráfico que a mostra
  // melhor: a linha para o que é contínuo no tempo (peso e altura), a
  // barra para comparar consulta com consulta (o IMC, colorido pela
  // classificação daquele dia) e a rosca para a composição do todo
  // (quantas leituras ficaram adequadas em todo o acompanhamento).
  const renderizarEvolucao = () => {
    const seriePeso = serieDasAvaliacoes(avaliacoes, 'pesoKg');
    const serieAltura = serieDasAvaliacoes(avaliacoes, 'alturaCm');
    const serieImc = serieDeImcColorida(avaliacoes, dadosDoPaciente);

    const variacaoPeso = variacaoDoIndicador(avaliacoes, 'pesoKg');
    const variacaoAltura = variacaoDoIndicador(avaliacoes, 'alturaCm');
    const variacaoImc = variacaoDoIndicador(avaliacoes, 'imc');

    const tons = contagemPorTomNoHistorico(avaliacoes, dadosDoPaciente);
    const totalDeLeituras = tons.reduce((soma, tom) => soma + tom.valor, 0);
    const adequadas = tons[0]?.valor ?? 0;

    // Uma linha por indicador, empilhadas.
    //
    // Antes eram três blocos lado a lado, e no celular cada um ficava com
    // uns 90 px: "+2,73 kg/m²" quebrava no meio e o "17,45 → 20,18" sumia.
    // Em linha, cada indicador tem a largura inteira do cartão — o rótulo à
    // esquerda, o número grande à direita, e o antes/depois embaixo.
    const linhaDeVariacao = (rotulo, variacao, unidade, casas = 1) => (
      <View style={estilos.linhaVariacao}>
        <View style={estilos.topoVariacao}>
          <Text style={estilos.rotuloVariacao}>{rotulo}</Text>

          {variacao ? (
            <Text
              style={[
                estilos.valorVariacao,
                variacao.sentido === 'igual' && estilos.valorVariacaoNeutro,
              ]}
            >
              {setaDaVariacao(variacao.sentido)}{' '}
              {variacao.diferenca > 0 ? '+' : ''}
              {formatarNumero(variacao.diferenca, casas)} {unidade}
            </Text>
          ) : null}
        </View>

        {variacao ? (
          <Text style={estilos.detalheVariacao}>
            {formatarNumero(variacao.primeiro, casas)} {unidade} na primeira
            avaliação, {formatarNumero(variacao.ultimo, casas)} {unidade} agora
          </Text>
        ) : (
          <Text style={estilos.detalheVariacao}>
            Precisa de duas avaliações para comparar.
          </Text>
        )}
      </View>
    );

    if (carregandoEvolucao && avaliacoes.length === 0) {
      return (
        <Cartao>
          <ActivityIndicator size="large" color={cores.verdeBotao} />
          <Text style={estilos.vazio}>Montando a evolução...</Text>
        </Cartao>
      );
    }

    if (avaliacoes.length === 0) {
      return (
        <View>
          {erroEvolucao ? (
            <CaixaAviso tom="alerta" icone="alerta" texto={erroEvolucao} />
          ) : null}

          <Cartao>
            <Text style={estilos.tituloCartao}>Sem histórico ainda</Text>
            <Text style={estilos.vazio}>
              A evolução é montada a partir das avaliações salvas na ficha. Faça a
              primeira avaliação deste paciente e os gráficos aparecem aqui.
            </Text>
            <Botao
              titulo="Fazer a primeira avaliação"
              aoPressionar={novaAvaliacao}
              estilo={estilos.botaoTopo}
            />
          </Cartao>
        </View>
      );
    }

    return (
      <View>
        {/* Quanto mudou entre a PRIMEIRA e a última avaliação — todas elas,
            não só as que couberam nos gráficos abaixo. */}
        <Cartao>
          <View style={estilos.cabecalhoCartao}>
            {/* Curto para caber numa linha ao lado do selo, no celular. */}
            <Text style={estilos.tituloCartao}>Desde a primeira</Text>
            <Selo
              texto={`${avaliacoes.length} ${
                avaliacoes.length === 1 ? 'avaliação' : 'avaliações'
              }`}
              tom="neutro"
            />
          </View>

          {linhaDeVariacao('Peso', variacaoPeso, 'kg')}
          {linhaDeVariacao('Altura', variacaoAltura, 'cm')}
          {linhaDeVariacao('IMC', variacaoImc, 'kg/m²', 2)}
        </Cartao>

        {/* Os três gráficos mostram no máximo as 4 avaliações mais recentes
            (MAXIMO_NO_GRAFICO). Com mais que isso, os rótulos de data
            encavalam no celular. O aviso abaixo diz quantas ficaram de fora,
            para o número não parecer errado a quem fez seis consultas. */}
        {avaliacoes.length > MAXIMO_NO_GRAFICO ? (
          <CaixaAviso
            tom="info"
            estilo={estilos.avisoJanela}
            texto={`Os gráficos mostram as ${MAXIMO_NO_GRAFICO} avaliações mais recentes. As outras ${
              avaliacoes.length - MAXIMO_NO_GRAFICO
            } continuam na aba Avaliações.`}
          />
        ) : null}

        {/* Peso: linha, porque é contínuo no tempo. */}
        {seriePeso.length > 0 ? (
          <Cartao>
            <Text style={estilos.tituloCartao}>Peso (kg)</Text>
            <GraficoLinha pontos={seriePeso} altura={150} />
          </Cartao>
        ) : null}

        {/* Altura: também linha, e nunca deveria descer — uma queda aqui é
            quase sempre erro de medida, e o gráfico deixa isso à vista. */}
        {serieAltura.length > 0 ? (
          <Cartao>
            <Text style={estilos.tituloCartao}>Altura (cm)</Text>
            <GraficoLinha pontos={serieAltura} altura={150} cor={cores.verdeLink} />
            <Text style={estilos.dicaGrafico}>
              A altura só sobe. Um degrau para baixo costuma ser erro de anotação.
            </Text>
          </Cartao>
        ) : null}

        {/* IMC: barra, uma por consulta, com a cor da classificação daquele
            dia. A altura diz o valor, a cor diz se ele estava adequado. */}
        {serieImc.length > 0 ? (
          <Cartao>
            <Text style={estilos.tituloCartao}>IMC por avaliação</Text>
            <GraficoBarra
              pontos={serieImc}
              altura={170}
              sufixo=""
              casas={1}
              zeroNaBase={false}
            />
            <Text style={estilos.dicaGrafico}>
              A cor é a classificação da OMS naquele dia: verde adequado, amarelo
              para acompanhar, vermelho para avaliar. As barras não começam no
              zero — a escala foi aproximada para as diferenças aparecerem.
            </Text>
          </Cartao>
        ) : null}

        {/* Rosca: a composição de todo o acompanhamento. Tocar numa cor da
            legenda abre o balão que explica o que ela quer dizer. */}
        {totalDeLeituras > 0 ? (
          <Cartao>
            <Text style={estilos.tituloCartao}>Classificações</Text>
            <GraficoPizza
              fatias={tons}
              tamanho={130}
              centro={{
                valor: `${Math.round((adequadas / totalDeLeituras) * 100)}%`,
                rotulo: 'adequado',
              }}
            />
            <Text style={estilos.dicaGrafico}>
              Toque numa cor para ver o que ela significa. A conta soma todos os
              indicadores das {avaliacoes.length}{' '}
              {avaliacoes.length === 1 ? 'avaliação' : 'avaliações'} —{' '}
              {totalDeLeituras} {totalDeLeituras === 1 ? 'leitura' : 'leituras'}.
            </Text>
          </Cartao>
        ) : null}

        {/* A lista "avaliação por avaliação" saiu daqui: é exatamente o
            conteúdo da aba Avaliações, ao lado. Esta aba é a leitura do
            conjunto; a outra é a lista. */}
      </View>
    );
  };

  // ---------- Renderização da ficha ----------
  return (
    <Tela
      titulo={paciente.nome}
      subtitulo={`${sexoPorExtenso} · ${formatarIdade(idadeEmMeses)}`}
      // A marca do HealthPlus no canto, como nas outras telas.
      direita={<Logo />}
      aoAtualizar={() => carregar()}
      atualizando={carregandoPaciente || carregandoEvolucao}
    >
      <Abas abas={abasDaFicha} ativa={aba} aoMudar={setAba} />

      {aba === 'resumo' && renderizarResumo()}
      {aba === 'avaliacoes' && renderizarAvaliacoes()}
      {aba === 'evolucao' && renderizarEvolucao()}
    </Tela>
  );
};

export default FichaPaciente;
