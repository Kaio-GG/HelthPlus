// Tela inicial do paciente: a última avaliação, a próxima consulta, a
// dica do dia e os atalhos.
//
// O que saiu daqui:
//   o cartão "Hoje" com a meta de água e as refeições do dia, e o botão
//   "Registrar agora" — o registro de água e de comida foi removido do
//   produto, junto com o "Meu plano".
//
// O que entrou no lugar: o resumo da última avaliação (o dado que o
// paciente realmente quer ver ao abrir o aplicativo), a dica do dia e o
// atalho para a tela de conteúdo. Nada disso depende de registro nenhum.
import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Logo from '../../componentes/Logo';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import Icone from '../../componentes/Icone';
import Selo from '../../componentes/Selo';
import Botao from '../../componentes/Botao';
import CaixaAviso from '../../componentes/CaixaAviso';
import GraficoLinha from '../../componentes/GraficoLinha';
import SemSessaoPaciente from '../../componentes/SemSessaoPaciente';

import { useDados } from '../../contexto/DadosContexto';
import { obterMinhaEvolucao } from '../../Api/Pacientes';
import { cores } from '../../tema';
import { formatarDataExtensa, formatarHora } from '../../utilitarios/datas';
import { formatarNumero } from '../../utilitarios/formatos';
import { dicaDeHoje } from '../../dados/conteudoSaude';
import { serieDasAvaliacoes, variacaoDoIndicador } from '../../utilitarios/evolucao';
import { estilos } from './style';

// "aba: true" = destino é uma aba da barra inferior (troca de tela em vez
// de empilhar uma nova).
const atalhos = [
  {
    chave: 'evolucao',
    rotulo: 'Minha evolução',
    icone: 'grafico',
    rota: 'EvolucaoPaciente',
    aba: true,
  },
  {
    chave: 'consultas',
    rotulo: 'Minhas consultas',
    icone: 'calendario',
    rota: 'AgendaPaciente',
    aba: true,
  },
  { chave: 'dicas', rotulo: 'Saúde e dicas', icone: 'info', rota: 'Dicas' },
];

const statusDaConsulta = {
  confirmada: { texto: 'Confirmada', tom: 'sucesso' },
  pendente: { texto: 'Aguardando confirmação', tom: 'alerta' },
  realizada: { texto: 'Realizada', tom: 'neutro' },
  cancelada: { texto: 'Cancelada', tom: 'erro' },
};

const semStatus = { texto: '—', tom: 'neutro' };

const HomePaciente = ({ navigation }) => {
  const {
    pacienteAtual: paciente,
    consultas,
    tokenPaciente,
    senhaProvisoria,
  } = useDados();

  // Só as avaliações: o gráfico desta tela é montado a partir delas
  // (serieDasAvaliacoes), e não do historicoPeso que a API também manda.
  const [avaliacoes, setAvaliacoes] = useState([]);

  // A última avaliação vem da mesma rota que alimenta "Minha evolução".
  // Um erro aqui não mostra nada: a tela inicial não é o lugar de explicar
  // falha de rede, e a tela de evolução já faz isso com botão de tentar
  // de novo.
  const carregar = useCallback(
    async (estaAtivo = () => true) => {
      if (!tokenPaciente) return;

      try {
        const resultado = await obterMinhaEvolucao(tokenPaciente);

        if (!estaAtivo()) return;

        setAvaliacoes(Array.isArray(resultado?.avaliacoes) ? resultado.avaliacoes : []);
      } catch {
        // Silencioso de propósito (ver o comentário acima).
      }
    },
    [tokenPaciente]
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

  if (!paciente) return <SemSessaoPaciente />;

  const agora = new Date();

  // A lista vem da API já ordenada e sem as canceladas, mas filtrar aqui
  // mantém a tela correta se isso mudar do outro lado.
  const proximaConsulta = consultas
    .filter(
      (consulta) =>
        consulta.inicio >= agora &&
        (consulta.status === 'pendente' || consulta.status === 'confirmada')
    )
    .sort((a, b) => a.inicio - b.inicio)[0];

  // A avaliação mais recente é a primeira da lista (a API devolve da mais
  // nova para a mais antiga).
  const ultimaAvaliacao = avaliacoes[0] ?? null;
  const variacaoPeso = variacaoDoIndicador(avaliacoes, 'pesoKg');
  const seriePeso = serieDasAvaliacoes(avaliacoes, 'pesoKg');

  const abrir = (atalho) =>
    atalho.aba ? navigation.replace(atalho.rota) : navigation.navigate(atalho.rota);

  const statusConsulta = proximaConsulta
    ? (statusDaConsulta[proximaConsulta.status] ?? semStatus)
    : null;

  return (
    <Tela
      titulo={`Olá, ${paciente.nome.split(' ')[0]}`}
      subtitulo="Acompanhe a sua evolução e as suas consultas."
      mostrarVoltar={false}
      cabecalhoRolavel
      // A marca do HealthPlus no canto. Antes era um ícone genérico de
      // pessoa dentro de um anel, que não dizia em qual aplicativo a
      // pessoa estava.
      direita={<Logo />}
      abaAtiva="inicio"
      perfilBarra="paciente"
      aoAtualizar={() => carregar()}
    >
      {/* Quem entrou com a data de nascimento ainda está com a senha que
          qualquer um poderia adivinhar. O aviso sai da tela assim que ele
          troca (o contexto guarda isso). */}
      {senhaProvisoria ? (
        <Cartao estilo={estilos.cartaoSenha}>
          <View style={estilos.linhaSenha}>
            <Icone nome="cadeado" tamanho={18} cor={cores.alertaTexto} />
            <Text style={estilos.tituloSenha}>Você está usando a senha provisória</Text>
          </View>
          <Text style={estilos.textoSenha}>
            A sua senha é a sua data de nascimento, que é fácil de adivinhar.
            Escolha uma senha só sua — leva meio minuto.
          </Text>
          <Botao
            titulo="Trocar a minha senha"
            variante="contorno"
            aoPressionar={() => navigation.navigate('AlterarSenhaPaciente')}
            estilo={estilos.botaoSenha}
          />
        </Cartao>
      ) : null}

      {/* ---------- A última avaliação ---------- */}
      <Cartao>
        <View style={estilos.linhaTitulo}>
          <Text style={estilos.tituloCartao}>Última avaliação</Text>
          {ultimaAvaliacao?.data ? (
            <Selo texto={ultimaAvaliacao.data} tom="neutro" />
          ) : null}
        </View>

        {ultimaAvaliacao ? (
          <>
            <View style={estilos.linhaMedidas}>
              <View style={estilos.medida}>
                <Text style={estilos.rotuloMedida}>Peso</Text>
                <Text style={estilos.valorMedida}>
                  {ultimaAvaliacao.pesoKg != null
                    ? `${formatarNumero(ultimaAvaliacao.pesoKg)} kg`
                    : '—'}
                </Text>
              </View>
              <View style={estilos.medida}>
                <Text style={estilos.rotuloMedida}>Altura</Text>
                <Text style={estilos.valorMedida}>
                  {ultimaAvaliacao.alturaCm != null
                    ? `${formatarNumero(ultimaAvaliacao.alturaCm)} cm`
                    : '—'}
                </Text>
              </View>
              <View style={estilos.medida}>
                <Text style={estilos.rotuloMedida}>IMC</Text>
                <Text style={estilos.valorMedida}>
                  {ultimaAvaliacao.imc != null
                    ? formatarNumero(ultimaAvaliacao.imc)
                    : '—'}
                </Text>
              </View>
            </View>

            {variacaoPeso ? (
              <Text style={estilos.variacao}>
                Desde a primeira consulta:{' '}
                <Text style={estilos.variacaoForte}>
                  {variacaoPeso.diferenca > 0 ? '+' : ''}
                  {formatarNumero(variacaoPeso.diferenca)} kg
                </Text>{' '}
                em {variacaoPeso.medicoes} medições.
              </Text>
            ) : null}

            {seriePeso.length > 1 ? <GraficoLinha pontos={seriePeso} altura={110} /> : null}

            <Botao
              titulo="Ver a minha evolução"
              variante="contorno"
              aoPressionar={() => navigation.replace('EvolucaoPaciente')}
              estilo={estilos.botaoCartao}
            />
          </>
        ) : (
          <View style={estilos.caixaVazia}>
            <View style={estilos.circuloVazio}>
              <Icone nome="grafico" tamanho={24} cor={cores.verdeLink} />
            </View>
            <Text style={estilos.vazio}>Nenhuma avaliação ainda.</Text>
            <Text style={estilos.vazioDetalhe}>
              Na sua próxima consulta, o nutricionista mede você e os resultados
              aparecem aqui.
            </Text>
          </View>
        )}
      </Cartao>

      {/* ---------- Próxima consulta ---------- */}
      <Cartao>
        <Text style={estilos.tituloCartao}>Próxima consulta</Text>

        {proximaConsulta ? (
          <>
            <View style={estilos.linhaConsulta}>
              <View style={estilos.circuloConsulta}>
                <Icone nome="calendario" tamanho={22} cor={cores.verdeEscuro} />
              </View>
              <View style={estilos.dadosConsulta}>
                <Text style={estilos.dataConsulta}>
                  {formatarDataExtensa(proximaConsulta.inicio)}
                </Text>
                <Text style={estilos.detalheConsulta}>
                  {formatarHora(proximaConsulta.inicio)} · {proximaConsulta.tipo}
                </Text>
              </View>
              <Selo texto={statusConsulta.texto} tom={statusConsulta.tom} />
            </View>

            {proximaConsulta.status === 'pendente' ? (
              <Botao
                titulo="Confirmar a minha presença"
                variante="contorno"
                aoPressionar={() => navigation.replace('AgendaPaciente')}
                estilo={estilos.botaoCartao}
              />
            ) : null}
          </>
        ) : (
          <View style={estilos.caixaVazia}>
            <View style={estilos.circuloVazio}>
              <Icone nome="calendario" tamanho={24} cor={cores.verdeLink} />
            </View>
            <Text style={estilos.vazio}>Nenhuma consulta marcada.</Text>
            <Text style={estilos.vazioDetalhe}>
              Seu nutricionista marca as consultas e avisa você por aqui.
            </Text>
          </View>
        )}
      </Cartao>

      {/* ---------- Dica do dia ---------- */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate('Dicas')}
        accessibilityRole="button"
        accessibilityLabel="Abrir a tela de saúde e dicas"
      >
        <Cartao estilo={estilos.cartaoDica}>
          <View style={estilos.linhaDica}>
            <View style={estilos.circuloDica}>
              <Icone nome="info" tamanho={18} cor={cores.verdeEscuro} />
            </View>
            <Text style={estilos.rotuloDica}>Dica de hoje</Text>
            <Icone nome="chevron-direita" tamanho={16} cor={cores.verdeLink} />
          </View>
          <Text style={estilos.textoDica}>{dicaDeHoje()}</Text>
        </Cartao>
      </TouchableOpacity>

      {/* ---------- Atalhos ---------- */}
      <Cartao>
        <Text style={estilos.tituloCartao}>Acesso rápido</Text>
        <View style={estilos.linhaAtalhos}>
          {atalhos.map((atalho) => (
            <TouchableOpacity
              key={atalho.chave}
              style={estilos.atalho}
              onPress={() => abrir(atalho)}
              activeOpacity={0.8}
            >
              <View style={estilos.circuloAtalho}>
                <Icone nome={atalho.icone} tamanho={28} cor={cores.verdeEscuro} />
              </View>
              <Text style={estilos.rotuloAtalho}>{atalho.rotulo}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Cartao>

      <CaixaAviso
        tom="info"
        texto="As medidas que você vê aqui são as que o seu nutricionista anotou nas consultas. Para corrigir alguma informação, fale com ele."
      />
    </Tela>
  );
};

export default HomePaciente;
