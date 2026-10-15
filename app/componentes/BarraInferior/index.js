// Barra de navegação inferior (Início, Agenda, Perfil).
// Prop: abaAtiva = 'inicio' | 'agenda' | 'perfil'

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icone from '../Icone';
import { cores } from '../../tema';
import { estilos } from './style';

const abas = [
  { chave: 'inicio', rotulo: 'Início', icone: 'casa', rota: 'HomeNutricionista' },
  { chave: 'agenda', rotulo: 'Agenda', icone: 'calendario', rota: 'Agenda' },
  { chave: 'perfil', rotulo: 'Perfil', icone: 'usuario', rota: 'Perfil' },
];

const BarraInferior = ({ abaAtiva }) => {
  const navigation = useNavigation();
  const margens = useSafeAreaInsets();

  const irParaAba = (aba) => {
    if (aba.chave === abaAtiva) return;
    // "replace" troca a tela atual em vez de empilhar uma nova a cada toque.
    navigation.replace(aba.rota);
  };

  return (
    <View style={[estilos.container, { paddingBottom: margens.bottom + 8 }]}>
      {abas.map((aba) => {
        const ativa = aba.chave === abaAtiva;
        return (
          <TouchableOpacity key={aba.chave} style={estilos.item} onPress={() => irParaAba(aba)}>
            <View style={[estilos.pilula, ativa && estilos.pilulaAtiva]}>
              <Icone nome={aba.icone} tamanho={24} cor={cores.verdeEscuro} />
            </View>
            <Text style={[estilos.rotulo, ativa && estilos.rotuloAtivo]}>{aba.rotulo}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BarraInferior;
