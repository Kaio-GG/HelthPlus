// Meus dados e privacidade — os direitos do paciente pela LGPD (Art. 18),
// exercidos de dentro do aplicativo, e não só citados nos Termos:
//
//   - baixar uma cópia de tudo o que está guardado (acesso e portabilidade);
//   - ver quem acessou os dados (histórico de acessos);
//   - pedir ao nutricionista correção, exclusão, informação... (prazo de 15
//     dias, Art. 19, II);
//   - revogar o consentimento (Art. 8º, §5º);
//   - sair de todos os aparelhos.
import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text } from 'react-native';

import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import Botao from '../../componentes/Botao';
import Chip from '../../componentes/Chip';
import Selo from '../../componentes/Selo';
import CampoTexto from '../../componentes/CampoTexto';
import CaixaAviso from '../../componentes/CaixaAviso';
import SemSessaoPaciente from '../../componentes/SemSessaoPaciente';

import { useDados } from '../../contexto/DadosContexto';
import { useDialogo } from '../../contexto/DialogoContexto';
import {
  exportarMeusDados,
  listarMeusConsentimentos,
  revogarMeuConsentimento,
  listarMinhasSolicitacoes,
  enviarSolicitacao,
} from '../../Api/lgpd';
import { encerrarSessoesDoPaciente } from '../../Api/Pacientes';
import { compartilharDados, dataHoraBR } from '../../utilitarios/compartilhar';
import { anunciar } from '../../utilitarios/acessibilidade';
import { useRelatorioPdf } from '../../utilitarios/useRelatorioPdf';
import { estilos } from './style';

const TIPOS = [
  { chave: 'correcao', rotulo: 'Corrigir dados', dica: 'Diga o que está errado e como fica certo.' },
  { chave: 'eliminacao', rotulo: 'Apagar meus dados', dica: 'O nutricionista avalia e responde em até 15 dias.' },
  { chave: 'informacao', rotulo: 'Tirar uma dúvida', dica: 'Sobre como os seus dados são usados.' },
  { chave: 'oposicao', rotulo: 'Me opor a um uso', dica: 'Diga qual uso dos dados você não aceita.' },
];

const SELO_DO_STATUS = {
  aberta: { texto: 'Aberto', tom: 'alerta' },
  em_andamento: { texto: 'Em andamento', tom: 'info' },
  atendida: { texto: 'Atendido', tom: 'sucesso' },
  recusada: { texto: 'Recusado', tom: 'erro' },
};

const NOME_DO_CONSENTIMENTO = {
  termos_privacidade: 'Termos de Uso e Política de Privacidade',
  tratamento_dados_saude: 'Uso dos dados de saúde',
};

const PrivacidadePaciente = ({ navigation }) => {
  const { pacienteAtual: paciente, tokenPaciente, sairComoPaciente } = useDados();
  const { avisar, confirmar } = useDialogo();
  const { baixarRelatorioPdf, gerandoPdf } = useRelatorioPdf();

  const [consentimentos, setConsentimentos] = useState([]);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [tipo, setTipo] = useState('correcao');
  const [mensagem, setMensagem] = useState('');
  const [ocupado, setOcupado] = useState('');
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    if (!tokenPaciente) return;
    setCarregando(true);
    try {
      const [c, s] = await Promise.all([
        listarMeusConsentimentos(tokenPaciente),
        listarMinhasSolicitacoes(tokenPaciente),
      ]);
      setConsentimentos(c.consentimentos || []);
      setSolicitacoes(s.solicitacoes || []);
    } catch (problema) {
      avisar({ titulo: 'Não foi possível carregar', mensagem: problema.message, tom: 'erro' });
    } finally {
      setCarregando(false);
    }
  }, [tokenPaciente, avisar]);

  // Recarrega ao abrir a tela e ao voltar para ela.
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  if (!paciente) return <SemSessaoPaciente />;

  const vigentes = consentimentos.filter((c) => c.vigente);

  const baixarCopia = async () => {
    setOcupado('copia');
    try {
      const dados = await exportarMeusDados(tokenPaciente);
      await compartilharDados('Meus dados — Health Plus', dados);
    } catch (problema) {
      avisar({ titulo: 'Não foi possível gerar a cópia', mensagem: problema.message, tom: 'erro' });
    } finally {
      setOcupado('');
    }
  };

  const enviarPedido = async () => {
    if (tipo !== 'eliminacao' && mensagem.trim().length < 5) {
      avisar({ titulo: 'Conte um pouco mais', mensagem: 'Escreva o seu pedido para o nutricionista entender.', tom: 'info' });
      return;
    }

    setOcupado('pedido');
    try {
      const resposta = await enviarSolicitacao(tokenPaciente, tipo, mensagem.trim());
      setMensagem('');
      anunciar('Pedido enviado.');
      await avisar({ titulo: 'Pedido enviado', mensagem: resposta.mensagem, tom: 'sucesso' });
      carregar();
    } catch (problema) {
      avisar({ titulo: 'Não foi possível enviar', mensagem: problema.message, tom: 'erro' });
    } finally {
      setOcupado('');
    }
  };

  const revogar = async () => {
    const certeza = await confirmar({
      titulo: 'Revogar o consentimento?',
      mensagem:
        'Você sai do aplicativo agora e não entra mais até aceitar de novo. ' +
        'O seu nutricionista é avisado. O acompanhamento com ele continua, só que fora do aplicativo. ' +
        'Os registros já feitos não são apagados por isto — para pedir a exclusão, use "Apagar meus dados".',
      rotuloConfirmar: 'Revogar',
      rotuloCancelar: 'Cancelar',
      perigo: true,
    });
    if (!certeza) return;

    setOcupado('revogar');
    try {
      const resposta = await revogarMeuConsentimento(tokenPaciente);
      sairComoPaciente();
      navigation.reset({ index: 0, routes: [{ name: 'Inicio' }] });
      avisar({ titulo: 'Consentimento revogado', mensagem: resposta.mensagem, tom: 'info' });
    } catch (problema) {
      setOcupado('');
      avisar({ titulo: 'Não foi possível revogar', mensagem: problema.message, tom: 'erro' });
    }
  };

  const sairDeTodos = async () => {
    const certeza = await confirmar({
      titulo: 'Sair de todos os aparelhos?',
      mensagem: 'Todos os celulares em que a sua conta está aberta saem dela, inclusive este.',
      rotuloConfirmar: 'Sair de todos',
      perigo: true,
    });
    if (!certeza) return;

    try {
      await encerrarSessoesDoPaciente(tokenPaciente);
    } catch {
      // Mesmo com erro, este aparelho sai.
    }
    sairComoPaciente();
    navigation.reset({ index: 0, routes: [{ name: 'Inicio' }] });
  };

  const tipoEscolhido = TIPOS.find((t) => t.chave === tipo);

  return (
    <Tela
      titulo="Meus dados"
      subtitulo="Privacidade e os seus direitos"
      aoAtualizar={carregar}
      atualizando={carregando}
    >
      <Cartao>
        <Text style={estilos.titulo} accessibilityRole="header">
          Uma cópia de tudo
        </Text>
        <Text style={estilos.texto}>
          O relatório em PDF é para ler, imprimir ou levar a outro profissional. O arquivo de dados tem tudo o que está
          guardado, num formato que outro sistema consegue importar.
        </Text>
        <Botao
          titulo="Baixar relatório em PDF"
          icone="download"
          aoPressionar={baixarRelatorioPdf}
          carregando={gerandoPdf}
          dica="Gera um PDF com a sua ficha, as avaliações, os gráficos e as consultas"
          estilo={estilos.botao}
        />
        <Botao
          titulo="Baixar o arquivo de dados"
          icone="download"
          variante="contorno"
          aoPressionar={baixarCopia}
          carregando={ocupado === 'copia'}
          dica="Cópia completa em formato JSON"
          estilo={estilos.botao}
        />
        <Botao
          titulo="Ver quem acessou os meus dados"
          icone="historico"
          variante="contorno"
          aoPressionar={() => navigation.navigate('HistoricoAcessos')}
          estilo={estilos.botao}
        />
      </Cartao>

      <Cartao>
        <Text style={estilos.titulo} accessibilityRole="header">
          Fazer um pedido
        </Text>
        <Text style={estilos.texto}>O pedido vai para o seu nutricionista, que tem até 15 dias para responder.</Text>

        <View style={estilos.chips}>
          {TIPOS.map((t) => (
            <Chip key={t.chave} rotulo={t.rotulo} ativo={tipo === t.chave} aoPressionar={() => setTipo(t.chave)} comCheck />
          ))}
        </View>

        <CampoTexto
          rotulo="Seu pedido"
          valor={mensagem}
          aoMudar={setMensagem}
          placeholder={tipoEscolhido?.dica}
          multilinha
          maxCaracteres={1000}
          contador
        />

        <Botao titulo="Enviar pedido" icone="enviar" aoPressionar={enviarPedido} carregando={ocupado === 'pedido'} />

        {solicitacoes.length > 0 ? (
          <View style={estilos.lista}>
            <Text style={estilos.subtitulo} accessibilityRole="header">
              Seus pedidos
            </Text>
            {solicitacoes.map((s) => {
              const selo = SELO_DO_STATUS[s.status] || SELO_DO_STATUS.aberta;
              return (
                <View
                  key={s.id}
                  style={estilos.item}
                  accessible
                  accessibilityLabel={`${s.rotuloTipo}, ${selo.texto}. Aberto em ${dataHoraBR(s.abertaEm)}.${s.resposta ? ` Resposta: ${s.resposta}` : ''}`}
                >
                  <View style={estilos.linhaItem}>
                    <Text style={estilos.itemTitulo}>{s.rotuloTipo}</Text>
                    <Selo texto={selo.texto} tom={selo.tom} />
                  </View>
                  <Text style={estilos.itemData}>Aberto em {dataHoraBR(s.abertaEm)}</Text>
                  {s.resposta ? <Text style={estilos.texto}>Resposta: {s.resposta}</Text> : null}
                </View>
              );
            })}
          </View>
        ) : null}
      </Cartao>

      <Cartao>
        <Text style={estilos.titulo} accessibilityRole="header">
          Seu consentimento
        </Text>

        {vigentes.length > 0 ? (
          vigentes.map((c) => (
            <Text key={c.id} style={estilos.texto}>
              ✓ {NOME_DO_CONSENTIMENTO[c.tipo] || c.tipo} — aceito em {dataHoraBR(c.registradoEm)}
              {c.consentidor === 'responsavel' && c.nomeConsentidor ? ` por ${c.nomeConsentidor} (responsável)` : ''}
            </Text>
          ))
        ) : (
          <Text style={estilos.texto}>{carregando ? 'Carregando...' : 'Nenhum aceite vigente.'}</Text>
        )}

        <CaixaAviso
          tom="alerta"
          estilo={estilos.aviso}
          texto="Revogar tira você do aplicativo até aceitar de novo. Não apaga o que já foi registrado."
        />

        <Botao
          titulo="Revogar meu consentimento"
          variante="perigo"
          aoPressionar={revogar}
          carregando={ocupado === 'revogar'}
          desabilitado={vigentes.length === 0}
        />
      </Cartao>

      <Cartao>
        <Text style={estilos.titulo} accessibilityRole="header">
          Segurança da conta
        </Text>
        <Text style={estilos.texto}>Perdeu o celular ou entrou num aparelho que não é seu?</Text>
        <Botao titulo="Sair de todos os aparelhos" icone="sair" variante="contorno" aoPressionar={sairDeTodos} />
      </Cartao>
    </Tela>
  );
};

export default PrivacidadePaciente;
