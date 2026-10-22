// Confirmação de que o link de redefinição foi enviado.
//
// O e-mail traz um link que abre o aplicativo direto na tela de nova senha.
// Nem todo celular abre esse tipo de link a partir do e-mail (e o Expo Go
// não abre), por isso a mesma mensagem traz um código: quem não conseguiu
// clicar digita o código aqui.
import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import Icone from '../../componentes/Icone';
import Botao from '../../componentes/Botao';
import CampoTexto from '../../componentes/CampoTexto';
import CaixaAviso from '../../componentes/CaixaAviso';
import { pedirLinkDeSenha } from '../../Api/senha';
import { cores } from '../../tema';
import { estilos } from './style';

const VerificacaoEmail = ({ navigation, route }) => {
  const perfil = route.params?.perfil || 'nutricionista';
  const email = route.params?.email ?? '';
  // false quando a API está sem SMTP configurado e só imprimiu a mensagem
  // no terminal dela.
  const emailEnviado = route.params?.emailEnviado !== false;
  const rotaDoLogin = perfil === 'paciente' ? 'Paciente' : 'Nutricionista';

  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState('');
  const [reenviando, setReenviando] = useState(false);

  const continuar = () => {
    if (codigo.trim().length < 6) {
      setErro('Digite o código que veio no e-mail.');
      return;
    }
    setErro('');
    navigation.navigate('RedefinirSenha', { token: codigo.trim(), perfil });
  };

  const reenviarLink = async () => {
    if (reenviando || !email) return;

    setReenviando(true);
    try {
      await pedirLinkDeSenha(email);
      Alert.alert('Link reenviado', 'Confira a caixa de entrada e o spam.');
    } catch (problema) {
      Alert.alert('Não foi possível reenviar', problema.message);
    } finally {
      setReenviando(false);
    }
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
      </Cartao>

      {!emailEnviado ? (
        <CaixaAviso
          tom="info"
          texto="A API ainda está sem SMTP configurado, então nada foi enviado: o código apareceu no terminal onde a API está rodando. Preencha as variáveis SMTP_ do Api/.env para enviar de verdade."
          estilo={estilos.avisoDev}
        />
      ) : null}

      <Cartao>
        <Text style={estilos.tituloCodigo}>O link não abriu?</Text>
        <Text style={estilos.textoCodigo}>
          A mesma mensagem traz um código de 8 caracteres. Digite ele aqui para criar a nova senha.
        </Text>
        <CampoTexto
          rotulo="Código do e-mail"
          valor={codigo}
          aoMudar={(texto) => setCodigo(texto.toUpperCase())}
          aoLimpar={() => setCodigo('')}
          placeholder="XXXXXXXX"
          maxCaracteres={8}
          capitalizar="characters"
          erro={erro}
        />
        <Botao titulo="Criar nova senha" aoPressionar={continuar} />
      </Cartao>

      <Botao
        titulo="Voltar ao login"
        variante="contorno"
        aoPressionar={() => navigation.popTo(rotaDoLogin)}
        estilo={estilos.botao}
      />
      <Text style={estilos.link} onPress={reenviarLink}>
        {reenviando ? 'Reenviando...' : 'Reenviar link'}
      </Text>
    </Tela>
  );
};

export default VerificacaoEmail;
