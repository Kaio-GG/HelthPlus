// Minha evolução: o histórico de avaliações do paciente, do jeito que o
// nutricionista o vê na ficha — a mesma lista de avaliações e os mesmos
// gráficos, lidos da mesma rota da API.
//
// Tocar numa avaliação abre a tela de detalhe (DetalheAvaliacao), que é a
// mesma que o nutricionista usa: a avaliação por extenso, indicador por
// indicador, como na tela de resultados da calculadora.
//
// Esta tela é a aba "Evolução" da barra de baixo do paciente. Ela entrou
// no lugar de "Registros" (água e refeições), que saiu do produto.
import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import Logo from '../../componentes/Logo';
import Selo from '../../componentes/Selo';
import Icone from '../../componentes/Icone';
import Botao from '../../componentes/Botao';
import CaixaAviso from '../../componentes/CaixaAviso';
import GraficoLinha from '../../componentes/GraficoLinha';
import GraficoBarra from '../../componentes/GraficoBarra';
import GraficoPizza from '../../componentes/GraficoPizza';
import SemSessaoPaciente from '../../componentes/SemSessaoPaciente';

import { useDados } from '../../contexto/DadosContexto';
import { obterMinhaEvolucao } from '../../Api/Pacientes';
import { cores } from '../../tema';
import { formatarNumero } from '../../utilitarios/formatos';
import {
  serieDasAvaliacoes,
  serieDeImcColorida,
  variacaoDoIndicador,
  contagemPorTomNoHistorico,
  MAXIMO_NO_GRAFICO,
} from '../../utilitarios/evolucao';
import { estilos } from './style';

const setaDaVariacao = (sentido) =>
  sentido === 'subiu' ? '▲' : sentido === 'desceu' ? '▼' : '■';

const EvolucaoPaciente = ({ navigation }) => {
  const { pacienteAtual: paciente, tokenPaciente } = useDados();

  const [dadosDoPaciente, setDadosDoPaciente] = useState(null);
  const [historicoPeso, setHistoricoPeso] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  // Busca os dados da evolução usando o token do paciente autenticado.
  const carregarEvolucao = useCallback(
    async (estaAtivo = () => true) => {
      if (!tokenPaciente) {
        setHistoricoPeso([]);
        setAvaliacoes([]);
        setErro('Sua sessão de paciente não foi encontrada. Entre novamente.');
        setCarregando(false);
        return;
      }

      try {
        setCarregando(true);
        setErro('');

        const resultado = await obterMinhaEvolucao(tokenPaciente);

        // Evita atualizar a tela depois que ela perde o foco.
        if (!estaAtivo()) return;

        setHistoricoPeso(
          Array.isArray(resultado?.historicoPeso) ? resultado.historicoPeso : []
        );

        setAvaliacoes(Array.isArray(resultado?.avaliacoes) ? resultado.avaliacoes : []);

        // A data de nascimento e o sexo vêm junto: é com eles que a tela de
        // detalhe refaz o cálculo da OMS e mostra o escore-z de cada
        // indicador. O que vem da API ganha do que está na sessão, que pode
        // ter sido montado no login com menos campos.
        setDadosDoPaciente(resultado?.paciente || null);
      } catch (e) {
        if (estaAtivo()) {
          setErro(e.message || 'Não foi possível carregar sua evolução.');
        }
      } finally {
        if (estaAtivo()) setCarregando(false);
      }
    },
    [tokenPaciente]
  );

  // Atualiza a evolução sempre que o paciente abrir esta tela.
  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      carregarEvolucao(() => ativo);

      return () => {
        ativo = false;
      };
    }, [carregarEvolucao])
  );

  if (!paciente) return <SemSessaoPaciente />;

  // Para a tela de detalhe: o que veio da API, com a sessão como reserva.
  const pacienteParaCalculo = {
    nome: dadosDoPaciente?.nome ?? paciente.nome,
    nascimento: dadosDoPaciente?.nascimento ?? paciente.nascimento,
    sexo: dadosDoPaciente?.sexo ?? paciente.sexo,
  };

  const seriePeso = serieDasAvaliacoes(avaliacoes, 'pesoKg');
  const serieAltura = serieDasAvaliacoes(avaliacoes, 'alturaCm');
  const serieImc = serieDeImcColorida(avaliacoes, pacienteParaCalculo);

  const variacaoPeso = variacaoDoIndicador(avaliacoes, 'pesoKg');
  const variacaoAltura = variacaoDoIndicador(avaliacoes, 'alturaCm');
  const variacaoImc = variacaoDoIndicador(avaliacoes, 'imc');

  // O "true" pede as descrições escritas PARA O PACIENTE: as do
  // nutricionista falam em escore-z e conduta, que não ajudam aqui.
  const tons = contagemPorTomNoHistorico(avaliacoes, pacienteParaCalculo, true);
  const totalDeLeituras = tons.reduce((soma, tom) => soma + tom.valor, 0);
  const adequadas = tons[0]?.valor ?? 0;

  const ultimoPeso = historicoPeso.length
    ? Number(historicoPeso[historicoPeso.length - 1].valor)
    : null;

  const abrirAvaliacao = (avaliacao) =>
    navigation.navigate('DetalheAvaliacao', {
      avaliacao,
      paciente: pacienteParaCalculo,
      perfil: 'paciente',
    });

  // Uma linha por indicador, empilhadas.
  //
  // Eram três blocos lado a lado, e num celular de 375 px cada um ficava
  // com menos de 100: "+11,5 kg" quebrava em duas linhas e o "30,4 → 41,9
  // kg" em três. Em linha, cada indicador tem a largura inteira do cartão.
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
            {setaDaVariacao(variacao.sentido)} {variacao.diferenca > 0 ? '+' : ''}
            {formatarNumero(variacao.diferenca, casas)} {unidade}
          </Text>
        ) : null}
      </View>

      {variacao ? (
        <Text style={estilos.detalheVariacao}>
          {formatarNumero(variacao.primeiro, casas)} {unidade} na primeira consulta,{' '}
          {formatarNumero(variacao.ultimo, casas)} {unidade} agora
        </Text>
      ) : (
        <Text style={estilos.detalheVariacao}>
          Precisa de duas consultas para comparar.
        </Text>
      )}
    </View>
  );

  // Um cartão por avaliação, igual ao da ficha do nutricionista: a data, a
  // contagem de indicadores adequados, as três medidas e o toque que abre
  // a leitura por extenso.
  const cartaoDeAvaliacao = (avaliacao, indice) => (
    <TouchableOpacity
      key={avaliacao.id ?? `${avaliacao.data}-${indice}`}
      activeOpacity={0.85}
      onPress={() => abrirAvaliacao(avaliacao)}
      accessibilityRole="button"
      accessibilityLabel={`Ver a avaliação de ${avaliacao.data} por extenso`}
    >
      <Cartao estilo={estilos.cartaoAvaliacao}>
        <View style={estilos.linhaTitulo}>
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

        <View style={estilos.linhaVerDetalhe}>
          <Text style={estilos.verDetalhe}>Ver por extenso</Text>
          <Icone nome="chevron-direita" tamanho={16} cor={cores.verdeLink} />
        </View>
      </Cartao>
    </TouchableOpacity>
  );

  return (
    <Tela
      titulo="Minha evolução"
      subtitulo="O que o seu nutricionista mediu em cada consulta"
      // Com a seta de voltar, mesmo sendo uma aba da barra de baixo: o
      // paciente chega aqui pelo atalho da tela inicial com a mesma
      // frequência com que chega pela barra, e sem a seta ele fica sem
      // caminho de volta no meio da leitura.
      aoVoltar={() => navigation.replace('HomePaciente')}
      abaAtiva="evolucao"
      perfilBarra="paciente"
      direita={<Logo />}
      aoAtualizar={() => carregarEvolucao()}
      atualizando={carregando}
    >
      {carregando && avaliacoes.length === 0 ? (
        <Cartao>
          <ActivityIndicator size="large" color={cores.verdeBotao} />
          <Text style={estilos.vazio}>Carregando sua evolução...</Text>
        </Cartao>
      ) : null}

      {erro && !carregando ? (
        <Cartao>
          <Text style={estilos.vazio}>Não foi possível carregar os dados.</Text>
          <Text style={estilos.vazioDetalhe}>{erro}</Text>
          <Botao
            titulo="Tentar novamente"
            variante="contorno"
            aoPressionar={() => carregarEvolucao()}
            estilo={estilos.botaoTentar}
          />
        </Cartao>
      ) : null}

      {!carregando && !erro && avaliacoes.length === 0 ? (
        <Cartao>
          <Text style={estilos.tituloCartao}>Sua evolução começa na próxima consulta</Text>
          <Text style={estilos.vazioDetalhe}>
            Quando o seu nutricionista medir você e salvar a avaliação, ela aparece
            aqui — com o peso, a altura, o IMC e a leitura de cada indicador.
          </Text>
        </Cartao>
      ) : null}

      {avaliacoes.length > 0 ? (
        <>
          {/* Quanto mudou da primeira consulta até agora. */}
          <Cartao>
            <View style={estilos.cabecalhoCartao}>
              {/* Título curto de propósito: "Da primeira consulta até
                  agora" quebrava em duas linhas e empurrava o selo. */}
              <Text style={estilos.tituloCartao}>Desde a primeira</Text>
              <Selo
                texto={`${avaliacoes.length} ${
                  avaliacoes.length === 1 ? 'consulta' : 'consultas'
                }`}
                tom="neutro"
              />
            </View>

            {linhaDeVariacao('Peso', variacaoPeso, 'kg')}
            {linhaDeVariacao('Altura', variacaoAltura, 'cm')}
            {linhaDeVariacao('IMC', variacaoImc, 'kg/m²', 2)}
          </Cartao>

          {/* Os gráficos mostram no máximo as 4 consultas mais recentes
              (MAXIMO_NO_GRAFICO): com mais, os rótulos de data encavalam
              no celular. O aviso diz quantas ficaram de fora. */}
          {avaliacoes.length > MAXIMO_NO_GRAFICO ? (
            <CaixaAviso
              tom="info"
              estilo={estilos.avisoJanela}
              texto={`Os gráficos mostram as ${MAXIMO_NO_GRAFICO} consultas mais recentes. As outras ${
                avaliacoes.length - MAXIMO_NO_GRAFICO
              } continuam na lista abaixo.`}
            />
          ) : null}

          {/* Peso: linha. */}
          {seriePeso.length > 0 ? (
            <Cartao>
              <View style={estilos.linhaTitulo}>
                <Text style={estilos.tituloCartao}>Peso (kg)</Text>
                {ultimoPeso !== null ? (
                  <Text style={estilos.pesoAtual}>{formatarNumero(ultimoPeso)} kg</Text>
                ) : null}
              </View>
              <GraficoLinha pontos={seriePeso} altura={150} sufixo="kg" />
            </Cartao>
          ) : null}

          {/* Altura: linha também. */}
          {serieAltura.length > 0 ? (
            <Cartao>
              <Text style={estilos.tituloCartao}>Altura (cm)</Text>
              <GraficoLinha pontos={serieAltura} altura={150} cor={cores.verdeLink} sufixo="cm" />
            </Cartao>
          ) : null}

          {/* IMC: uma barra por consulta, colorida pela classificação. */}
          {serieImc.length > 0 ? (
            <Cartao>
              <Text style={estilos.tituloCartao}>IMC em cada consulta</Text>
              <GraficoBarra pontos={serieImc} altura={170} zeroNaBase={false} />
              <Text style={estilos.dicaGrafico}>
                A cor é a classificação da OMS naquele dia: verde adequado, amarelo
                para acompanhar, vermelho para avaliar com o nutricionista.
              </Text>
            </Cartao>
          ) : null}

          {/* Rosca: a composição de tudo o que já foi medido. Tocar numa
              cor da legenda abre o balão que explica o que ela quer dizer —
              "Acompanhar" não significa nada para quem não é da área. */}
          {totalDeLeituras > 0 ? (
            <Cartao>
              <Text style={estilos.tituloCartao}>Tudo o que já foi medido</Text>
              <GraficoPizza
                fatias={tons}
                tamanho={130}
                centro={{
                  valor: `${Math.round((adequadas / totalDeLeituras) * 100)}%`,
                  rotulo: 'adequado',
                }}
              />
              <Text style={estilos.dicaGrafico}>
                Toque numa cor para ver o que ela significa.
              </Text>
            </Cartao>
          ) : null}

          <Text style={estilos.tituloLista}>Consulta por consulta</Text>
          {avaliacoes.map(cartaoDeAvaliacao)}

          <CaixaAviso
            tom="info"
            estilo={estilos.avisoRodape}
            texto="Estes números são anotados pelo seu nutricionista na consulta. Nenhum deles é diagnóstico: quem lê o conjunto é ele."
          />
        </>
      ) : null}
    </Tela>
  );
};

export default EvolucaoPaciente;
