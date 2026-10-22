// Quais avisos o nutricionista quer receber.
//
// Cada chave corresponde a uma coluna da tabela "preferencia_notificacao".
// Desligar um tipo não apaga o que já existe: só impede que novos avisos
// daquele tipo sejam criados.
import React, { useEffect, useState } from 'react';
import { View, Text, Switch, ActivityIndicator } from 'react-native';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import CaixaAviso from '../../componentes/CaixaAviso';
import { useNotificacoes } from '../../contexto/NotificacoesContexto';
import { cores } from '../../tema';
import { estilos } from './style';

const OPCOES = [
  {
    chave: 'consultas',
    coluna: 'st_consultas',
    titulo: 'Consultas',
    descricao: 'Consulta marcada, remarcada ou chegando.',
  },
  {
    chave: 'pacientes',
    coluna: 'st_pacientes',
    titulo: 'Pacientes',
    descricao: 'Paciente novo e registros enviados por ele.',
  },
  {
    chave: 'planos',
    coluna: 'st_planos',
    titulo: 'Planos alimentares',
    descricao: 'Plano chegando ao fim ou sem acompanhamento.',
  },
  {
    chave: 'sistema',
    coluna: 'st_sistema',
    titulo: 'Conta e assinatura',
    descricao: 'Cobrança, limite de pacientes e avisos do sistema.',
  },
  {
    chave: 'email',
    coluna: 'st_email',
    titulo: 'Resumo por e-mail',
    descricao: 'Um resumo do que aconteceu, no e-mail cadastrado.',
  },
];

const PreferenciasNotificacao = () => {
  const { preferencias, carregarPreferencias, alterarPreferencias } = useNotificacoes();

  const [salvando, setSalvando] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    carregarPreferencias();
  }, [carregarPreferencias]);

  const alternar = async (opcao, ligado) => {
    setSalvando(opcao.chave);
    setErro(null);

    try {
      await alterarPreferencias({ [opcao.chave]: ligado });
    } catch (problema) {
      // O contexto não guardou a mudança, então o interruptor volta sozinho
      // para onde estava; aqui só explicamos por quê.
      setErro(problema.message);
    } finally {
      setSalvando(null);
    }
  };

  if (!preferencias) {
    return (
      <Tela titulo="Notificações" subtitulo="O que você quer receber">
        <ActivityIndicator color={cores.verdeBotao} style={estilos.carregando} />
      </Tela>
    );
  }

  return (
    <Tela titulo="Notificações" subtitulo="O que você quer receber">
      {erro ? <CaixaAviso tom="alerta" icone="alerta" texto={erro} estilo={estilos.aviso} /> : null}

      <Cartao>
        {OPCOES.map((opcao, indice) => (
          <View
            key={opcao.chave}
            style={[estilos.linha, indice > 0 && estilos.linhaComTopo]}
          >
            <View style={estilos.textos}>
              <Text style={estilos.titulo}>{opcao.titulo}</Text>
              <Text style={estilos.descricao}>{opcao.descricao}</Text>
            </View>
            <Switch
              value={Boolean(preferencias[opcao.coluna])}
              onValueChange={(ligado) => alternar(opcao, ligado)}
              disabled={salvando === opcao.chave}
              trackColor={{ false: cores.linha, true: cores.verdeBotao }}
              thumbColor={cores.branco}
              accessibilityLabel={opcao.titulo}
            />
          </View>
        ))}
      </Cartao>

      <Text style={estilos.nota}>
        As mudanças valem a partir de agora. O que já está na sua lista de notificações continua lá.
      </Text>
    </Tela>
  );
};

export default PreferenciasNotificacao;
