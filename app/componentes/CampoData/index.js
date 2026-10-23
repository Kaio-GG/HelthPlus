// Campo de data: dá para digitar OU escolher no calendário.
//
// O ícone de calendário existia desde o começo, mas não fazia nada — era só
// um desenho ao lado do campo. Agora ele abre o calendário do aplicativo
// (componente Calendario) e o dia escolhido preenche o campo.
//
// Props: as do CampoTexto, mais
//   aoMudar        recebe o texto já com a máscara (DD/MM/AAAA)
//   dataMaxima     último dia que pode ser escolhido (ex.: hoje, num nascimento)
import React, { useState } from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import CampoTexto from '../CampoTexto';
import Calendario from '../Calendario';
import Botao from '../Botao';
import { aplicarMascaraData } from '../../utilitarios/mascaras';
import { converterDataBR, formatarDataBR } from '../../utilitarios/datas';
import { estilos } from './style';

// O Calendario marca com um ponto os dias que têm consulta. Aqui não há
// consulta para marcar, e criar um Set novo a cada render faria o
// calendário se redesenhar à toa.
const SEM_CONSULTAS = new Set();

const CampoData = ({
  rotulo,
  valor,
  aoMudar,
  erro,
  estilo,
  placeholder = 'DD/MM/AAAA',
  dataMaxima,
  ...resto
}) => {
  const [aberto, setAberto] = useState(false);

  // O calendário começa no dia já digitado; se não houver um, no dia de hoje.
  const dataDigitada = converterDataBR(valor);
  const dataInicial = dataDigitada ?? new Date();

  const escolher = (dia) => {
    if (dataMaxima && dia > dataMaxima) return;
    aoMudar(formatarDataBR(dia));
    setAberto(false);
  };

  return (
    <View style={estilo}>
      <CampoTexto
        rotulo={rotulo}
        valor={valor}
        aoMudar={(texto) => aoMudar(aplicarMascaraData(texto))}
        aoLimpar={() => aoMudar('')}
        selecionarAoFocar
        maxCaracteres={10}
        placeholder={placeholder}
        teclado="number-pad"
        icone="calendario"
        aoTocarIcone={() => setAberto(true)}
        erro={erro}
        {...resto}
      />

      <Modal visible={aberto} transparent animationType="fade" onRequestClose={() => setAberto(false)}>
        <Pressable style={estilos.fundo} onPress={() => setAberto(false)}>
          <Pressable style={estilos.painel} onPress={() => {}}>
            <Text style={estilos.titulo}>{rotulo || 'Escolher data'}</Text>

            <Calendario
              dataSelecionada={dataInicial}
              aoSelecionar={escolher}
              diasComConsulta={SEM_CONSULTAS}
              comNavegacaoDeAno
            />

            <Botao titulo="Fechar" variante="contorno" aoPressionar={() => setAberto(false)} />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default CampoData;
