// Preferências de acessibilidade: tamanho do texto, alto contraste e
// animações. Serve aos dois perfis (nutricionista e paciente), e também
// aparece na tela inicial, antes do login — quem precisa de texto maior
// precisa dele para conseguir entrar.
import React from 'react';
import { View, Text, Switch, TouchableOpacity } from 'react-native';

import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import CaixaAviso from '../../componentes/CaixaAviso';
import Botao from '../../componentes/Botao';
import { useAcessibilidade } from '../../contexto/AcessibilidadeContexto';
import { ESCALAS_DE_TEXTO } from '../../utilitarios/acessibilidade';
import { cores } from '../../tema';
import { estilos } from './style';

// Uma linha com texto e interruptor. A linha inteira é o controle, para o
// leitor de tela ler rótulo, descrição e estado de uma vez só.
const LinhaInterruptor = ({ titulo, descricao, ligado, aoMudar, desabilitado }) => (
  <TouchableOpacity
    style={estilos.linha}
    onPress={() => !desabilitado && aoMudar(!ligado)}
    activeOpacity={0.8}
    accessibilityRole="switch"
    accessibilityLabel={titulo}
    accessibilityHint={descricao}
    accessibilityState={{ checked: ligado, disabled: desabilitado }}
  >
    <View style={estilos.textosLinha}>
      <Text style={estilos.tituloLinha}>{titulo}</Text>
      <Text style={estilos.descricaoLinha}>{descricao}</Text>
    </View>
    <Switch
      value={ligado}
      onValueChange={aoMudar}
      disabled={desabilitado}
      trackColor={{ false: cores.linha, true: cores.verdeBotao }}
      thumbColor={cores.branco}
      // O controle de verdade é a linha; o Switch é só o desenho.
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  </TouchableOpacity>
);

const Acessibilidade = () => {
  const {
    preferencias,
    alterar,
    movimentoReduzidoNoSistema,
    leitorDeTela,
    precisaReiniciar,
    podeReiniciarAgora,
    reiniciar,
  } = useAcessibilidade();

  return (
    <Tela titulo="Acessibilidade" subtitulo="Ajuste o aplicativo ao seu jeito">
      <Cartao>
        <Text style={estilos.tituloCartao} accessibilityRole="header">
          Tamanho do texto
        </Text>

        <View style={estilos.opcoes} accessibilityRole="radiogroup" accessibilityLabel="Tamanho do texto">
          {Object.entries(ESCALAS_DE_TEXTO).map(([chave, escala]) => {
            const ativa = preferencias.tamanhoTexto === chave;
            return (
              <TouchableOpacity
                key={chave}
                style={[estilos.opcao, ativa && estilos.opcaoAtiva]}
                onPress={() => alterar('tamanhoTexto', chave)}
                accessibilityRole="radio"
                accessibilityState={{ checked: ativa }}
                accessibilityLabel={`Texto ${escala.rotulo.toLowerCase()}`}
              >
                <Text
                  style={[estilos.textoOpcao, ativa && estilos.textoOpcaoAtiva, { fontSize: 15 * escala.fator }]}
                >
                  Aa
                </Text>
                <Text style={[estilos.rotuloOpcao, ativa && estilos.textoOpcaoAtiva]}>{escala.rotulo}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={estilos.nota}>
          O tamanho de letra escolhido no celular (em Configurações &gt; Acessibilidade) também vale aqui, somado a este.
        </Text>
      </Cartao>

      <Cartao>
        <Text style={estilos.tituloCartao} accessibilityRole="header">
          Visual e movimento
        </Text>

        <LinhaInterruptor
          titulo="Alto contraste"
          descricao="Textos mais escuros, fundo branco e bordas mais fortes."
          ligado={Boolean(preferencias.altoContraste)}
          aoMudar={(valor) => alterar('altoContraste', valor)}
        />

        <LinhaInterruptor
          titulo="Reduzir animações"
          descricao={
            movimentoReduzidoNoSistema
              ? 'Já está ligado nas configurações do celular.'
              : 'As telas trocam sem deslizar.'
          }
          ligado={Boolean(preferencias.reduzirMovimento || movimentoReduzidoNoSistema)}
          aoMudar={(valor) => alterar('reduzirMovimento', valor)}
          desabilitado={movimentoReduzidoNoSistema}
        />
      </Cartao>

      {precisaReiniciar ? (
        <Cartao>
          <CaixaAviso
            tom="info"
            texto={
              podeReiniciarAgora
                ? 'O novo tamanho de texto e o contraste valem depois de recarregar o aplicativo.'
                : 'O novo tamanho de texto e o contraste valem na próxima vez que você abrir o aplicativo. Feche e abra de novo.'
            }
          />
          {podeReiniciarAgora ? (
            <Botao titulo="Recarregar agora" icone="atualizar" aoPressionar={reiniciar} estilo={estilos.botao} />
          ) : null}
        </Cartao>
      ) : null}

      <Cartao>
        <Text style={estilos.tituloCartao} accessibilityRole="header">
          Leitor de tela
        </Text>
        <Text style={estilos.descricaoLinha}>
          {leitorDeTela
            ? 'O TalkBack/VoiceOver está ligado. Botões, campos e gráficos do aplicativo têm descrição falada.'
            : 'O aplicativo funciona com o TalkBack (Android) e o VoiceOver (iPhone). Ligue nas configurações de acessibilidade do celular.'}
        </Text>
      </Cartao>
    </Tela>
  );
};

export default Acessibilidade;
