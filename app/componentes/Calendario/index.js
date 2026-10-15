// Calendário mensal com navegação de mês e marcação dos dias com consulta.
// Props:
//   dataSelecionada   Date do dia selecionado
//   aoSelecionar      função chamada com o Date do dia tocado
//   diasComConsulta   Set com as chaves 'AAAA-MM-DD' dos dias que têm consulta

import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icone from '../Icone';
import { cores } from '../../tema';
import { nomesMeses, letrasDiasSemana, chaveDoDia, mesmoDia } from '../../utilitarios/datas';
import { estilos } from './style';

// Monta a lista de semanas do mês. Células vazias (null) preenchem os dias
// antes do dia 1 e depois do último dia.
const montarSemanas = (ano, mes) => {
  const primeiroDiaDaSemana = new Date(ano, mes, 1).getDay(); // 0 = domingo
  const totalDeDias = new Date(ano, mes + 1, 0).getDate();
  const celulas = [];

  for (let i = 0; i < primeiroDiaDaSemana; i += 1) celulas.push(null);
  for (let dia = 1; dia <= totalDeDias; dia += 1) celulas.push(dia);
  while (celulas.length % 7 !== 0) celulas.push(null);

  const semanas = [];
  for (let i = 0; i < celulas.length; i += 7) semanas.push(celulas.slice(i, i + 7));
  return semanas;
};

const Calendario = ({ dataSelecionada, aoSelecionar, diasComConsulta }) => {
  const [mesExibido, setMesExibido] = useState(
    new Date(dataSelecionada.getFullYear(), dataSelecionada.getMonth(), 1)
  );
  const hoje = new Date();
  const ano = mesExibido.getFullYear();
  const mes = mesExibido.getMonth();
  const semanas = montarSemanas(ano, mes);

  const mudarMes = (deslocamento) => setMesExibido(new Date(ano, mes + deslocamento, 1));

  return (
    <View>
      <View style={estilos.cabecalho}>
        <TouchableOpacity onPress={() => mudarMes(-1)} hitSlop={10} accessibilityLabel="Mês anterior">
          <Icone nome="chevron-esquerda" tamanho={22} cor={cores.verdeBotao} />
        </TouchableOpacity>
        <Text style={estilos.tituloMes}>
          {nomesMeses[mes]} {ano}
        </Text>
        <TouchableOpacity onPress={() => mudarMes(1)} hitSlop={10} accessibilityLabel="Próximo mês">
          <Icone nome="chevron-direita" tamanho={22} cor={cores.verdeBotao} />
        </TouchableOpacity>
      </View>

      <View style={estilos.linha}>
        {letrasDiasSemana.map((letra, indice) => (
          <Text key={indice} style={estilos.letraDia}>
            {letra}
          </Text>
        ))}
      </View>

      {semanas.map((semana, indiceSemana) => (
        <View key={indiceSemana} style={estilos.linha}>
          {semana.map((dia, indiceDia) => {
            if (!dia) return <View key={indiceDia} style={estilos.celula} />;

            const data = new Date(ano, mes, dia);
            const selecionado = mesmoDia(data, dataSelecionada);
            const ehHoje = mesmoDia(data, hoje);
            const temConsulta = diasComConsulta && diasComConsulta.has(chaveDoDia(data));

            return (
              <TouchableOpacity key={indiceDia} style={estilos.celula} onPress={() => aoSelecionar(data)}>
                <View
                  style={[
                    estilos.circulo,
                    ehHoje && !selecionado && estilos.circuloHoje,
                    selecionado && estilos.circuloSelecionado,
                  ]}
                >
                  <Text style={[estilos.numeroDia, selecionado && estilos.numeroSelecionado]}>{dia}</Text>
                </View>
                <View style={[estilos.ponto, temConsulta && estilos.pontoAtivo]} />
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
};

export default Calendario;
