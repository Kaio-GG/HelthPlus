// app/utilitarios/useRelatorioPdf.js
// O botão "Baixar relatório em PDF" do paciente, num lugar só.
//
// Usado em "Minha evolução" e em "Meus dados e privacidade":
//
//   const { baixarRelatorioPdf, gerandoPdf } = useRelatorioPdf();
//   <Botao titulo="Baixar relatório em PDF" carregando={gerandoPdf} aoPressionar={baixarRelatorioPdf} />
import { useCallback, useState } from 'react';

import { useDados } from '../contexto/DadosContexto';
import { useDialogo } from '../contexto/DialogoContexto';
import { exportarMeusDados } from '../Api/lgpd';
import { gerarECompartilharPdf } from './relatorioPdf';
import { anunciar } from './acessibilidade';

export function useRelatorioPdf() {
  const { tokenPaciente } = useDados();
  const { avisar } = useDialogo();
  const [gerandoPdf, setGerandoPdf] = useState(false);

  const baixarRelatorioPdf = useCallback(async () => {
    if (gerandoPdf) return;

    setGerandoPdf(true);
    anunciar('Gerando o relatório em PDF.');

    try {
      const dados = await exportarMeusDados(tokenPaciente, 'pdf');
      await gerarECompartilharPdf(dados);
    } catch (problema) {
      avisar({
        titulo: 'Não foi possível gerar o PDF',
        mensagem: problema.message,
        tom: 'erro',
      });
    } finally {
      setGerandoPdf(false);
    }
  }, [gerandoPdf, tokenPaciente, avisar]);

  return { baixarRelatorioPdf, gerandoPdf };
}
