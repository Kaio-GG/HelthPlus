import { StyleSheet } from 'react-native';
import { cores, raios } from '../../tema';

export const estilos = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: raios.pilula,
  },
  texto: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  fundo_sucesso: { backgroundColor: cores.verdeClaro },
  texto_sucesso: { color: cores.verdeEscuro },
  fundo_alerta: { backgroundColor: cores.alertaFundo },
  texto_alerta: { color: cores.alertaTexto },
  fundo_neutro: { backgroundColor: cores.linha },
  texto_neutro: { color: cores.textoSecundario },
  fundo_info: { backgroundColor: cores.infoFundo },
  texto_info: { color: cores.infoTexto },
  fundo_erro: { backgroundColor: cores.erroFundo },
  texto_erro: { color: cores.erro },
});
