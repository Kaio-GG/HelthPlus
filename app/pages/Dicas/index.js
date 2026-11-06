// Saúde e dicas: a tela de conteúdo da área do paciente.
//
// Por que ela existe: tirados os registros de água e refeições e o "Meu
// plano", o aplicativo do paciente ficaria com duas telas de números e
// nada para ler. Esta tela é o que ele abre entre uma consulta e outra.
//
// Nada aqui depende de banco nem de API: o conteúdo é texto fixo
// (dados/conteudoSaude.js) e os cálculos são feitos na hora, no celular.
// A lista de hábitos é um checklist para o paciente olhar o próprio dia —
// ela NÃO é gravada em lugar nenhum, e a tela diz isso, para ninguém
// achar que o nutricionista está do outro lado vendo os quadradinhos.
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import Logo from '../../componentes/Logo';
import Icone from '../../componentes/Icone';
import CampoTexto from '../../componentes/CampoTexto';
import CaixaAviso from '../../componentes/CaixaAviso';
import GraficoPizza from '../../componentes/GraficoPizza';

import { cores } from '../../tema';
import { aplicarMascaraDecimal, decimalParaNumero } from '../../utilitarios/mascaras';
import { formatarNumero } from '../../utilitarios/formatos';
import {
  dicaDeHoje,
  gruposDoPrato,
  perguntasFrequentes,
  sinaisDeAlerta,
  aguaRecomendadaLitros,
  emCoposDe250,
} from '../../dados/conteudoSaude';
import { estilos } from './style';

const Dicas = () => {
  // Qual grupo do prato está aberto.
  const [grupoAberto, setGrupoAberto] = useState(gruposDoPrato[0].chave);

  // Qual pergunta está aberta no acordeão.
  const [perguntaAberta, setPerguntaAberta] = useState(null);

  // Calculadora de água.
  const [peso, setPeso] = useState('');
  const [ehCrianca, setEhCrianca] = useState(false);

  const pesoNumero = decimalParaNumero(peso);
  const aguaLitros = aguaRecomendadaLitros(pesoNumero, ehCrianca ? 10 : 30);
  const copos = emCoposDe250(aguaLitros);

  const grupoSelecionado =
    gruposDoPrato.find((grupo) => grupo.chave === grupoAberto) ?? gruposDoPrato[0];

  return (
    <Tela
      titulo="Saúde e dicas"
      subtitulo="Para ler entre uma consulta e outra"
      direita={<Logo />}
      cabecalhoRolavel
    >
      {/* ---------- Dica do dia ---------- */}
      <Cartao estilo={estilos.cartaoDica}>
        <View style={estilos.linhaDica}>
          <View style={estilos.circuloDica}>
            <Icone nome="info" tamanho={20} cor={cores.verdeEscuro} />
          </View>
          <Text style={estilos.rotuloDica}>Dica de hoje</Text>
        </View>
        <Text style={estilos.textoDica}>{dicaDeHoje()}</Text>
        <Text style={estilos.notaDica}>Uma nova amanhã.</Text>
      </Cartao>

      {/* ---------- O prato saudável ---------- */}
      <Cartao>
        <Text style={estilos.tituloCartao}>Como montar o prato</Text>
        <Text style={estilos.subtituloCartao}>
          Não precisa contar caloria: é proporção. Toque numa parte do prato para
          ver o que entra nela.
        </Text>

        <GraficoPizza
          fatias={gruposDoPrato.map((grupo) => ({
            rotulo: grupo.nome,
            valor: grupo.proporcao,
            cor: grupo.cor,
          }))}
          tamanho={130}
          espessura={30}
          centro={{ valor: '1/2', rotulo: 'é vegetal' }}
        />

        <View style={estilos.linhaBotoesGrupo}>
          {gruposDoPrato.map((grupo) => {
            const ativo = grupo.chave === grupoAberto;

            return (
              <TouchableOpacity
                key={grupo.chave}
                style={[estilos.botaoGrupo, ativo && estilos.botaoGrupoAtivo]}
                onPress={() => setGrupoAberto(grupo.chave)}
                accessibilityRole="button"
                accessibilityState={{ selected: ativo }}
              >
                <View style={[estilos.bolinhaGrupo, { backgroundColor: grupo.cor }]} />
                <Text style={[estilos.textoGrupo, ativo && estilos.textoGrupoAtivo]}>
                  {grupo.proporcao}%
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={estilos.detalheGrupo}>
          <Text style={estilos.nomeGrupo}>{grupoSelecionado.nome}</Text>
          <Text style={estilos.resumoGrupo}>{grupoSelecionado.resumo}</Text>

          {grupoSelecionado.exemplos.map((exemplo) => (
            <View key={exemplo} style={estilos.linhaExemplo}>
              <Icone nome="check" tamanho={13} cor={cores.verdeBotao} espessura={3} />
              <Text style={estilos.textoExemplo}>{exemplo}</Text>
            </View>
          ))}

          <Text style={estilos.porqueGrupo}>{grupoSelecionado.porque}</Text>
        </View>
      </Cartao>

      {/* ---------- Quanta água por dia ---------- */}
      <Cartao>
        <Text style={estilos.tituloCartao}>Quanta água por dia?</Text>
        <Text style={estilos.subtituloCartao}>
          Informe o seu peso e a conta sai na hora. É estimativa, não prescrição.
        </Text>

        <View style={estilos.linhaCalculadora}>
          <CampoTexto
            rotulo="Peso (kg)"
            valor={peso}
            aoMudar={(texto) => setPeso(aplicarMascaraDecimal(texto))}
            placeholder="0,0"
            teclado="decimal-pad"
            estilo={estilos.campoPeso}
          />

          <TouchableOpacity
            style={[estilos.chaveIdade, ehCrianca && estilos.chaveIdadeAtiva]}
            onPress={() => setEhCrianca(!ehCrianca)}
            accessibilityRole="switch"
            accessibilityState={{ checked: ehCrianca }}
          >
            <Text style={[estilos.textoChave, ehCrianca && estilos.textoChaveAtivo]}>
              {ehCrianca ? 'Menor de 18' : '18 anos ou mais'}
            </Text>
            <Text style={estilos.dicaChave}>Toque para trocar</Text>
          </TouchableOpacity>
        </View>

        {aguaLitros ? (
          <View style={estilos.resultadoAgua}>
            <Text style={estilos.valorAgua}>{formatarNumero(aguaLitros, 1)} L</Text>
            <Text style={estilos.detalheAgua}>
              por dia, mais ou menos {copos} copos de 250 ml
            </Text>
            <Text style={estilos.notaAgua}>
              {ehCrianca
                ? 'Para crianças a conta é por faixa de peso (100 ml/kg até 10 kg, 50 ml/kg nos 10 seguintes, 20 ml/kg no restante).'
                : 'A conta usada é 35 ml por quilo, que é a regra prática mais comum para adultos.'}{' '}
              Em dia quente, com exercício ou com febre, precisa de mais.
            </Text>
          </View>
        ) : (
          <Text style={estilos.semResultado}>
            Digite o peso para ver a estimativa.
          </Text>
        )}
      </Cartao>

      {/* ---------- Perguntas frequentes ---------- */}
      <Cartao>
        <Text style={estilos.tituloCartao}>Perguntas que todo mundo faz</Text>
        <Text style={estilos.subtituloCartao}>
          Inclusive sobre os números que aparecem na sua evolução.
        </Text>

        {perguntasFrequentes.map((item) => {
          const aberta = perguntaAberta === item.chave;

          return (
            <View key={item.chave} style={estilos.blocoPergunta}>
              <TouchableOpacity
                style={estilos.linhaPergunta}
                onPress={() => setPerguntaAberta(aberta ? null : item.chave)}
                accessibilityRole="button"
                accessibilityState={{ expanded: aberta }}
              >
                <Text style={estilos.textoPergunta}>{item.pergunta}</Text>
                <Icone
                  nome={aberta ? 'chevron-esquerda' : 'chevron-direita'}
                  tamanho={16}
                  cor={cores.verdeLink}
                />
              </TouchableOpacity>

              {aberta ? <Text style={estilos.textoResposta}>{item.resposta}</Text> : null}
            </View>
          );
        })}
      </Cartao>

      {/* ---------- Quando não esperar a próxima consulta ---------- */}
      <Cartao>
        <Text style={estilos.tituloCartao}>Quando procurar antes da consulta</Text>
        <Text style={estilos.subtituloCartao}>
          Nestes casos, vale falar com o seu nutricionista sem esperar a data
          marcada.
        </Text>

        {sinaisDeAlerta.map((sinal) => (
          <View key={sinal} style={estilos.linhaSinal}>
            <Icone nome="alerta" tamanho={15} cor={cores.alertaTexto} />
            <Text style={estilos.textoSinal}>{sinal}</Text>
          </View>
        ))}

        <CaixaAviso
          tom="alerta"
          icone="alerta"
          estilo={estilos.avisoChecklist}
          texto="Este aplicativo não faz diagnóstico e não substitui consulta. Em caso de mal-estar forte, procure atendimento médico."
        />
      </Cartao>

      <Text style={estilos.fonte}>
        Orientações gerais, com base no Guia Alimentar para a População Brasileira
        (Ministério da Saúde, 2014) e nas recomendações de alimentação saudável da
        OMS. Quem orienta o seu caso é o seu nutricionista.
      </Text>
    </Tela>
  );
};

export default Dicas;
