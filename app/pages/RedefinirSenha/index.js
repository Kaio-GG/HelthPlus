// Criação da nova senha, com checklist dos requisitos em tempo real.
import React, { useState } from 'react';
import { Alert } from 'react-native';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import CampoTexto from '../../componentes/CampoTexto';
import Botao from '../../componentes/Botao';
import RequisitosSenha from '../../componentes/RequisitosSenha';
import { senhaForte } from '../../utilitarios/validacoes';
import { estilos } from './style';

const RedefinirSenha = ({ navigation }) => {
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState('');


  const salvar = () => {
    if (!senhaForte(novaSenha)) {
      setErro('A senha ainda não atende a todos os requisitos.');
      return;
    }
    if (novaSenha !== confirmacao) {
      setErro('As senhas não conferem.');
      return;
    }
    setErro('');
    // TODO: integrar com a API (salvar a nova senha).
    Alert.alert('Senha alterada!', 'Use a nova senha no próximo acesso.', [
      { text: 'OK', onPress: () => navigation.popToTop() },
    ]);
  };

  return (
    <Tela titulo="Nova senha" subtitulo="Crie uma senha segura">
      <Cartao>
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
          titulo="Salvar nova senha"
          aoPressionar={salvar}
          estilo={estilos.botao}
          desabilitado={!senhaForte(novaSenha) || confirmacao.length === 0}
        />
      </Cartao>
    </Tela>
  );
};

export default RedefinirSenha;
