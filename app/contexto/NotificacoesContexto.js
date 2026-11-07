// app/contexto/NotificacoesContexto.js
// Notificações do nutricionista logado: a lista, quantas não foram lidas (o
// número do sino) e as preferências.
//
// Fica num contexto separado do DadosContexto porque estes dados vêm da API
// e precisam ser recarregados; os do DadosContexto ainda são de demonstração.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import {
  listarNotificacoes,
  marcarNotificacaoLida,
  marcarTodasLidas,
  buscarPreferencias,
  salvarPreferencias,
} from '../Api/notificacoes';

const NotificacoesContexto = createContext(null);

export const NotificacoesProvider = ({ children }) => {
  const { profissional, token } = useAuth();
  const idProfissional = profissional?.id_profissional ?? null;

  // As rotas de notificação da API passaram a exigir o token da sessão, e
  // dele sai o profissional dos avisos. Sem token não há o que buscar: a
  // chamada voltaria 401 e o sino mostraria erro no lugar de ficar quieto.
  // Por isso "pronto" entra em toda guarda e em toda lista de dependências.
  const pronto = Boolean(idProfissional && token);

  const [notificacoes, setNotificacoes] = useState([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [preferencias, setPreferencias] = useState(null);
  const [carregando, setCarregando] = useState(false);
  // Guarda o erro em vez de estourar: a tela decide se mostra ou não. O sino
  // não pode derrubar o aplicativo porque a API está fora do ar.
  const [erro, setErro] = useState(null);

  const limpar = useCallback(() => {
    setNotificacoes([]);
    setNaoLidas(0);
    setPreferencias(null);
    setErro(null);
  }, []);

  const recarregar = useCallback(async () => {
    if (!pronto) {
      limpar();
      return;
    }

    setCarregando(true);
    try {
      const dados = await listarNotificacoes(idProfissional, token);
      setNotificacoes(dados.notificacoes ?? []);
      setNaoLidas(dados.naoLidas ?? 0);
      setErro(null);
    } catch (problema) {
      setErro(problema.message);
    } finally {
      setCarregando(false);
    }
  }, [pronto, idProfissional, token, limpar]);

  // Ao entrar (e ao trocar de conta), busca o que existe.
  //
  // O corpo do efeito não mexe no estado direto: tudo acontece dentro da
  // função assíncrona, depois da primeira espera. Assim entrar na tela não
  // dispara uma renderização em cascata, e a resposta que chega depois de o
  // usuário sair é descartada.
  useEffect(() => {
    let ativo = true;

    const buscar = async () => {
      if (!pronto) {
        if (ativo) limpar();
        return;
      }

      setCarregando(true);
      try {
        const dados = await listarNotificacoes(idProfissional, token);
        if (!ativo) return;
        setNotificacoes(dados.notificacoes ?? []);
        setNaoLidas(dados.naoLidas ?? 0);
        setErro(null);
      } catch (problema) {
        if (ativo) setErro(problema.message);
      } finally {
        if (ativo) setCarregando(false);
      }
    };

    buscar();

    return () => {
      ativo = false;
    };
  }, [pronto, idProfissional, token, limpar]);

  const marcarLida = useCallback(
    async (idNotificacao) => {
      if (!pronto) return;

      // Risca na tela antes da resposta: o toque precisa parecer imediato.
      // Se a chamada falhar, o recarregar seguinte traz a verdade do banco.
      setNotificacoes((atuais) =>
        atuais.map((item) =>
          item.id_notificacao === idNotificacao && !item.dt_leitura
            ? { ...item, dt_leitura: new Date().toISOString() }
            : item
        )
      );
      setNaoLidas((atual) => Math.max(0, atual - 1));

      try {
        const dados = await marcarNotificacaoLida(idProfissional, idNotificacao, token);
        if (typeof dados.naoLidas === 'number') setNaoLidas(dados.naoLidas);
      } catch (problema) {
        setErro(problema.message);
      }
    },
    [pronto, idProfissional, token]
  );

  const marcarTudoLido = useCallback(async () => {
    if (!pronto) return;

    try {
      await marcarTodasLidas(idProfissional, token);
      await recarregar();
    } catch (problema) {
      setErro(problema.message);
    }
  }, [pronto, idProfissional, token, recarregar]);

  const carregarPreferencias = useCallback(async () => {
    if (!pronto) return null;

    try {
      const dados = await buscarPreferencias(idProfissional, token);
      setPreferencias(dados);
      return dados;
    } catch (problema) {
      setErro(problema.message);
      return null;
    }
  }, [pronto, idProfissional, token]);

  // Devolve a preferência salva, ou lança para a tela avisar o usuário.
  const alterarPreferencias = useCallback(
    async (mudancas) => {
      if (!pronto) return null;

      const salvas = await salvarPreferencias(idProfissional, mudancas, token);
      setPreferencias(salvas);
      return salvas;
    },
    [pronto, idProfissional, token]
  );

  const valor = useMemo(
    () => ({
      notificacoes,
      naoLidas,
      preferencias,
      carregando,
      erro,
      recarregar,
      marcarLida,
      marcarTudoLido,
      carregarPreferencias,
      alterarPreferencias,
    }),
    [
      notificacoes,
      naoLidas,
      preferencias,
      carregando,
      erro,
      recarregar,
      marcarLida,
      marcarTudoLido,
      carregarPreferencias,
      alterarPreferencias,
    ]
  );

  return (
    <NotificacoesContexto.Provider value={valor}>{children}</NotificacoesContexto.Provider>
  );
};

// Uso nas telas:  const { naoLidas } = useNotificacoes();
export const useNotificacoes = () => {
  const contexto = useContext(NotificacoesContexto);
  if (!contexto) {
    throw new Error('useNotificacoes deve ser usado dentro de <NotificacoesProvider>.');
  }
  return contexto;
};
