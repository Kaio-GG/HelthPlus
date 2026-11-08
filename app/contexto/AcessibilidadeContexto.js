// app/contexto/AcessibilidadeContexto.js
// Preferências de acessibilidade do aplicativo e o que o sistema informa.
//
// Uso:
//   const { preferencias, alterar, reduzirMovimento, leitorDeTela } = useAcessibilidade();
//
//   reduzirMovimento  true se a pessoa pediu no app OU no celular
//                     (Configurações > Acessibilidade > Remover animações)
//   leitorDeTela      true com TalkBack / VoiceOver ligado
//   precisaReiniciar  true se o tamanho do texto ou o contraste mudaram e
//                     ainda não valem (ver utilitarios/acessibilidade.js)
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, DevSettings } from 'react-native';
import {
  carregarPreferencias,
  salvarPreferencias,
  preferenciasEmVigor,
  PREFERENCIAS_PADRAO,
} from '../utilitarios/acessibilidade';

const AcessibilidadeContexto = createContext(null);

export function AcessibilidadeProvider({ children }) {
  const [preferencias, setPreferencias] = useState(() => ({
    ...PREFERENCIAS_PADRAO,
    ...preferenciasEmVigor(),
  }));
  const [movimentoReduzidoNoSistema, setMovimentoReduzidoNoSistema] = useState(false);
  const [leitorDeTela, setLeitorDeTela] = useState(false);

  useEffect(() => {
    carregarPreferencias().then(setPreferencias);

    AccessibilityInfo.isReduceMotionEnabled?.()
      .then(setMovimentoReduzidoNoSistema)
      .catch(() => {});
    AccessibilityInfo.isScreenReaderEnabled?.()
      .then(setLeitorDeTela)
      .catch(() => {});

    const ouvintes = [
      AccessibilityInfo.addEventListener?.('reduceMotionChanged', setMovimentoReduzidoNoSistema),
      AccessibilityInfo.addEventListener?.('screenReaderChanged', setLeitorDeTela),
    ];

    return () => ouvintes.forEach((ouvinte) => ouvinte?.remove?.());
  }, []);

  const alterar = useCallback((chave, valor) => {
    setPreferencias((atuais) => {
      const novas = { ...atuais, [chave]: valor };
      salvarPreferencias(novas);
      return novas;
    });
  }, []);

  const emVigor = preferenciasEmVigor();
  const precisaReiniciar =
    preferencias.tamanhoTexto !== emVigor.tamanhoTexto ||
    Boolean(preferencias.altoContraste) !== Boolean(emVigor.altoContraste);

  // Em desenvolvimento dá para recarregar daqui. No aplicativo instalado,
  // a tela pede para fechar e abrir de novo.
  const podeReiniciarAgora = __DEV__ && typeof DevSettings?.reload === 'function';
  const reiniciar = useCallback(() => {
    if (podeReiniciarAgora) DevSettings.reload();
  }, [podeReiniciarAgora]);

  const valor = useMemo(
    () => ({
      preferencias,
      alterar,
      reduzirMovimento: Boolean(preferencias.reduzirMovimento || movimentoReduzidoNoSistema),
      movimentoReduzidoNoSistema,
      leitorDeTela,
      precisaReiniciar,
      podeReiniciarAgora,
      reiniciar,
    }),
    [
      preferencias,
      alterar,
      movimentoReduzidoNoSistema,
      leitorDeTela,
      precisaReiniciar,
      podeReiniciarAgora,
      reiniciar,
    ]
  );

  return <AcessibilidadeContexto.Provider value={valor}>{children}</AcessibilidadeContexto.Provider>;
}

export const useAcessibilidade = () => {
  const contexto = useContext(AcessibilidadeContexto);
  if (!contexto) {
    throw new Error('useAcessibilidade deve ser usado dentro de <AcessibilidadeProvider>.');
  }
  return contexto;
};
