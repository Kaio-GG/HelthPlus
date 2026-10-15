// Campo de seleção: mostra o valor escolhido e abre uma lista para trocar.
// Props: rotulo, valor, opcoes (lista de textos), aoMudar, placeholder, erro, estilo
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Pressable } from 'react-native';
import Icone from '../Icone';
import { cores } from '../../tema';
import { estilos } from './style';

const CampoSelecao = ({ rotulo, valor, opcoes, aoMudar, placeholder = 'Selecione', erro, estilo }) => {
  const [aberto, setAberto] = useState(false);

  const escolher = (opcao) => {
    aoMudar(opcao);
    setAberto(false);
  };

  return (
    <View style={[estilos.container, estilo]}>
      {rotulo ? <Text style={estilos.rotulo}>{rotulo}</Text> : null}

      <TouchableOpacity
        style={[estilos.caixa, erro ? estilos.caixaComErro : null]}
        onPress={() => setAberto(true)}
        activeOpacity={0.8}
      >
        <Text style={[estilos.valor, !valor && estilos.placeholder]} numberOfLines={1}>
          {valor || placeholder}
        </Text>
        <Icone nome="chevron-baixo" tamanho={18} cor={cores.textoSecundario} />
      </TouchableOpacity>
      {erro ? <Text style={estilos.erro}>{erro}</Text> : null}

      <Modal visible={aberto} transparent animationType="slide" onRequestClose={() => setAberto(false)}>
        <Pressable style={estilos.fundoModal} onPress={() => setAberto(false)} />
        <View style={estilos.painel}>
          <View style={estilos.alca} />
          <Text style={estilos.tituloPainel}>{rotulo || placeholder}</Text>
          <ScrollView style={estilos.lista}>
            {opcoes.map((opcao) => (
              <TouchableOpacity key={opcao} style={estilos.opcao} onPress={() => escolher(opcao)}>
                <Text style={[estilos.textoOpcao, opcao === valor && estilos.textoOpcaoAtiva]}>{opcao}</Text>
                {opcao === valor ? <Icone nome="check" tamanho={18} cor={cores.verdeBotao} /> : null}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

export default CampoSelecao;
