// Criação da nova senha, com checklist dos requisitos em tempo real.
import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import CampoTexto from '../../componentes/CampoTexto';
import Icone from '../../componentes/Icone';
import Botao from '../../componentes/Botao';
import { requisitosDaSenha, senhaForte } from '../../utilitarios/validacoes';
import { cores } from '../../tema';
import { estilos } from './style';

const RedefinirSenha = ({ navigation }) => {
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState('');

  const requisitos = requisitosDaSenha(novaSenha);

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
          senha
        />
        <CampoTexto
          rotulo="Confirmar nova senha"
          valor={confirmacao}
          aoMudar={setConfirmacao}
          placeholder="••••••••"
          senha
          erro={erro}
        />

        <Text style={estilos.tituloRequisitos}>Sua senha deve ter:</Text>
        {requisitos.map((requisito) => (
          <View key={requisito.chave} style={estilos.linhaRequisito}>
            <View style={[estilos.marcador, requisito.atendido && estilos.marcadorAtendido]}>
              {requisito.atendido ? (
                <Icone nome="check" tamanho={12} cor={cores.branco} espessura={3} />
              ) : null}
            </View>
            <Text style={[estilos.textoRequisito, requisito.atendido && estilos.textoAtendido]}>
              {requisito.rotulo}
            </Text>
          </View>
        ))}

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
