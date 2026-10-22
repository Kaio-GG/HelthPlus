// Campo de texto com rótulo, mensagem de erro e ícones laterais.
// Props:
//   rotulo, valor, aoMudar, placeholder, erro
//   senha            esconde o texto e mostra o botão de "olho"
//   somenteLeitura   bloqueia a edição e mostra um cadeado
//   icone            ícone fixo à direita (ex.: 'calendario')
//   multilinha       campo de várias linhas
//   selecionarAoFocar  marca o texto ao tocar, para digitar substituir tudo
//   linhasDoRotulo   reserva espaço para N linhas de rótulo. Use nos campos
//                    lado a lado quando um dos rótulos quebra em duas
//                    linhas: sem isso, uma caixa fica mais baixa que a outra
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

// Altura de uma linha do rótulo: o lineHeight fixado em style.js. É o que
// linhasDoRotulo usa para reservar o espaço de N linhas.
const ALTURA_DA_LINHA_DO_ROTULO = 17;

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
  linhasDoRotulo,
  aoLimpar,
  preenchimento = 'nenhum',
  teclado = 'default',
  capitalizar = 'sentences',
  maxCaracteres,
  estilo,
}) => {
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  // Seleção do texto, controlada só no momento do toque.
  //
  // Antes isto era o selectTextOnFocus do TextInput, e ele tem um defeito:
  // volta a marcar o texto a CADA re-render. Num campo com máscara, cada
  // tecla digitada muda o valor e re-renderiza — então a segunda tecla
  // apagava a primeira (digitar "21" deixava só "1"). Agora a marcação
  // acontece uma vez, ao focar, e some assim que o usuário digita.
  const [selecao, setSelecao] = useState(undefined);

  const aoFocar = () => {
    if (selecionarAoFocar && valor) setSelecao({ start: 0, end: String(valor).length });
  };

  const digitou = (texto) => {
    if (selecao) setSelecao(undefined);
    if (aoMudar) aoMudar(texto);
  };

  const dicas = PREENCHIMENTOS[preenchimento] ?? PREENCHIMENTOS.nenhum;

  return (
    <View style={[estilos.container, estilo]}>
      {rotulo ? (
        <Text
          style={[
            estilos.rotulo,
            linhasDoRotulo ? { minHeight: ALTURA_DA_LINHA_DO_ROTULO * linhasDoRotulo } : null,
          ]}
        >
          {rotulo}
        </Text>
      ) : null}

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
          onChangeText={digitou}
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
          onFocus={aoFocar}
          onBlur={() => setSelecao(undefined)}
          selection={selecao}
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
