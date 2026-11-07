// app/contexto/AuthContext.js
// Guarda quem está logado (nutricionista) e mantém a sessão mesmo
// depois de fechar o app.
//
// A sessão (com o token) fica no cofre do sistema quando o
// expo-secure-store está instalado — ver utilitarios/armazenamentoSeguro.js.
import React, { createContext, useContext, useEffect, useState } from 'react';
import { guardar, ler, apagar } from '../utilitarios/armazenamentoSeguro';

const CHAVE_SESSAO = '@healthplus:sessao';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [profissional, setProfissional] = useState(null);
  const [token, setToken] = useState(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);

  // Ao abrir o app, recupera a sessão salva (se existir)
  useEffect(() => {
    const recuperarSessao = async () => {
      try {
        const salvo = await ler(CHAVE_SESSAO);
        if (salvo) {
          const sessao = JSON.parse(salvo);
          setProfissional(sessao.profissional ?? null);
          setToken(sessao.token ?? null);
        }
      } catch (erro) {
        console.log('Erro ao recuperar sessão:', erro);
      } finally {
        setCarregandoSessao(false);
      }
    };
    recuperarSessao();
  }, []);

  // Chamar logo depois do login com sucesso
  const entrarSessao = async ({ profissional, token = null }) => {
    setProfissional(profissional);
    setToken(token);
    try {
      await guardar(CHAVE_SESSAO, JSON.stringify({ profissional, token }));
    } catch (erro) {
      console.log('Erro ao salvar sessão:', erro);
    }
  };

  // Depois de salvar o perfil: troca os campos alterados e regrava a sessão,
  // para a tela continuar certa quando o app for reaberto.
  const atualizarProfissional = async (novosCampos) => {
    const atualizado = { ...profissional, ...novosCampos };
    setProfissional(atualizado);
    try {
      await guardar(CHAVE_SESSAO, JSON.stringify({ profissional: atualizado, token }));
    } catch (erro) {
      console.log('Erro ao salvar sessão:', erro);
    }
  };

  // Trocar a senha encerra as outras sessões no servidor; a API devolve um
  // token novo para ESTE aparelho continuar logado.
  const trocarToken = async (novoToken) => {
    if (!novoToken) return;
    setToken(novoToken);
    try {
      await guardar(CHAVE_SESSAO, JSON.stringify({ profissional, token: novoToken }));
    } catch (erro) {
      console.log('Erro ao salvar sessão:', erro);
    }
  };

  // Chamar no botão "Sair"
  const sairSessao = async () => {
    setProfissional(null);
    setToken(null);
    try {
      await apagar(CHAVE_SESSAO);
    } catch (erro) {
      console.log('Erro ao limpar sessão:', erro);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        profissional, // { id_profissional, nm_profissional, ds_email, ... }
        token,
        carregandoSessao,
        entrarSessao,
        atualizarProfissional,
        trocarToken,
        sairSessao,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);