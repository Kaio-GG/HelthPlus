import { StyleSheet } from 'react-native';
import { cores, raios, tipografia } from '../../tema';

export const estilos = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: raios.pilula,
  },
  texto: {
    ...tipografia.miudo,
    fontWeight: '800',
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
