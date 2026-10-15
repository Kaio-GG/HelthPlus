// Confirmação de que o link de redefinição foi enviado.
import React from 'react';
import { View, Text, Alert } from 'react-native';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import Icone from '../../componentes/Icone';
import Botao from '../../componentes/Botao';
import { cores } from '../../tema';
import { estilos } from './style';

const VerificacaoEmail = ({ navigation, route }) => {
  const perfil = route.params?.perfil || 'nutricionista';
  const rotaDoLogin = perfil === 'paciente' ? 'Paciente' : 'Nutricionista';

  const reenviarLink = () => {
    // TODO: integrar com a API (reenvio do link).
    Alert.alert('Link reenviado', 'Confira a caixa de entrada e o spam.');
  };

  return (
    <Tela titulo="Verifique seu e-mail" subtitulo="Enviamos as instruções para você">
      <Cartao estilo={estilos.cartao}>
        <View style={estilos.circulo}>
          <Icone nome="email" tamanho={30} cor={cores.verdeBotao} />
        </View>

        <Text style={estilos.texto}>
          Se o e-mail informado estiver cadastrado, você receberá um link para redefinir sua senha.
        </Text>
        <Text style={estilos.aviso}>O link expira em 30 minutos.</Text>

        <Botao
          titulo="Voltar ao login"
          aoPressionar={() => navigation.popTo(rotaDoLogin)}
          estilo={estilos.botao}
        />
        <Text style={estilos.link} onPress={reenviarLink}>
          Reenviar link
        </Text>
      </Cartao>
    </Tela>
  );
};

export default VerificacaoEmail;
