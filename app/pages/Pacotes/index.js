// Pacotes de assinatura do nutricionista (individual e clínica).
import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import Alternador from '../../componentes/Alternador';
import CaixaAviso from '../../componentes/CaixaAviso';
import Selo from '../../componentes/Selo';
import Icone from '../../componentes/Icone';
import Botao from '../../componentes/Botao';
import { useDados } from '../../contexto/DadosContexto';
import { planosIndividuais, planosClinica } from '../../dados/planosAssinatura';
import { cores } from '../../tema';
import { formatarMoeda } from '../../utilitarios/formatos';
import { estilos } from './style';

const Pacotes = ({ navigation }) => {
  const { pacientes, planoAtual, limitePacientes, alterarPlanoAssinatura } = useDados();
  const [tipo, setTipo] = useState('individual');

  const listaDePlanos = tipo === 'individual' ? planosIndividuais : planosClinica;
  const indiceDoPlanoAtual = planosIndividuais.findIndex((plano) => plano.id === planoAtual?.id);

  // Contratação / troca de plano (upgrade vale na hora; downgrade confere o limite).
  const escolherPlano = (plano, ehDowngrade) => {
    if (plano.preco === null) {
      Alert.alert('Falar com a equipe', 'Nossa equipe entrará em contato para montar uma proposta.');
      return;
    }

    if (ehDowngrade && plano.limitePacientes !== null && pacientes.length > plano.limitePacientes) {
      Alert.alert(
        'Não é possível reduzir o plano',
        `Você tem ${pacientes.length} pacientes e o plano ${plano.nome} permite até ${plano.limitePacientes}. Arquive alguns pacientes antes.`
      );
      return;
    }

    const aviso = ehDowngrade
      ? 'O downgrade vale no fim do ciclo atual.'
      : 'O upgrade vale na hora.';

    Alert.alert(
      `Plano ${plano.nome}`,
      `${formatarMoeda(plano.preco)}/mês. ${aviso}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            // TODO: integrar com a API de pagamento (cobrança da assinatura).
            alterarPlanoAssinatura(plano.id);
            Alert.alert('Plano atualizado!', `Agora você está no plano ${plano.nome}.`);
          },
        },
      ]
    );
  };

  const textoDoBotao = (plano, indice) => {
    if (planoAtual?.id === plano.id) return 'Plano atual';
    if (plano.preco === null) return 'Falar com a equipe';
    if (tipo === 'clinica') return 'Contratar plano';
    return indice > indiceDoPlanoAtual ? 'Fazer upgrade' : 'Fazer downgrade';
  };

  return (
    <Tela
      titulo={tipo === 'individual' ? 'Pacotes' : 'Planos'}
      subtitulo={tipo === 'individual' ? 'Escolha o plano ideal para você' : 'Planos para clínicas com equipe'}
    >
      <Cartao>
        <Alternador
          opcoes={[
            { valor: 'individual', rotulo: 'Individual' },
            { valor: 'clinica', rotulo: 'Clínica' },
          ]}
          valor={tipo}
          aoMudar={setTipo}
          estilo={estilos.alternador}
        />

        {tipo === 'individual' ? (
          <CaixaAviso
            estilo={estilos.avisoPlano}
            texto={`Seu plano atual: ${planoAtual?.nome} • ${pacientes.length} de ${limitePacientes || 'ilimitados'} pacientes`}
          />
        ) : (
          <CaixaAviso
            estilo={estilos.avisoPlano}
            texto="Plano Clínica: vários nutricionistas e um administrador que gerencia a equipe e as permissões de acesso."
          />
        )}
      </Cartao>

      {listaDePlanos.map((plano, indice) => {
        const ehAtual = planoAtual?.id === plano.id;
        const ehDowngrade = tipo === 'individual' && indice < indiceDoPlanoAtual;
        return (
          <Cartao key={plano.id} estilo={[estilos.cartaoPlano, plano.destaque && estilos.cartaoDestaque]}>
            <View style={estilos.linhaTitulo}>
              <Text style={estilos.nomePlano}>{plano.nome}</Text>
              {ehAtual ? <Selo texto="Plano atual" tom="neutro" /> : null}
              {!ehAtual && plano.destaque ? <Selo texto="Mais escolhido" tom="sucesso" /> : null}
            </View>
            <Text style={estilos.descricaoPlano}>{plano.descricao}</Text>

            {plano.preco === null ? (
              <Text style={estilos.precoSobConsulta}>Sob consulta</Text>
            ) : (
              <Text style={estilos.preco}>
                {formatarMoeda(plano.preco)} <Text style={estilos.porMes}>/mês</Text>
              </Text>
            )}

            {plano.beneficios.map((beneficio) => (
              <View key={beneficio} style={estilos.linhaBeneficio}>
                <Icone nome="check" tamanho={16} cor={cores.verdeBotao} espessura={3} />
                <Text style={estilos.textoBeneficio}>{beneficio}</Text>
              </View>
            ))}

            <Botao
              titulo={textoDoBotao(plano, indice)}
              aoPressionar={() => escolherPlano(plano, ehDowngrade)}
              desabilitado={ehAtual}
              variante={ehAtual ? 'suave' : plano.destaque ? 'primario' : 'contorno'}
              estilo={estilos.botaoPlano}
            />
          </Cartao>
        );
      })}

      <Text style={estilos.rodapeNota}>
        Valores fictícios, apenas para ilustração. Upgrade vale na hora. Downgrade vale no fim do ciclo, se o
        limite de pacientes permitir.
      </Text>
    </Tela>
  );
};

export default Pacotes;
