import { StyleSheet } from 'react-native';
import { cores, raios, tipografia } from '../../tema';

export const estilos = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: raios.medio,
    marginBottom: 14,
  },
  icone: {
    marginRight: 10,
    marginTop: 1,
  },
  conteudo: {
    flex: 1,
  },
  texto: {
    ...tipografia.apoio,
    lineHeight: 19,
  },
  fundo_sucesso: { backgroundColor: cores.verdeSuave },
  texto_sucesso: { color: cores.verdeEscuro },
  fundo_info: { backgroundColor: cores.infoFundo },
  texto_info: { color: cores.infoTexto },
  fundo_alerta: { backgroundColor: cores.alertaFundo },
  texto_alerta: { color: cores.alertaTexto },
});
