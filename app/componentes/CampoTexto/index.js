// Campo de texto com rótulo, mensagem de erro e ícones laterais.
// Props:
//   rotulo, valor, aoMudar, placeholder, erro
//   senha            esconde o texto e mostra o botão de "olho"
//   somenteLeitura   bloqueia a edição e mostra um cadeado
//   icone            ícone fixo à direita (ex.: 'calendario')
//   multilinha       campo de várias linhas
//   teclado, capitalizar, maxCaracteres, estilo
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import Icone from '../Icone';
import { cores } from '../../tema';
import { estilos } from './style';

const CampoTexto = ({
  rotulo,
  valor,
  aoMudar,
  placeholder,
  erro,
  senha = false,
  somenteLeitura = false,
  icone,
  multilinha = false,
  teclado = 'default',
  capitalizar = 'sentences',
  maxCaracteres,
  estilo,
}) => {
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  return (
    <View style={[estilos.container, estilo]}>
      {rotulo ? <Text style={estilos.rotulo}>{rotulo}</Text> : null}

      <View
        style={[
          estilos.caixa,
          multilinha && estilos.caixaMultilinha,
          somenteLeitura && estilos.caixaSomenteLeitura,
          erro ? estilos.caixaComErro : null,
        ]}
      >
        <TextInput
          style={[estilos.entrada, multilinha && estilos.entradaMultilinha]}
          value={valor}
          onChangeText={aoMudar}
          placeholder={placeholder}
          placeholderTextColor={cores.textoDesabilitado}
          secureTextEntry={senha && !senhaVisivel}
          editable={!somenteLeitura}
          multiline={multilinha}
          keyboardType={teclado}
          autoCapitalize={senha || teclado === 'email-address' ? 'none' : capitalizar}
          autoCorrect={false}
          maxLength={maxCaracteres}
          textAlignVertical={multilinha ? 'top' : 'center'}
        />

        {senha ? (
          <TouchableOpacity
            onPress={() => setSenhaVisivel((visivel) => !visivel)}
            hitSlop={10}
            accessibilityLabel={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
          >
            <Icone nome={senhaVisivel ? 'olho' : 'olho-fechado'} tamanho={20} cor={cores.textoSecundario} />
          </TouchableOpacity>
        ) : somenteLeitura ? (
          <Icone nome="cadeado" tamanho={18} cor={cores.textoSecundario} />
        ) : icone ? (
          <Icone nome={icone} tamanho={18} cor={cores.textoSecundario} />
        ) : null}
      </View>

      {erro ? <Text style={estilos.erro}>{erro}</Text> : null}
    </View>
  );
};

export default CampoTexto;
