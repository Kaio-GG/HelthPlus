// Criação da nova senha, com checklist dos requisitos em tempo real.
//
// O código vem do e-mail: ou pelo link (healthplus://redefinir-senha?token=...),
// que o App.js transforma no parâmetro "token", ou digitado na tela
// "Verifique seu e-mail".
import React, { useState } from 'react';
import { Text } from 'react-native';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import CampoTexto from '../../componentes/CampoTexto';
import Botao from '../../componentes/Botao';
import RequisitosSenha from '../../componentes/RequisitosSenha';
import { redefinirSenha } from '../../Api/senha';
import { useDialogo } from '../../contexto/DialogoContexto';
import { senhaForte } from '../../utilitarios/validacoes';
import { estilos } from './style';

const RedefinirSenha = ({ navigation, route }) => {
  const { avisar } = useDialogo();
  const tokenRecebido = route.params?.token ?? '';

  const [token, setToken] = useState(tokenRecebido);
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const salvar = async () => {
    if (salvando) return;

    if (!token.trim()) {
      setErro('Informe o código recebido por e-mail.');
      return;
    }
    if (!senhaForte(novaSenha)) {
      setErro('A senha ainda não atende a todos os requisitos.');
      return;
    }
    if (novaSenha !== confirmacao) {
      setErro('As senhas não conferem.');
      return;
    }

    setErro('');
    setSalvando(true);

    try {
      await redefinirSenha(token.trim(), novaSenha);

      await avisar({
        titulo: 'Senha alterada!',
        mensagem: 'Use a nova senha no próximo acesso.',
        tom: 'sucesso',
      });
      navigation.popToTop();
    } catch (problema) {
      setErro(problema.message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Tela titulo="Nova senha" subtitulo="Crie uma senha segura">
      <Cartao>
        {/* Quem chegou pelo link já tem o código: o campo só confirma. */}
        <CampoTexto
          rotulo="Código do e-mail"
          valor={token}
          aoMudar={(texto) => setToken(texto.toUpperCase())}
          aoLimpar={() => setToken('')}
          placeholder="XXXXXXXX"
          maxCaracteres={8}
          capitalizar="characters"
        />
        <Text style={estilos.dicaToken}>O código vale por 30 minutos e serve uma vez só.</Text>

        <CampoTexto
          rotulo="Nova senha"
          valor={novaSenha}
          aoMudar={setNovaSenha}
          placeholder="••••••••"
          preenchimento="senhaNova"
          senha
        />
        <CampoTexto
          rotulo="Confirmar nova senha"
          valor={confirmacao}
          aoMudar={setConfirmacao}
          placeholder="••••••••"
          preenchimento="senhaNova"
          senha
          erro={erro}
        />

        <RequisitosSenha senha={novaSenha} />

        <Botao
          titulo={salvando ? 'Salvando...' : 'Salvar nova senha'}
          aoPressionar={salvar}
          estilo={estilos.botao}
          desabilitado={salvando || !senhaForte(novaSenha) || confirmacao.length === 0}
        />
      </Cartao>
    </Tela>
  );
};

export default RedefinirSenha;
