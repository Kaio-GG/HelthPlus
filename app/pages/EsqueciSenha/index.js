// Pede o e-mail para enviar o link de redefinição de senha.
import React, { useState } from 'react';
import { Text } from 'react-native';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import CampoTexto from '../../componentes/CampoTexto';
import Botao from '../../componentes/Botao';
import { pedirLinkDeSenha } from '../../Api/senha';
import { emailValido } from '../../utilitarios/validacoes';
import { estilos } from './style';

const EsqueciSenha = ({ navigation, route }) => {
  // Perfil de origem, para o "Voltar ao login" levar à tela certa.
  const perfil = route.params?.perfil || 'nutricionista';
  const rotaDoLogin = perfil === 'paciente' ? 'Paciente' : 'Nutricionista';

  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviarLink = async () => {
    if (enviando) return;

    if (!emailValido(email)) {
      setErro('Informe um e-mail válido.');
      return;
    }

    setErro('');
    setEnviando(true);

    try {
      const resposta = await pedirLinkDeSenha(email.trim());

      // A API responde igual exista ou não a conta — de propósito, para não
      // dizer a estranhos quem tem cadastro aqui.
      navigation.navigate('VerificacaoEmail', {
        email: email.trim(),
        perfil,
        emailEnviado: resposta.emailEnviado !== false,
      });
    } catch (problema) {
      setErro(problema.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Tela titulo="Esqueci minha senha" subtitulo="Informe o e-mail para continuar">
      <Cartao>
        <Text style={estilos.explicacao}>
          Enviaremos um link de redefinição para o e-mail cadastrado.
        </Text>
        <CampoTexto
          rotulo="E-mail"
          valor={email}
          aoMudar={setEmail}
          placeholder="nome@email.com"
          teclado="email-address"
          preenchimento="email"
          erro={erro}
        />
        <Botao
          titulo={enviando ? 'Enviando...' : 'Enviar link'}
          aoPressionar={enviarLink}
          desabilitado={enviando}
        />
        <Text style={estilos.linkCentral} onPress={() => navigation.popTo(rotaDoLogin)}>
          Voltar ao login
        </Text>
      </Cartao>
    </Tela>
  );
};

export default EsqueciSenha;
