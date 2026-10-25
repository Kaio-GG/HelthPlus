// Consultas do paciente: próximas e anteriores. O paciente pode confirmar ou cancelar as próximas.
import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import Selo from '../../componentes/Selo';
import SemSessaoPaciente from '../../componentes/SemSessaoPaciente';
import { useDados } from '../../contexto/DadosContexto';
import { formatarDataExtensa, formatarHora } from '../../utilitarios/datas';
import { estilos } from './style';

const statusDaConsulta = {
  confirmada: { texto: 'Confirmada', tom: 'sucesso' },
  pendente: { texto: 'Aguardando confirmação', tom: 'alerta' },
  concluida: { texto: 'Concluída', tom: 'neutro' },
  cancelada: { texto: 'Cancelada', tom: 'erro' },
};

const AgendaPaciente = () => {
  const { pacienteAtual: paciente, consultas, atualizarStatusConsulta } = useDados();

  if (!paciente) return <SemSessaoPaciente />;

  const inicioDeHoje = new Date();
  inicioDeHoje.setHours(0, 0, 0, 0);

  const minhasConsultas = consultas.filter((consulta) => consulta.pacienteId === paciente.id);
  const proximas = minhasConsultas
    .filter(
      (consulta) =>
        consulta.inicio >= inicioDeHoje && (consulta.status === 'pendente' || consulta.status === 'confirmada')
    )
    .sort((a, b) => a.inicio - b.inicio);
  const anteriores = minhasConsultas.filter((consulta) => !proximas.includes(consulta)).sort((a, b) => b.inicio - a.inicio);

  // Ações possíveis para uma consulta futura.
  const abrirAcoes = (consulta) => {
    const botoes = [];
    if (consulta.status === 'pendente') {
      // TODO: integrar com a API (avisar o nutricionista da confirmação).
      botoes.push({ text: 'Confirmar presença', onPress: () => atualizarStatusConsulta(consulta.id, 'confirmada') });
    }
    botoes.push({
      text: 'Cancelar consulta',
      style: 'destructive',
      // TODO: integrar com a API (avisar o nutricionista do cancelamento).
      onPress: () => atualizarStatusConsulta(consulta.id, 'cancelada'),
    });
    botoes.push({ text: 'Fechar', style: 'cancel' });

    Alert.alert(
      consulta.tipo,
      `${formatarDataExtensa(consulta.inicio)} às ${formatarHora(consulta.inicio)}`,
      botoes
    );
  };

  const renderizarConsulta = (consulta, interativa) => {
    const fim = new Date(consulta.inicio.getTime() + consulta.duracao * 60000);
    const status = statusDaConsulta[consulta.status] ?? statusDaConsulta.pendente;

    return (
      <TouchableOpacity
        key={consulta.id}
        activeOpacity={0.85}
        disabled={!interativa}
        onPress={() => abrirAcoes(consulta)}
      >
        <Cartao estilo={estilos.itemConsulta}>
          <View style={estilos.barraLateral} />
          <View style={estilos.colunaHorario}>
            <Text style={estilos.horaInicio}>{formatarHora(consulta.inicio)}</Text>
            <Text style={estilos.horaFim}>{formatarHora(fim)}</Text>
          </View>
          <View style={estilos.dadosConsulta}>
            <Text style={estilos.dataConsulta}>{formatarDataExtensa(consulta.inicio)}</Text>
            <Text style={estilos.tipoConsulta}>{consulta.tipo}</Text>
          </View>
          <Selo texto={status.texto} tom={status.tom} />
        </Cartao>
      </TouchableOpacity>
    );
  };

  return (
    <Tela
      titulo="Consultas"
      subtitulo="Seus atendimentos marcados"
      mostrarVoltar={false}
      abaAtiva="consultas"
      perfilBarra="paciente"
    >
      <Text style={estilos.tituloLista}>Próximas</Text>
      {proximas.length === 0 ? (
        <Text style={estilos.vazio}>Nenhuma consulta marcada. Seu nutricionista marca e avisa você por aqui.</Text>
      ) : (
        proximas.map((consulta) => renderizarConsulta(consulta, true))
      )}

      {anteriores.length > 0 ? (
        <View>
          <Text style={[estilos.tituloLista, estilos.tituloAnteriores]}>Anteriores</Text>
          {anteriores.map((consulta) => renderizarConsulta(consulta, false))}
        </View>
      ) : null}
    </Tela>
  );
};

export default AgendaPaciente;
