
 // Evolução do paciente: histórico de peso e avaliações vindos da API.
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import Selo from '../../componentes/Selo';
import Icone from '../../componentes/Icone';
import GraficoLinha from '../../componentes/GraficoLinha';
import SemSessaoPaciente from '../../componentes/SemSessaoPaciente';

import { useDados } from '../../contexto/DadosContexto';
import { obterMinhaEvolucao } from '../../Api/Pacientes';
import { cores } from '../../tema';
import { formatarNumero } from '../../utilitarios/formatos';
import { estilos } from './style';

const EvolucaoPaciente = () => {
  const { pacienteAtual: paciente, tokenPaciente } = useDados();

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
        setErro(
          'Sua sessão de paciente não foi encontrada. Entre novamente.'
        );
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
          Array.isArray(resultado?.historicoPeso)
            ? resultado.historicoPeso
            : []
        );

        setAvaliacoes(
          Array.isArray(resultado?.avaliacoes)
            ? resultado.avaliacoes
            : []
        );
      } catch (e) {
        if (estaAtivo()) {
          setErro(
            e.message || 'Não foi possível carregar sua evolução.'
          );
        }
      } finally {
        if (estaAtivo()) {
          setCarregando(false);
        }
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

  // Não exibe os dados se não houver paciente na sessão.
  if (!paciente) {
    return <SemSessaoPaciente />;
  }

  // Identifica o registro de peso mais recente.
  const ultimoRegistroPeso =
    historicoPeso.length > 0
      ? historicoPeso[historicoPeso.length - 1]
      : null;

  const valorPesoAtual = ultimoRegistroPeso
    ? Number(
        ultimoRegistroPeso.valor ??
          ultimoRegistroPeso.pesoKg ??
          ultimoRegistroPeso.peso
      )
    : NaN;

  const pesoAtual = Number.isFinite(valorPesoAtual)
    ? valorPesoAtual
    : null;

  // Permite realizar uma nova tentativa sem duplicar a lógica da API.
  const tentarNovamente = () => {
    carregarEvolucao();
  };

  return (
    <Tela
      titulo="Minha evolução"
      subtitulo="Acompanhe seu progresso e suas avaliações"
    >
      {carregando && (
        <Cartao>
          <ActivityIndicator
            size="large"
            color={cores.primaria}
          />

          <Text style={estilos.vazio}>
            Carregando sua evolução...
          </Text>
        </Cartao>
      )}

      {!!erro && !carregando && (
        <Cartao>
          <Text style={estilos.vazio}>
            Não foi possível carregar os dados.
          </Text>

          <Text style={estilos.vazioDetalhe}>
            {erro}
          </Text>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Tentar carregar a evolução novamente"
            onPress={tentarNovamente}
            style={{
              marginTop: 16,
              padding: 12,
              borderRadius: 10,
              backgroundColor: cores.primaria,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: '#FFFFFF',
                fontWeight: '600',
              }}
            >
              Tentar novamente
            </Text>
          </TouchableOpacity>
        </Cartao>
      )}

      {!carregando && !erro && (
        <>
          <Cartao>
            <View style={estilos.linhaTitulo}>
              <Text style={estilos.tituloCartao}>
                Evolução do peso
              </Text>

              {pesoAtual !== null && (
                <Text style={estilos.pesoAtual}>
                  {formatarNumero(pesoAtual)} kg
                </Text>
              )}
            </View>

            {historicoPeso.length > 0 ? (
              <GraficoLinha pontos={historicoPeso} />
            ) : (
              <View style={estilos.caixaVazia}>
                <Text style={estilos.vazio}>
                  Ainda não há registros de peso.
                </Text>

                <Text style={estilos.vazioDetalhe}>
                  Quando seu nutricionista registrar sua evolução,
                  os dados aparecerão aqui.
                </Text>
              </View>
            )}
          </Cartao>

          <Text style={estilos.tituloLista}>
            Avaliações
          </Text>

          {avaliacoes.length === 0 ? (
            <View style={estilos.caixaVazia}>
              <Text style={estilos.vazio}>
                Nenhuma avaliação registrada ainda.
              </Text>

              <Text style={estilos.vazioDetalhe}>
                As avaliações realizadas pelo seu nutricionista
                aparecerão nesta seção.
              </Text>
            </View>
          ) : (
            avaliacoes.map((avaliacao, indice) => {
              const peso = avaliacao.pesoKg ?? avaliacao.peso;
              const altura =
                avaliacao.alturaCm ?? avaliacao.altura;
              const imc = avaliacao.imc;
              const naFaixa = avaliacao.naFaixa;
              const total = avaliacao.total;

              return (
                <Cartao
                  key={
                    avaliacao.id ??
                    `${avaliacao.data ?? 'avaliacao'}-${indice}`
                  }
                >
                  <View style={estilos.linhaTitulo}>
                    <Text style={estilos.dataAvaliacao}>
                      {avaliacao.data ||
                        avaliacao.dataAvaliacao ||
                        'Data não informada'}
                    </Text>

                    {naFaixa != null && total != null && (
                      <Selo
                        texto={`${naFaixa} de ${total} na faixa`}
                        tom={
                          naFaixa === total
                            ? 'sucesso'
                            : 'alerta'
                        }
                      />
                    )}
                  </View>

                  {avaliacao.idade != null && (
                    <Text style={estilos.idadeAvaliacao}>
                      Idade: {avaliacao.idade}
                    </Text>
                  )}

                  <View style={estilos.linhaMedidas}>
                    <View style={estilos.medida}>
                      <Text style={estilos.rotuloDado}>
                        Peso
                      </Text>

                      <Text style={estilos.valorMedida}>
                        {peso != null
                          ? `${formatarNumero(peso)} kg`
                          : 'Não informado'}
                      </Text>
                    </View>

                    <View style={estilos.medida}>
                      <Text style={estilos.rotuloDado}>
                        Altura
                      </Text>

                      <Text style={estilos.valorMedida}>
                        {altura != null
                          ? `${formatarNumero(altura)} cm`
                          : 'Não informada'}
                      </Text>
                    </View>

                    <View style={estilos.medida}>
                      <Text style={estilos.rotuloDado}>
                        IMC
                      </Text>

                      <Text style={estilos.valorMedida}>
                        {imc != null
                          ? `${formatarNumero(imc)} kg/m²`
                          : 'Não informado'}
                      </Text>
                    </View>
                  </View>
                </Cartao>
              );
            })
          )}

          <View style={estilos.rodapeSomenteLeitura}>
            <Icone
              nome="cadeado"
              tamanho={14}
              cor={cores.textoSecundario}
            />

            <Text style={estilos.textoSomenteLeitura}>
              Somente leitura: avaliações feitas pelo seu nutricionista.
            </Text>
          </View>
        </>
      )}
    </Tela>
  );
};

export default EvolucaoPaciente;
