// app/contexto/DialogoContexto.js
// Um único diálogo para o aplicativo inteiro, no lugar do Alert do sistema.
//
// Uso:
//   const { avisar, confirmar } = useDialogo();
//
//   await avisar({ titulo: 'Dados salvos', mensagem: '...', tom: 'sucesso' });
//
//   const confirmou = await confirmar({
//     titulo: 'Sair da conta',
//     mensagem: 'Deseja realmente sair?',
//     rotuloConfirmar: 'Sair',
//     perigo: true,
//   });
//   if (!confirmou) return;
//
//   const escolha = await escolher({
//     titulo: 'Ana Souza',
//     opcoes: [
//       { rotulo: 'Confirmar consulta', valor: 'confirmada' },
//       { rotulo: 'Cancelar consulta', valor: 'cancelada', variante: 'perigo' },
//     ],
//   });
//   // escolha é o "valor" do botão tocado, ou null se fechou sem escolher.
//
// As duas devolvem Promise, então o código do botão continua lendo de cima
// para baixo — sem o aninhamento de callbacks que o Alert obrigava.
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import Dialogo from '../componentes/Dialogo';

const DialogoContexto = createContext(null);

const FECHADO = { visivel: false, titulo: '', mensagem: '', tom: 'info', botoes: [] };

export const DialogoProvider = ({ children }) => {
  const [estado, setEstado] = useState(FECHADO);

  // Guarda o "resolve" da Promise aberta, para responder quando o usuário
  // escolher — ou quando ele fechar tocando fora.
  const responder = useRef(null);

  const fechar = useCallback((resposta) => {
    setEstado(FECHADO);
    if (responder.current) {
      responder.current(resposta);
      responder.current = null;
    }
  }, []);

  const avisar = useCallback(
    ({ titulo, mensagem, tom = 'info', rotuloBotao = 'Entendi' }) =>
      new Promise((resolve) => {
        responder.current = resolve;
        setEstado({
          visivel: true,
          titulo,
          mensagem,
          tom,
          botoes: [{ rotulo: rotuloBotao, variante: 'primario', aoTocar: () => fechar(true) }],
        });
      }),
    [fechar]
  );

  const confirmar = useCallback(
    ({
      titulo,
      mensagem,
      tom = 'alerta',
      rotuloConfirmar = 'Confirmar',
      rotuloCancelar = 'Cancelar',
      perigo = false,
    }) =>
      new Promise((resolve) => {
        responder.current = resolve;
        setEstado({
          visivel: true,
          titulo,
          mensagem,
          tom,
          botoes: [
            {
              rotulo: rotuloConfirmar,
              variante: perigo ? 'perigo' : 'primario',
              aoTocar: () => fechar(true),
            },
            { rotulo: rotuloCancelar, variante: 'contorno', aoTocar: () => fechar(false) },
          ],
        });
      }),
    [fechar]
  );

  // Versão aberta: uma lista de opções, para quando duas respostas não bastam
  // (a Agenda, por exemplo, oferece confirmar, concluir e cancelar).
  const escolher = useCallback(
    ({ titulo, mensagem, tom = 'info', opcoes, rotuloCancelar = 'Fechar' }) =>
      new Promise((resolve) => {
        responder.current = resolve;
        setEstado({
          visivel: true,
          titulo,
          mensagem,
          tom,
          botoes: [
            ...opcoes.map((opcao) => ({
              rotulo: opcao.rotulo,
              variante: opcao.variante ?? 'contorno',
              aoTocar: () => fechar(opcao.valor),
            })),
            { rotulo: rotuloCancelar, variante: 'suave', aoTocar: () => fechar(null) },
          ],
        });
      }),
    [fechar]
  );

  const valor = useMemo(
    () => ({ avisar, confirmar, escolher }),
    [avisar, confirmar, escolher]
  );

  return (
    <DialogoContexto.Provider value={valor}>
      {children}
      {/* Fechar tocando fora responde "null": nem confirmou, nem escolheu. */}
      <Dialogo {...estado} aoFechar={() => fechar(null)} />
    </DialogoContexto.Provider>
  );
};

export const useDialogo = () => {
  const contexto = useContext(DialogoContexto);
  if (!contexto) throw new Error('useDialogo deve ser usado dentro de <DialogoProvider>.');
  return contexto;
};
