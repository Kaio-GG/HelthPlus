// Sino do cabeçalho, com a bolinha de quantas notificações não foram lidas.
// Props: estilo
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icone from '../Icone';
import { useNotificacoes } from '../../contexto/NotificacoesContexto';
import { cores } from '../../tema';
import { estilos } from './style';

// Acima disso o número não cabe no círculo.
const MAXIMO_NO_EMBLEMA = 9;

const SinoNotificacoes = ({ estilo }) => {
  const navigation = useNavigation();
  const { naoLidas } = useNotificacoes();

  const temAviso = naoLidas > 0;

  return (
    <TouchableOpacity
      style={[estilos.container, estilo]}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('Notificacoes')}
      accessibilityRole="button"
      accessibilityLabel={
        temAviso
          ? `Notificações, ${naoLidas} sem ler`
          : 'Notificações, nenhuma sem ler'
      }
    >
      <Icone nome="sino" tamanho={22} cor={cores.branco} />

      {temAviso ? (
        <View style={estilos.emblema}>
          <Text style={estilos.numero}>
            {naoLidas > MAXIMO_NO_EMBLEMA ? `${MAXIMO_NO_EMBLEMA}+` : naoLidas}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

export default SinoNotificacoes;
