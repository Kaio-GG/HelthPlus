// app/contexto/AuthContext.js
// Guarda quem está logado (nutricionista) e mantém a sessão mesmo
// depois de fechar o app. Já deixei o campo "token" pronto para o JWT.
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        const salvo = await AsyncStorage.getItem(CHAVE_SESSAO);
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
      await AsyncStorage.setItem(
        CHAVE_SESSAO,
        JSON.stringify({ profissional, token })
      );
    } catch (erro) {
      console.log('Erro ao salvar sessão:', erro);
    }
  };

  // Chamar no botão "Sair"
  const sairSessao = async () => {
    setProfissional(null);
    setToken(null);
    try {
      await AsyncStorage.removeItem(CHAVE_SESSAO);
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
        sairSessao,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);