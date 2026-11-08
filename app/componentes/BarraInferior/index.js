// Barra de navegação inferior.
// Props:
//   abaAtiva   nutricionista: 'inicio' | 'agenda' | 'perfil'
//              paciente: 'inicio' | 'evolucao' | 'consultas' | 'perfil'
//   perfil     'nutricionista' (padrão) | 'paciente'

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icone from '../Icone';
import { cores } from '../../tema';
import { estilos } from './style';

const abasDoNutricionista = [
  { chave: 'inicio', rotulo: 'Início', icone: 'casa', rota: 'HomeNutricionista' },
  { chave: 'agenda', rotulo: 'Agenda', icone: 'calendario', rota: 'Agenda' },
  { chave: 'perfil', rotulo: 'Perfil', icone: 'usuario', rota: 'Perfil' },
];

const abasDoPaciente = [
  { chave: 'inicio', rotulo: 'Início', icone: 'casa', rota: 'HomePaciente' },
  // "Evolução" entrou no lugar de "Registros" (água e refeições), que
  // saiu do produto. É a tela que o paciente mais tem motivo para abrir:
  // é onde ele vê o que foi medido nas consultas.
  { chave: 'evolucao', rotulo: 'Evolução', icone: 'grafico', rota: 'EvolucaoPaciente' },
  { chave: 'consultas', rotulo: 'Consultas', icone: 'calendario', rota: 'AgendaPaciente' },
  { chave: 'perfil', rotulo: 'Perfil', icone: 'usuario', rota: 'PerfilPaciente' },
];

const BarraInferior = ({ abaAtiva, perfil = 'nutricionista' }) => {
  const abas = perfil === 'paciente' ? abasDoPaciente : abasDoNutricionista;
  const navigation = useNavigation();
  const margens = useSafeAreaInsets();

  const irParaAba = (aba) => {
    if (aba.chave === abaAtiva) return;
    // "replace" troca a tela atual em vez de empilhar uma nova a cada toque.
    navigation.replace(aba.rota);
  };

  return (
    <View style={[estilos.container, { paddingBottom: margens.bottom + 8 }]} accessibilityRole="tablist">
      {abas.map((aba) => {
        const ativa = aba.chave === abaAtiva;
        return (
          <TouchableOpacity
            key={aba.chave}
            style={estilos.item}
            onPress={() => irParaAba(aba)}
            accessibilityRole="tab"
            accessibilityLabel={aba.rotulo}
            accessibilityState={{ selected: ativa }}
          >
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
