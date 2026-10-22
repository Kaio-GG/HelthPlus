// Central de notificações do nutricionista.
//
// A lista vem da API (tabela "notificacao"). Tocar num item marca como lido
// e, quando a notificação aponta para uma tela, abre essa tela.
import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import Icone from '../../componentes/Icone';
import CaixaAviso from '../../componentes/CaixaAviso';
import { useNotificacoes } from '../../contexto/NotificacoesContexto';
import { cores } from '../../tema';
import { formatarTempoRelativo } from '../../utilitarios/datas';
import { estilos } from './style';

// Cada tipo de notificação tem o seu ícone.
const ICONE_DO_TIPO = {
  consulta: 'calendario',
  paciente: 'usuario',
  plano: 'prancheta',
  sistema: 'info',
};

const Notificacoes = ({ navigation }) => {
  const { notificacoes, naoLidas, carregando, erro, recarregar, marcarLida, marcarTudoLido } =
    useNotificacoes();

  // Volta a buscar sempre que a tela aparece: o número do sino não pode
  // ficar diferente do que a lista mostra.
  useFocusEffect(
    useCallback(() => {
      recarregar();
    }, [recarregar])
  );

  const abrir = (notificacao) => {
    if (!notificacao.dt_leitura) marcarLida(notificacao.id_notificacao);

    if (notificacao.ds_rota) {
      navigation.navigate(notificacao.ds_rota, {
        pacienteId: notificacao.id_referencia ?? undefined,
      });
    }
  };

  const vazia = !erro && notificacoes.length === 0 && !carregando;

  return (
    <Tela
      titulo="Notificações"
      subtitulo={naoLidas > 0 ? `${naoLidas} sem ler` : 'Tudo em dia'}
      aoAtualizar={recarregar}
      atualizando={carregando}
      direita={
        naoLidas > 0 ? (
          <TouchableOpacity
            onPress={marcarTudoLido}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Marcar todas como lidas"
          >
            <Text style={estilos.marcarTudo}>Marcar tudo</Text>
          </TouchableOpacity>
        ) : null
      }
    >
      {erro ? <CaixaAviso tom="alerta" icone="alerta" texto={erro} estilo={estilos.aviso} /> : null}

      {vazia ? (
        <Cartao estilo={estilos.cartaoVazio}>
          <View style={estilos.circuloVazio}>
            <Icone nome="sino" tamanho={26} cor={cores.verdeBotao} />
          </View>
          <Text style={estilos.tituloVazio}>Nenhuma notificação</Text>
          <Text style={estilos.textoVazio}>
            Avisos de consulta, paciente novo e plano vencendo aparecem aqui.
          </Text>
        </Cartao>
      ) : null}

      {notificacoes.map((item) => {
        const lida = Boolean(item.dt_leitura);

        return (
          <TouchableOpacity
            key={item.id_notificacao}
            activeOpacity={0.85}
            onPress={() => abrir(item)}
            accessibilityRole="button"
            accessibilityLabel={`${item.ds_titulo}. ${lida ? 'Lida' : 'Não lida'}`}
          >
            <Cartao estilo={[estilos.item, !lida && estilos.itemNaoLido]}>
              <View style={[estilos.circuloIcone, lida && estilos.circuloLido]}>
                <Icone
                  nome={ICONE_DO_TIPO[item.tp_notificacao] ?? 'info'}
                  tamanho={17}
                  cor={lida ? cores.textoSecundario : cores.verdeBotao}
                />
              </View>

              <View style={estilos.textos}>
                <View style={estilos.linhaTitulo}>
                  <Text style={[estilos.titulo, !lida && estilos.tituloNaoLido]} numberOfLines={1}>
                    {item.ds_titulo}
                  </Text>
                  {!lida ? <View style={estilos.pontoNaoLido} /> : null}
                </View>

                {item.ds_mensagem ? (
                  <Text style={estilos.mensagem} numberOfLines={2}>
                    {item.ds_mensagem}
                  </Text>
                ) : null}

                <Text style={estilos.quando}>{formatarTempoRelativo(item.dt_criacao)}</Text>
              </View>
            </Cartao>
          </TouchableOpacity>
        );
      })}
    </Tela>
  );
};

export default Notificacoes;
