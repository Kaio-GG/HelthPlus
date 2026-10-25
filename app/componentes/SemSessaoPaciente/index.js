// Aviso das telas do paciente quando não há paciente logado
// (ex.: o aplicativo foi reaberto e a sessão em memória se perdeu).
import React from 'react';
import { Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Tela from '../Tela';
import Cartao from '../Cartao';
import Botao from '../Botao';
import { estilos } from './style';

const SemSessaoPaciente = () => {
  const navigation = useNavigation();

  return (
    <Tela titulo="Área do paciente" subtitulo="Sessão encerrada" mostrarVoltar={false}>
      <Cartao>
        <Text style={estilos.texto}>Não encontramos o seu acesso. Entre novamente para continuar.</Text>
        <Botao
          titulo="Entrar"
          aoPressionar={() => navigation.reset({ index: 0, routes: [{ name: 'Paciente' }] })}
        />
      </Cartao>
    </Tela>
  );
};

export default SemSessaoPaciente;
