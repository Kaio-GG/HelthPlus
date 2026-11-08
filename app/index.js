// Entrada do aplicativo.
//
// Antes de carregar o App, lê as preferências de acessibilidade (tamanho do
// texto e alto contraste) e aplica no tema — ver utilitarios/acessibilidade.js.
// O require('./App') fica DENTRO do efeito de propósito: os estilos de todas
// as telas são montados quando o arquivo delas é carregado, e precisam
// encontrar o tema já ajustado.
import React, { useEffect, useState } from 'react';
import { registerRootComponent } from 'expo';
import { carregarPreferencias, aplicarNoTema } from './utilitarios/acessibilidade';

function Raiz() {
  const [App, setApp] = useState(null);

  useEffect(() => {
    let ativo = true;

    carregarPreferencias().then((preferencias) => {
      aplicarNoTema(preferencias);
          const modulo = require('./App');
      if (ativo) setApp(() => modulo.default);
    });

    return () => {
      ativo = false;
    };
  }, []);

  // Um instante (a leitura do AsyncStorage) antes da primeira tela.
  if (!App) return null;

  return <App />;
}

registerRootComponent(Raiz);
