// app/utilitarios/compartilhar.js
// Entrega a cópia dos dados (LGPD, Art. 18, II e V) pela folha de
// compartilhar do celular: a pessoa escolhe salvar em arquivo, mandar para
// o próprio e-mail ou abrir em outro aplicativo.
//
// Vai como texto (JSON formatado) porque é o que o Share do React Native
// manda sem pacote extra. O JSON é o formato "estruturado e interoperável"
// que a portabilidade pede, e abre em qualquer editor de texto.
import { Share } from 'react-native';

export async function compartilharDados(titulo, dados) {
  const texto = JSON.stringify(dados, null, 2);

  const resultado = await Share.share({ title: titulo, message: texto });

  return resultado.action === Share.sharedAction;
}

// "2026-11-07T15:04:00Z" -> "07/11/2026 às 12:04" (no fuso do aparelho).
export function dataHoraBR(iso) {
  if (!iso) return '—';
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return String(iso);

  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const hora = String(data.getHours()).padStart(2, '0');
  const minuto = String(data.getMinutes()).padStart(2, '0');

  return `${dia}/${mes}/${data.getFullYear()} às ${hora}:${minuto}`;
}
