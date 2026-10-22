import { StyleSheet } from 'react-native';
import { cores } from '../../tema';

export const estilos = StyleSheet.create({
  // O checklist dos requisitos virou o componente RequisitosSenha,
  // que traz os próprios estilos.
  dicaToken: {
    fontSize: 12,
    color: cores.textoSecundario,
    marginTop: -8,
    marginBottom: 14,
  },
  botao: {
    marginTop: 20,
  },
});
