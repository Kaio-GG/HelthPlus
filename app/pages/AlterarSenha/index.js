// Troca de senha de dentro do aplicativo, pelo Perfil.
//
// Pede a senha atual: sem isso, qualquer pessoa que pegasse o celular
// destravado trocaria a senha da conta.
import React, { useState } from 'react';

import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import CampoTexto from '../../componentes/CampoTexto';
import Botao from '../../componentes/Botao';
import RequisitosSenha from '../../componentes/RequisitosSenha';
import { useAuth } from '../../contexto/AuthContext';
import { useDialogo } from '../../contexto/DialogoContexto';
import { alterarSenha } from '../../Api/senha';
import { senhaForte } from '../../utilitarios/validacoes';
import { estilos } from './style';

const AlterarSenha = ({ navigation }) => {
  const { profissional } = useAuth();
  const { avisar } = useDialogo();

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const salvar = async () => {
    if (salvando) return;

    if (!senhaAtual) {
      setErro('Informe a sua senha atual.');
      return;
    }
    if (!senhaForte(novaSenha)) {
      setErro('A nova senha ainda não atende a todos os requisitos.');
      return;
    }
    if (novaSenha !== confirmacao) {
      setErro('As senhas não conferem.');
      return;
    }
    if (novaSenha === senhaAtual) {
      setErro('A nova senha precisa ser diferente da atual.');
      return;
    }

    setErro('');
    setSalvando(true);

    try {
      await alterarSenha(profissional.id_profissional, senhaAtual, novaSenha);

      await avisar({
        titulo: 'Senha alterada',
        mensagem: 'Use a nova senha no próximo acesso.',
        tom: 'sucesso',
      });
      navigation.goBack();
    } catch (problema) {
      setErro(problema.message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Tela titulo="Alterar senha" subtitulo="Confirme a senha atual para trocar">
      <Cartao>
        <CampoTexto
          rotulo="Senha atual"
          valor={senhaAtual}
          aoMudar={setSenhaAtual}
          placeholder="••••••••"
          preenchimento="senhaAtual"
          senha
        />

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
          desabilitado={salvando || !senhaAtual || !senhaForte(novaSenha) || confirmacao.length === 0}
        />
      </Cartao>
    </Tela>
  );
};

export default AlterarSenha;
