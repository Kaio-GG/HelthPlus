// Consultas do paciente: próximas e anteriores.
//
// A lista vem do banco (GET /api/consulta/minhas), pelo token do paciente.
// Ele pode confirmar a presença numa consulta que está pendente; cancelar
// não é dele — quem desmarca é o nutricionista, e a API não tem rota de
// cancelamento pelo paciente. Antes a tela oferecia "cancelar consulta" e
// só mexia numa lista em memória: o nutricionista nunca ficava sabendo.
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import Selo from '../../componentes/Selo';
import CaixaAviso from '../../componentes/CaixaAviso';
import SemSessaoPaciente from '../../componentes/SemSessaoPaciente';
import { useDados } from '../../contexto/DadosContexto';
import { useDialogo } from '../../contexto/DialogoContexto';
import { formatarDataExtensa, formatarHora } from '../../utilitarios/datas';
import { estilos } from './style';

// O texto do selo é curto de propósito: num celular de 375 px,
// "Aguardando confirmação" sozinho comia metade do cartão e empurrava a
// data para três linhas. A explicação completa fica no toque.
const statusDaConsulta = {
  confirmada: { texto: 'Confirmada', tom: 'sucesso' },
  pendente: { texto: 'A confirmar', tom: 'alerta' },
  realizada: { texto: 'Realizada', tom: 'neutro' },
  cancelada: { texto: 'Cancelada', tom: 'erro' },
};

const semStatus = { texto: '—', tom: 'neutro' };

const AgendaPaciente = ({ navigation }) => {
  const {
    pacienteAtual: paciente,
    consultas,
    confirmarMinhaConsulta,
    recarregarConsultas,
    carregandoConsultas,
  } = useDados();

  const { avisar, confirmar } = useDialogo();
  const [confirmando, setConfirmando] = useState(null);

  if (!paciente) return <SemSessaoPaciente />;

  const inicioDeHoje = new Date();
  inicioDeHoje.setHours(0, 0, 0, 0);

  const proximas = consultas
    .filter(
      (consulta) =>
        consulta.inicio >= inicioDeHoje &&
        (consulta.status === 'pendente' || consulta.status === 'confirmada')
    )
    .sort((a, b) => a.inicio - b.inicio);

  const anteriores = consultas
    .filter((consulta) => !proximas.includes(consulta))
    .sort((a, b) => b.inicio - a.inicio);

  // Confirmar a presença grava no banco: é assim que o nutricionista vê a
  // confirmação na agenda dele.
  const confirmarPresenca = async (consulta) => {
    if (confirmando) return;

    const querConfirmar = await confirmar({
      titulo: 'Confirmar presença?',
      mensagem: `${consulta.tipo} em ${formatarDataExtensa(consulta.inicio)} às ${formatarHora(consulta.inicio)}.`,
      rotuloConfirmar: 'Confirmar',
      rotuloCancelar: 'Agora não',
    });

    if (!querConfirmar) return;

    try {
      setConfirmando(consulta.id);

      await confirmarMinhaConsulta(consulta.idBanco ?? consulta.id);

      avisar({
        titulo: 'Presença confirmada',
        mensagem: 'Seu nutricionista já está vendo a confirmação.',
        tom: 'sucesso',
      });
    } catch (erro) {
      avisar({
        titulo: 'Não foi possível confirmar',
        mensagem: erro.message || 'Tente de novo em instantes.',
        tom: 'erro',
      });
    } finally {
      setConfirmando(null);
    }
  };

  const renderizarConsulta = (consulta, podeConfirmar) => {
    const fim = new Date(consulta.inicio.getTime() + consulta.duracao * 60000);
    const status = statusDaConsulta[consulta.status] ?? semStatus;
    const pendente = podeConfirmar && consulta.status === 'pendente';

    return (
      <TouchableOpacity
        key={consulta.id}
        activeOpacity={0.85}
        disabled={!pendente}
        onPress={() => confirmarPresenca(consulta)}
        accessibilityRole={pendente ? 'button' : undefined}
        accessibilityLabel={
          pendente ? `Confirmar presença em ${formatarDataExtensa(consulta.inicio)}` : undefined
        }
      >
        {/* Duas linhas, e não quatro colunas.
            
            A versão anterior punha hora, data, tipo e selo lado a lado:
            num celular estreito a data saía em três linhas e o tipo ficava
            espremido. Agora o horário e a data dividem a primeira linha, e
            o selo desce para a segunda, onde tem largura de sobra. */}
        <Cartao estilo={estilos.itemConsulta}>
          <View style={estilos.barraLateral} />

          <View style={estilos.corpoConsulta}>
            <View style={estilos.linhaPrincipal}>
              <View style={estilos.colunaHorario}>
                <Text style={estilos.horaInicio}>{formatarHora(consulta.inicio)}</Text>
                <Text style={estilos.horaFim}>{formatarHora(fim)}</Text>
              </View>

              <View style={estilos.dadosConsulta}>
                <Text style={estilos.dataConsulta}>
                  {formatarDataExtensa(consulta.inicio)}
                </Text>
                <Text style={estilos.tipoConsulta}>{consulta.tipo}</Text>
              </View>
            </View>

            <View style={estilos.rodapeConsulta}>
              <Selo texto={status.texto} tom={status.tom} />

              {pendente ? (
                <Text style={estilos.acaoConsulta}>
                  {confirmando === consulta.id
                    ? 'Confirmando...'
                    : 'Toque para confirmar'}
                </Text>
              ) : null}
            </View>
          </View>
        </Cartao>
      </TouchableOpacity>
    );
  };

  return (
    <Tela
      titulo="Consultas"
      subtitulo="Seus atendimentos marcados"
      // Mesma razão da tela de evolução: a seta volta para o início.
      aoVoltar={() => navigation.replace('HomePaciente')}
      abaAtiva="consultas"
      perfilBarra="paciente"
      aoAtualizar={recarregarConsultas}
      atualizando={carregandoConsultas}
    >
      <Text style={estilos.tituloLista}>Próximas</Text>
      {proximas.length === 0 ? (
        <Text style={estilos.vazio}>
          Nenhuma consulta marcada. Seu nutricionista marca e avisa você por aqui.
        </Text>
      ) : (
        proximas.map((consulta) => renderizarConsulta(consulta, true))
      )}

      {anteriores.length > 0 ? (
        <View>
          <Text style={[estilos.tituloLista, estilos.tituloAnteriores]}>Anteriores</Text>
          {anteriores.map((consulta) => renderizarConsulta(consulta, false))}
        </View>
      ) : null}

      <CaixaAviso
        tom="info"
        estilo={estilos.avisoRodape}
        texto="Precisa desmarcar ou mudar o horário? Fale com o seu nutricionista: quem organiza a agenda é ele."
      />
    </Tela>
  );
};

export default AgendaPaciente;
