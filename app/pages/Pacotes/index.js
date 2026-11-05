// Pacotes de assinatura do nutricionista (individual e clínica).
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import Alternador from '../../componentes/Alternador';
import CaixaAviso from '../../componentes/CaixaAviso';
import Selo from '../../componentes/Selo';
import Icone from '../../componentes/Icone';
import Botao from '../../componentes/Botao';
import { useDados } from '../../contexto/DadosContexto';
import { useDialogo } from '../../contexto/DialogoContexto';
import { planosIndividuais, planosClinica } from '../../dados/planosAssinatura';
import { cores } from '../../tema';
import { formatarMoeda } from '../../utilitarios/formatos';
import { estilos } from './style';

const Pacotes = ({ navigation }) => {
  const {
    pacientes,
    planoAtual,
    limitePacientes,
    carregandoAssinatura,
    erroAssinatura,
    alterarPlanoAssinatura,
    cancelarPlanoAssinatura,
  } = useDados();
  const { avisar, confirmar } = useDialogo();
  const [tipo, setTipo] = useState('individual');
  // Trava os botões enquanto a API grava a assinatura.
  const [salvando, setSalvando] = useState(false);

  const listaDePlanos = tipo === 'individual' ? planosIndividuais : planosClinica;
  const indiceDoPlanoAtual = planosIndividuais.findIndex((plano) => plano.id === planoAtual?.id);

  // O selo "Mais escolhido" existe para ajudar quem ainda não decidiu. Ele
  // some assim que o plano em questão é MAIS BARATO que o já assinado: ali
  // ele deixaria de ser orientação e viraria convite para pagar menos.
  const podeDestacar = (plano, indice) => {
    if (!plano.destaque || planoAtual?.id === plano.id) return false;
    if (tipo !== 'individual' || !planoAtual) return true;
    return indice > indiceDoPlanoAtual;
  };

  // Contratação / troca de plano (upgrade vale na hora; downgrade confere o limite).
  const escolherPlano = async (plano, ehDowngrade) => {
    if (plano.preco === null) {
      avisar({
        titulo: 'Falar com a equipe',
        mensagem: 'Nossa equipe entrará em contato para montar uma proposta.',
      });
      return;
    }

    if (ehDowngrade && plano.limitePacientes !== null && pacientes.length > plano.limitePacientes) {
      avisar({
        titulo: 'Não é possível reduzir o plano',
        mensagem: `Você tem ${pacientes.length} pacientes e o plano ${plano.nome} permite até ${plano.limitePacientes}. Arquive alguns pacientes antes.`,
        tom: 'alerta',
      });
      return;
    }

    const confirmou = await confirmar({
      titulo: `Plano ${plano.nome}`,
      mensagem: `${formatarMoeda(plano.preco)}/mês. ${
        ehDowngrade ? 'O downgrade vale no fim do ciclo atual.' : 'O upgrade vale na hora.'
      }`,
      tom: 'info',
      rotuloConfirmar: 'Confirmar',
    });
    if (!confirmou) return;

    // TODO: integrar com a API de pagamento (cobrança da assinatura).
    // Hoje a API só grava a assinatura e o registro da cobrança.
    try {
      setSalvando(true);

      await alterarPlanoAssinatura(plano.id);

      await avisar({
        titulo: 'Plano atualizado!',
        mensagem: `Agora você está no plano ${plano.nome}.`,
        tom: 'sucesso',
      });

      // Assinar é o fim desta tela: quem acabou de contratar quer ver o
      // plano valendo na tela inicial, não a lista de planos de novo.
      navigation.navigate('HomeNutricionista');
    } catch (erro) {
      avisar({
        titulo: 'Não foi possível assinar',
        mensagem: erro.message || 'Tente de novo em instantes.',
        tom: 'erro',
      });
    } finally {
      setSalvando(false);
    }
  };

  const cancelarAssinatura = async () => {
    const confirmou = await confirmar({
      titulo: 'Cancelar assinatura',
      mensagem:
        `Você fica sem plano no fim do ciclo atual e perde o limite de ` +
        `${limitePacientes || 'pacientes ilimitados'}. Os pacientes já cadastrados continuam na sua lista.`,
      rotuloConfirmar: 'Cancelar assinatura',
      rotuloCancelar: 'Manter plano',
      perigo: true,
    });
    if (!confirmou) return;

    // TODO: integrar com a API de pagamento (encerrar a assinatura).
    try {
      setSalvando(true);

      await cancelarPlanoAssinatura();

      avisar({
        titulo: 'Assinatura cancelada',
        mensagem: 'Você pode assinar de novo quando quiser, por esta mesma tela.',
        tom: 'sucesso',
      });
    } catch (erro) {
      avisar({
        titulo: 'Não foi possível cancelar',
        mensagem: erro.message || 'Tente de novo em instantes.',
        tom: 'erro',
      });
    } finally {
      setSalvando(false);
    }
  };

  const textoDoBotao = (plano, indice) => {
    if (planoAtual?.id === plano.id) return 'Plano atual';
    if (plano.preco === null) return 'Falar com a equipe';
    if (tipo === 'clinica') return 'Contratar plano';
    return indice > indiceDoPlanoAtual ? 'Fazer upgrade' : 'Fazer downgrade';
  };

  return (
    <Tela
      titulo="Planos"
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
            tom={erroAssinatura ? 'alerta' : 'info'}
            texto={
              carregandoAssinatura
                ? 'Carregando o seu plano...'
                : erroAssinatura
                  ? erroAssinatura
                  : planoAtual
                    ? `Seu plano atual: ${planoAtual.nome} • ${pacientes.length} de ${limitePacientes || 'ilimitados'} pacientes`
                    : 'Você ainda não assinou nenhum plano. Escolha um abaixo para liberar o cadastro de pacientes.'
            }
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
          <Cartao
            key={plano.id}
            estilo={[estilos.cartaoPlano, podeDestacar(plano, indice) && estilos.cartaoDestaque]}
          >
            <View style={estilos.linhaTitulo}>
              <Text style={estilos.nomePlano}>{plano.nome}</Text>
              {ehAtual ? <Selo texto="Plano atual" tom="neutro" /> : null}
              {podeDestacar(plano, indice) ? <Selo texto="Mais escolhido" tom="sucesso" /> : null}
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
              titulo={salvando ? (ehAtual ? textoDoBotao(plano, indice) : 'Aguarde...') : textoDoBotao(plano, indice)}
              aoPressionar={() => escolherPlano(plano, ehDowngrade)}
              desabilitado={ehAtual || salvando || carregandoAssinatura}
              variante={ehAtual ? 'suave' : podeDestacar(plano, indice) ? 'primario' : 'contorno'}
              estilo={estilos.botaoPlano}
            />
          </Cartao>
        );
      })}

      {planoAtual ? (
        <Botao
          titulo="Cancelar assinatura"
          variante="perigo"
          desabilitado={salvando}
          aoPressionar={cancelarAssinatura}
          estilo={estilos.botaoCancelar}
        />
      ) : null}

      <Text style={estilos.rodapeNota}>
        Valores fictícios, apenas para ilustração. Upgrade vale na hora. Downgrade vale no fim do ciclo, se o
        limite de pacientes permitir.
      </Text>
    </Tela>
  );
};

export default Pacotes;
