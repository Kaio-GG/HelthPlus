// Lista das regras da senha, que vai sendo riscada conforme o usuário digita.
//
// Uma regra ainda não atendida aparece normal, com um círculo vazio.
// Quando é atendida, ganha o check verde, fica riscada e mais apagada —
// assim sobra em destaque só o que ainda falta fazer.
//
// Props:
//   senha   o texto digitado (a lista se atualiza sozinha a partir dele)
//   titulo  cabeçalho da lista (passe null para esconder)
//   estilo  estilo extra para o container
import React from 'react';
import { View, Text } from 'react-native';
import Icone from '../Icone';
import { cores } from '../../tema';
import { requisitosDaSenha } from '../../utilitarios/validacoes';
import { estilos } from './style';

const RequisitosSenha = ({ senha = '', titulo = 'Sua senha deve ter:', estilo }) => {
  const requisitos = requisitosDaSenha(senha);

  return (
    <View style={[estilos.container, estilo]} accessibilityLabel="Requisitos da senha">
      {titulo ? <Text style={estilos.titulo}>{titulo}</Text> : null}

      {requisitos.map((requisito) => (
        <View
          key={requisito.chave}
          style={[estilos.linha, requisito.atendido && estilos.linhaAtendida]}
          // Leitores de tela anunciam a regra e se ela já foi cumprida.
          accessibilityLabel={`${requisito.rotulo}: ${requisito.atendido ? 'cumprido' : 'pendente'}`}
        >
          <View style={[estilos.marcador, requisito.atendido && estilos.marcadorAtendido]}>
            {requisito.atendido ? (
              <Icone nome="check" tamanho={12} cor={cores.branco} espessura={3} />
            ) : null}
          </View>

          <Text style={[estilos.texto, requisito.atendido && estilos.textoAtendido]}>
            {requisito.rotulo}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default RequisitosSenha;
