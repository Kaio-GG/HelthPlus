// Privacidade e auditoria — a área do nutricionista para a LGPD.
//
// Três abas:
//   Pedidos    o que os pacientes pediram pelo app (cópia, correção,
//              exclusão...), com o prazo legal de 15 dias e a resposta;
//   Atividade  o registro de auditoria das ações DELE: logins (inclusive
//              tentativas recusadas), fichas abertas, exportações. Serve
//              para ele notar se alguém está usando a conta;
//   Conta      cópia dos próprios dados e "sair de todos os aparelhos".
import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, TouchableOpacity } from 'react-native';

import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import Abas from '../../componentes/Abas';
import Botao from '../../componentes/Botao';
import Selo from '../../componentes/Selo';
import CampoTexto from '../../componentes/CampoTexto';
import CaixaAviso from '../../componentes/CaixaAviso';

import { useAuth } from '../../contexto/AuthContext';
import { useDialogo } from '../../contexto/DialogoContexto';
import {
  listarSolicitacoesDosPacientes,
  responderSolicitacao,
  listarMinhaAtividade,
  exportarDadosDoProfissional,
} from '../../Api/lgpd';
import { encerrarSessoesDoProfissional } from '../../Api/loginCadastro';
import { compartilharDados, dataHoraBR } from '../../utilitarios/compartilhar';
import { anunciar } from '../../utilitarios/acessibilidade';
import { estilos } from './style';

const ABAS = [
  { chave: 'pedidos', rotulo: 'Pedidos' },
  { chave: 'atividade', rotulo: 'Atividade' },
  { chave: 'conta', rotulo: 'Conta' },
];

const SELO_DO_STATUS = {
  aberta: { texto: 'Aberto', tom: 'alerta' },
  em_andamento: { texto: 'Em andamento', tom: 'info' },
  atendida: { texto: 'Atendido', tom: 'sucesso' },
  recusada: { texto: 'Recusado', tom: 'erro' },
};

// Ação do log -> frase. O que não estiver aqui aparece com o código.
const DESCRICAO_DA_ACAO = {
  'login.profissional': 'Entrou no aplicativo',
  'paciente.listar': 'Abriu a lista de pacientes',
  'paciente.ficha.ler': 'Abriu a ficha de um paciente',
  'paciente.evolucao.ler': 'Viu a evolução de um paciente',
  'paciente.cadastrar': 'Cadastrou um paciente',
  'paciente.excluir': 'Apagou um paciente',
  'paciente.exportar': 'Exportou os dados de um paciente',
  'paciente.acessos.ler': 'Viu o histórico de acessos de um paciente',
  'avaliacao.criar': 'Registrou uma avaliação',
  'consulta.criar': 'Marcou uma consulta',
  'consulta.status': 'Mudou o status de uma consulta',
  'convite.reenviar': 'Reenviou o acesso de um paciente',
  'convite.testador': 'Convidou alguém para testar o app',
  'senha.trocar': 'Trocou a senha',
  'senha.redefinir': 'Redefiniu a senha pelo e-mail',
  'senha.esqueci': 'Pediu a redefinição de senha',
  'sessao.encerrar_todas': 'Saiu de todos os aparelhos',
  'conta.profissional.criar': 'Criou a conta',
  'conta.profissional.atualizar': 'Atualizou os dados profissionais',
  'conta.bloqueio_temporario': 'Conta bloqueada por senhas erradas',
  'assinatura.alterar': 'Mudou o plano',
  'assinatura.cancelar': 'Cancelou o plano',
  'lgpd.solicitacao.responder': 'Respondeu a um pedido de paciente',
  'profissional.dados.exportar': 'Baixou a cópia dos próprios dados',
  'acesso.negado': 'Tentativa de acesso recusada',
};

const ItemPedido = ({ pedido, aoResponder }) => {
  const [aberto, setAberto] = useState(false);
  const [resposta, setResposta] = useState(pedido.resposta || '');
  const [salvando, setSalvando] = useState('');
  const selo = SELO_DO_STATUS[pedido.status] || SELO_DO_STATUS.aberta;
  const concluido = ['atendida', 'recusada'].includes(pedido.status);

  const responder = async (status) => {
    setSalvando(status);
    const ok = await aoResponder(pedido, status, resposta.trim());
    setSalvando('');
    if (ok) setAberto(false);
  };

  return (
    <View style={estilos.item}>
      <TouchableOpacity
        onPress={() => setAberto((v) => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded: aberto }}
        accessibilityLabel={
          `${pedido.rotuloTipo}, de ${pedido.nomePaciente}. ${selo.texto}.` +
          (concluido ? '' : ` Prazo: ${dataHoraBR(pedido.prazo)}.`) +
          (pedido.atrasada ? ' Prazo vencido.' : '')
        }
        accessibilityHint={aberto ? 'Toque para fechar' : 'Toque para responder'}
      >
        <View style={estilos.linhaItem}>
          <Text style={estilos.itemTitulo}>{pedido.rotuloTipo}</Text>
          <Selo texto={pedido.atrasada ? 'Atrasado' : selo.texto} tom={pedido.atrasada ? 'erro' : selo.tom} />
        </View>
        <Text style={estilos.itemPaciente}>{pedido.nomePaciente}</Text>
        <Text style={estilos.itemData}>
          Aberto em {dataHoraBR(pedido.abertaEm)}
          {concluido ? '' : ` · prazo ${dataHoraBR(pedido.prazo)}`}
        </Text>
      </TouchableOpacity>

      {aberto ? (
        <View style={estilos.detalhe}>
          {pedido.mensagem ? <Text style={estilos.mensagem}>“{pedido.mensagem}”</Text> : null}

          {pedido.tipo === 'eliminacao' ? (
            <CaixaAviso
              tom="info"
              estilo={estilos.aviso}
              texto="Para atender, apague o paciente na ficha dele (botão Apagar paciente). Se houver obrigação legal de guardar o prontuário, recuse explicando o motivo."
            />
          ) : null}
          {pedido.tipo === 'copia' ? (
            <CaixaAviso tom="info" estilo={estilos.aviso} texto="Gere a cópia na ficha do paciente (Exportar dados) e envie a ele." />
          ) : null}

          <CampoTexto
            rotulo="Resposta ao paciente"
            valor={resposta}
            aoMudar={setResposta}
            multilinha
            maxCaracteres={1000}
            placeholder="O paciente vê esta resposta no aplicativo."
          />

          <View style={estilos.botoes}>
            <Botao titulo="Em andamento" pequeno variante="contorno" carregando={salvando === 'em_andamento'} aoPressionar={() => responder('em_andamento')} />
            <Botao titulo="Atendido" pequeno carregando={salvando === 'atendida'} aoPressionar={() => responder('atendida')} />
            <Botao titulo="Recusar" pequeno variante="perigo" carregando={salvando === 'recusada'} aoPressionar={() => responder('recusada')} />
          </View>
        </View>
      ) : null}
    </View>
  );
};

const PrivacidadeNutricionista = ({ navigation, route }) => {
  const { token, sairSessao } = useAuth();
  const { avisar, confirmar } = useDialogo();

  const [aba, setAba] = useState(route.params?.aba || 'pedidos');
  const [pedidos, setPedidos] = useState([]);
  const [atividade, setAtividade] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [exportando, setExportando] = useState(false);

  const carregar = useCallback(async () => {
    if (!token) return;
    setCarregando(true);
    try {
      if (aba === 'pedidos') {
        const resposta = await listarSolicitacoesDosPacientes(token);
        setPedidos(resposta.solicitacoes || []);
      } else if (aba === 'atividade') {
        const resposta = await listarMinhaAtividade(token);
        setAtividade(resposta.atividade || []);
      }
    } catch (problema) {
      avisar({ titulo: 'Não foi possível carregar', mensagem: problema.message, tom: 'erro' });
    } finally {
      setCarregando(false);
    }
  }, [aba, token, avisar]);

  // Recarrega ao abrir a tela e ao voltar para ela.
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const responder = async (pedido, status, resposta) => {
    if (status === 'recusada' && !resposta) {
      avisar({ titulo: 'Explique o motivo', mensagem: 'Para recusar, escreva ao paciente o motivo da recusa.', tom: 'info' });
      return false;
    }
    try {
      await responderSolicitacao(token, pedido.id, status, resposta);
      anunciar('Pedido atualizado.');
      carregar();
      return true;
    } catch (problema) {
      avisar({ titulo: 'Não foi possível responder', mensagem: problema.message, tom: 'erro' });
      return false;
    }
  };

  const exportar = async () => {
    setExportando(true);
    try {
      const dados = await exportarDadosDoProfissional(token);
      await compartilharDados('Meus dados — Health Plus', dados);
    } catch (problema) {
      avisar({ titulo: 'Não foi possível gerar a cópia', mensagem: problema.message, tom: 'erro' });
    } finally {
      setExportando(false);
    }
  };

  const sairDeTodos = async () => {
    const certeza = await confirmar({
      titulo: 'Sair de todos os aparelhos?',
      mensagem: 'Todos os aparelhos em que a sua conta está aberta saem dela, inclusive este. Você vai precisar entrar de novo.',
      rotuloConfirmar: 'Sair de todos',
      perigo: true,
    });
    if (!certeza) return;

    try {
      await encerrarSessoesDoProfissional(token);
    } catch {
      // Mesmo com erro, este aparelho sai.
    }
    await sairSessao();
    navigation.reset({ index: 0, routes: [{ name: 'Inicio' }] });
  };

  const abertos = pedidos.filter((p) => ['aberta', 'em_andamento'].includes(p.status));

  return (
    <Tela
      titulo="Privacidade e auditoria"
      subtitulo="LGPD: pedidos dos pacientes e registro de atividade"
      aoAtualizar={aba === 'conta' ? undefined : carregar}
      atualizando={carregando}
    >
      <Cartao>
        <Abas abas={ABAS} ativa={aba} aoMudar={setAba} />

        {aba === 'pedidos' ? (
          <View>
            <Text style={estilos.texto}>
              {abertos.length > 0
                ? `${abertos.length} pedido(s) aguardando resposta. A LGPD dá 15 dias para a resposta completa.`
                : 'Nenhum pedido aguardando resposta.'}
            </Text>
            {pedidos.map((pedido) => (
              <ItemPedido key={pedido.id} pedido={pedido} aoResponder={responder} />
            ))}
          </View>
        ) : null}

        {aba === 'atividade' ? (
          <View>
            <Text style={estilos.texto}>
              As últimas ações feitas com a sua conta. Tentativa recusada que você não reconhece? Troque a senha e use “Sair de todos os aparelhos”.
            </Text>
            {!carregando && atividade.length === 0 ? <Text style={estilos.vazio}>Nada registrado ainda.</Text> : null}
            {atividade.map((evento) => {
              const descricao = DESCRICAO_DA_ACAO[evento.acao] || evento.acao;
              return (
                <View
                  key={evento.id}
                  style={estilos.item}
                  accessible
                  accessibilityLabel={`${descricao}${evento.sucesso ? '' : ', recusada'}. ${dataHoraBR(evento.quando)}.`}
                >
                  <View style={estilos.linhaItem}>
                    <Text style={estilos.itemTitulo}>{descricao}</Text>
                    {evento.sucesso ? null : <Selo texto="Recusada" tom="erro" />}
                  </View>
                  <Text style={estilos.itemData}>
                    {dataHoraBR(evento.quando)}
                    {evento.ip ? ` · IP ${evento.ip}` : ''}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : null}

        {aba === 'conta' ? (
          <View>
            <Text style={estilos.texto}>
              Uma cópia dos dados da sua conta: cadastro, plano, cobranças e preferências. Os dados dos pacientes ficam fora — exporte cada um na ficha dele.
            </Text>
            <Botao titulo="Baixar uma cópia dos meus dados" icone="download" carregando={exportando} aoPressionar={exportar} />

            <Text style={[estilos.texto, estilos.separado]}>Perdeu o celular ou entrou num aparelho que não é seu?</Text>
            <Botao titulo="Sair de todos os aparelhos" icone="sair" variante="contorno" aoPressionar={sairDeTodos} />
          </View>
        ) : null}
      </Cartao>
    </Tela>
  );
};

export default PrivacidadeNutricionista;
