// Agenda: calendário mensal e lista de consultas do dia selecionado.
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import Calendario from '../../componentes/Calendario';
import Selo from '../../componentes/Selo';
import BotaoCircular from '../../componentes/BotaoCircular';
import { useDados } from '../../contexto/DadosContexto';
import { chaveDoDia, formatarDataExtensa, formatarHora, mesmoDia } from '../../utilitarios/datas';
import { estilos } from './style';

const statusDaConsulta = {
  confirmada: { texto: 'Confirmada', tom: 'sucesso' },
  pendente: { texto: 'Pendente', tom: 'alerta' },
  concluida: { texto: 'Concluída', tom: 'neutro' },
  cancelada: { texto: 'Cancelada', tom: 'erro' },
};

const Agenda = ({ navigation }) => {
  const { consultas, atualizarStatusConsulta } = useDados();
  const [diaSelecionado, setDiaSelecionado] = useState(new Date());

  // Dias que têm consulta (ignorando as canceladas) ficam com um pontinho.
  const diasComConsulta = new Set(
    consultas.filter((item) => item.status !== 'cancelada').map((item) => chaveDoDia(item.inicio))
  );

  const consultasDoDia = consultas
    .filter((item) => mesmoDia(item.inicio, diaSelecionado))
    .sort((a, b) => a.inicio - b.inicio);

  // Abre as ações possíveis para a consulta tocada.
  const abrirAcoes = (consulta) => {
    const botoes = [];
    if (consulta.status === 'pendente') {
      botoes.push({ text: 'Confirmar consulta', onPress: () => atualizarStatusConsulta(consulta.id, 'confirmada') });
    }
    if (consulta.status === 'confirmada') {
      botoes.push({ text: 'Marcar como concluída', onPress: () => atualizarStatusConsulta(consulta.id, 'concluida') });
    }
    if (consulta.status === 'pendente' || consulta.status === 'confirmada') {
      botoes.push({
        text: 'Cancelar consulta',
        style: 'destructive',
        onPress: () => atualizarStatusConsulta(consulta.id, 'cancelada'),
      });
    }
    botoes.push({ text: 'Fechar', style: 'cancel' });

    Alert.alert(consulta.nome, `${consulta.tipo} · ${formatarHora(consulta.inicio)}`, botoes);
  };

  const quantidade = consultasDoDia.length;

  return (
    <Tela
      titulo="Agenda"
      subtitulo="Suas consultas marcadas"
      mostrarVoltar={false}
      abaAtiva="agenda"
      direita={
        <BotaoCircular
          icone="mais"
          tamanho={46}
          acessibilidade="Nova consulta"
          aoPressionar={() => navigation.navigate('NovaConsulta', { dataMs: diaSelecionado.getTime() })}
        />
      }
    >
      <Cartao>
        <Calendario
          dataSelecionada={diaSelecionado}
          aoSelecionar={setDiaSelecionado}
          diasComConsulta={diasComConsulta}
        />
      </Cartao>

      <View style={estilos.linhaTituloDia}>
        <Text style={estilos.tituloDia}>{formatarDataExtensa(diaSelecionado)}</Text>
        <Selo texto={`${quantidade} ${quantidade === 1 ? 'consulta' : 'consultas'}`} tom="sucesso" />
      </View>

      {quantidade === 0 ? <Text style={estilos.vazio}>Nenhuma consulta neste dia.</Text> : null}

      {consultasDoDia.map((consulta) => {
        const fim = new Date(consulta.inicio.getTime() + consulta.duracao * 60000);
        const status = statusDaConsulta[consulta.status];
        return (
          <TouchableOpacity key={consulta.id} activeOpacity={0.85} onPress={() => abrirAcoes(consulta)}>
            <Cartao estilo={estilos.itemConsulta}>
              <View style={estilos.barraLateral} />
              <View style={estilos.colunaHorario}>
                <Text style={estilos.horaInicio}>{formatarHora(consulta.inicio)}</Text>
                <Text style={estilos.horaFim}>{formatarHora(fim)}</Text>
              </View>
              <View style={estilos.dadosConsulta}>
                <Text style={estilos.nomeConsulta}>{consulta.nome}</Text>
                <Text style={estilos.tipoConsulta}>
                  {consulta.tipo}
                  {consulta.avulso ? ' · Avulso' : ''}
                </Text>
              </View>
              <Selo texto={status.texto} tom={status.tom} />
            </Cartao>
          </TouchableOpacity>
        );
      })}
    </Tela>
  );
};

export default Agenda;
