// Caixa de diálogo com o visual do aplicativo.
//
// Substitui o Alert.alert do sistema, que ignora o tema e aparece com a cara
// do Android ou do iOS no meio de uma tela que não é nem uma coisa nem outra.
//
// Props: visivel, titulo, mensagem, tom, botoes [{ rotulo, variante, aoTocar }]
import React from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import Icone from '../Icone';
import Botao from '../Botao';
import { cores } from '../../tema';
import { estilos } from './style';

const ICONE_DO_TOM = {
  sucesso: 'check',
  info: 'info',
  alerta: 'alerta',
  erro: 'alerta',
};

const COR_DO_TOM = {
  sucesso: cores.verdeBotao,
  info: cores.infoTexto,
  alerta: cores.alertaTexto,
  erro: cores.erro,
};

const Dialogo = ({ visivel, titulo, mensagem, tom = 'info', botoes = [], aoFechar }) => (
  <Modal visible={visivel} transparent animationType="fade" onRequestClose={aoFechar}>
    {/* Tocar fora fecha, igual ao comportamento que as pessoas já esperam. */}
    <Pressable style={estilos.fundo} onPress={aoFechar}>
      {/* O Pressable de dentro só existe para o toque no cartão não fechar. */}
      <Pressable style={estilos.cartao} onPress={() => {}}>
        <View style={[estilos.circulo, estilos[`circulo_${tom}`]]}>
          <Icone nome={ICONE_DO_TOM[tom]} tamanho={24} cor={COR_DO_TOM[tom]} espessura={2.5} />
        </View>

        <Text style={estilos.titulo}>{titulo}</Text>
        {mensagem ? <Text style={estilos.mensagem}>{mensagem}</Text> : null}

        <View style={estilos.botoes}>
          {botoes.map((botao) => (
            <Botao
              key={botao.rotulo}
              titulo={botao.rotulo}
              variante={botao.variante ?? 'primario'}
              aoPressionar={botao.aoTocar}
              estilo={estilos.botao}
            />
          ))}
        </View>
      </Pressable>
    </Pressable>
  </Modal>
);

export default Dialogo;
