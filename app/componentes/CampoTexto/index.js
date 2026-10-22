// Campo de texto com rótulo, mensagem de erro e ícones laterais.
// Props:
//   rotulo, valor, aoMudar, placeholder, erro
//   senha            esconde o texto e mostra o botão de "olho"
//   somenteLeitura   bloqueia a edição e mostra um cadeado
//   icone            ícone fixo à direita (ex.: 'calendario')
//   multilinha       campo de várias linhas
//   selecionarAoFocar  marca o texto ao tocar, para digitar substituir tudo
//   aoLimpar         mostra um "x" à direita que apaga o campo. Importante
//                    em campos de tamanho fixo, como data: quando eles
//                    enchem, o teclado para de inserir e sem o "x" o
//                    usuário não descobre que precisa apagar primeiro.
//   preenchimento    o que o celular deve sugerir neste campo (veja abaixo)
//   teclado, capitalizar, maxCaracteres, estilo
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import Icone from '../Icone';
import { cores } from '../../tema';
import { estilos } from './style';

// Diz ao celular o que cada campo guarda, para o preenchimento automático
// colocar a informação certa no lugar certo.
//
// Sem isso o Android chuta: ao tocar num campo de senha ele procura o
// "usuário" e acaba jogando o e-mail no primeiro campo de texto da tela.
// Por isso o padrão é 'nenhum' — um campo só recebe sugestão quando pede.
const PREENCHIMENTOS = {
  nenhum: { autoComplete: 'off', textContentType: 'none' },
  nome: { autoComplete: 'name', textContentType: 'name' },
  email: { autoComplete: 'email', textContentType: 'emailAddress' },
  telefone: { autoComplete: 'tel', textContentType: 'telephoneNumber' },
  cep: { autoComplete: 'postal-code', textContentType: 'postalCode' },
  senhaAtual: { autoComplete: 'current-password', textContentType: 'password' },
  senhaNova: { autoComplete: 'new-password', textContentType: 'newPassword' },
};

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
  selecionarAoFocar = false,
  aoLimpar,
  preenchimento = 'nenhum',
  teclado = 'default',
  capitalizar = 'sentences',
  maxCaracteres,
  estilo,
}) => {
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  const dicas = PREENCHIMENTOS[preenchimento] ?? PREENCHIMENTOS.nenhum;

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
          autoComplete={dicas.autoComplete}
          textContentType={dicas.textContentType}
          selectTextOnFocus={selecionarAoFocar}
          maxLength={maxCaracteres}
          textAlignVertical={multilinha ? 'top' : 'center'}
        />

        {aoLimpar && valor && !somenteLeitura ? (
          <TouchableOpacity
            onPress={aoLimpar}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={`Limpar ${rotulo || 'campo'}`}
          >
            <Icone nome="fechar" tamanho={16} cor={cores.textoSecundario} />
          </TouchableOpacity>
        ) : null}

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
