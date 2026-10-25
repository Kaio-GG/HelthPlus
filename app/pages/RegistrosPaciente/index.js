// Registros do dia feitos pelo paciente: água e refeições.
// O nutricionista vê estes registros (somente leitura) na aba "Registros" da ficha.
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import Icone from '../../componentes/Icone';
import Selo from '../../componentes/Selo';
import Botao from '../../componentes/Botao';
import CampoTexto from '../../componentes/CampoTexto';
import CaixaAviso from '../../componentes/CaixaAviso';
import BarraProgresso from '../../componentes/BarraProgresso';
import SemSessaoPaciente from '../../componentes/SemSessaoPaciente';
import { useDados } from '../../contexto/DadosContexto';
import { opcoesDeAgua } from '../../dados/registros';
import { cores } from '../../tema';
import { formatarDiaMes } from '../../utilitarios/datas';
import { formatarNumero } from '../../utilitarios/formatos';
import { estilos } from './style';

const RegistrosPaciente = () => {
  const { pacienteAtual: paciente, planosAlimentares, montarRegistrosDoDia, registrarAgua, registrarRefeicao } =
    useDados();

  // Refeição com o formulário aberto (null = nenhuma) e o texto digitado.
  const [refeicaoAberta, setRefeicaoAberta] = useState(null);
  const [descricao, setDescricao] = useState('');
  const [erro, setErro] = useState('');

  if (!paciente) return <SemSessaoPaciente />;

  const hoje = new Date();
  const registros = montarRegistrosDoDia(paciente.id, hoje);
  const registradas = registros.refeicoes.filter((refeicao) => refeicao.horario).length;
  const progressoDaAgua = registros.metaAguaLitros ? registros.aguaLitros / registros.metaAguaLitros : 0;

  // O que o plano em vigor prevê para a refeição (nomes dos alimentos).
  const planoEmVigor = planosAlimentares.find((plano) => plano.pacienteId === paciente.id && plano.status === 'ativo');
  const previstoNoPlano = (nomeDaRefeicao) => {
    const refeicao = planoEmVigor?.refeicoes?.find((item) => item.nome === nomeDaRefeicao);
    return refeicao ? refeicao.alimentos.map((alimento) => alimento.nome).join(', ') : '';
  };

  const abrirFormulario = (refeicao) => {
    setRefeicaoAberta(refeicao.nome);
    setDescricao(refeicao.descricao || '');
    setErro('');
  };

  const fecharFormulario = () => {
    setRefeicaoAberta(null);
    setDescricao('');
    setErro('');
  };

  const salvarRefeicao = () => {
    if (descricao.trim().length < 2) {
      setErro('Conte o que você comeu nesta refeição.');
      return;
    }
    registrarRefeicao(paciente.id, refeicaoAberta, descricao);
    fecharFormulario();
  };

  return (
    <Tela
      titulo="Registros"
      subtitulo={`Hoje, ${formatarDiaMes(hoje)}`}
      mostrarVoltar={false}
      abaAtiva="registros"
      perfilBarra="paciente"
    >
      {/* ---------- Água ---------- */}
      <Cartao>
        <View style={estilos.linhaTitulo}>
          <View style={estilos.linhaAgua}>
            <Icone nome="gota" tamanho={18} cor={cores.verdeBotao} />
            <Text style={estilos.tituloAgua}>Água</Text>
          </View>
          <Text style={estilos.valorAgua}>
            {formatarNumero(registros.aguaLitros)} L de {formatarNumero(registros.metaAguaLitros)} L
          </Text>
        </View>
        <BarraProgresso valor={progressoDaAgua} />
        <Text style={estilos.percentualAgua}>{Math.round(progressoDaAgua * 100)}% da meta diária</Text>

        <View style={estilos.linhaBotoesAgua}>
          {opcoesDeAgua.map((mililitros) => (
            <Botao
              key={mililitros}
              titulo={`+ ${mililitros} ml`}
              variante="suave"
              pequeno
              aoPressionar={() => registrarAgua(paciente.id, mililitros)}
              estilo={estilos.botaoAgua}
            />
          ))}
        </View>
        {registros.aguaLitros > 0 ? (
          <Text style={estilos.link} onPress={() => registrarAgua(paciente.id, -opcoesDeAgua[0])}>
            Corrigir: tirar {opcoesDeAgua[0]} ml
          </Text>
        ) : null}
      </Cartao>

      {/* ---------- Refeições ---------- */}
      <Cartao>
        <View style={estilos.linhaTitulo}>
          <Text style={estilos.tituloCartao}>Refeições</Text>
          <Selo
            texto={`${registradas} de ${registros.refeicoes.length} registradas`}
            tom={registradas === registros.refeicoes.length ? 'sucesso' : 'alerta'}
          />
        </View>

        {registros.refeicoes.map((refeicao) => {
          const registrada = Boolean(refeicao.horario);
          const aberta = refeicaoAberta === refeicao.nome;
          const previsto = previstoNoPlano(refeicao.nome);

          return (
            <View key={refeicao.nome} style={estilos.linhaRefeicao}>
              <View style={[estilos.marcadorRefeicao, registrada && estilos.marcadorRegistrada]}>
                {registrada ? <Icone nome="check" tamanho={14} cor={cores.branco} espessura={3} /> : null}
              </View>

              <View style={estilos.dadosRefeicao}>
                <View style={estilos.linhaTitulo}>
                  <Text style={estilos.nomeRefeicao}>{refeicao.nome}</Text>
                  <Text style={estilos.horarioRefeicao}>{refeicao.horario || '—'}</Text>
                </View>

                {registrada && !aberta ? <Text style={estilos.descricaoRefeicao}>{refeicao.descricao}</Text> : null}
                {!registrada && !aberta && previsto ? (
                  <Text style={estilos.previstoRefeicao}>Previsto no plano: {previsto}</Text>
                ) : null}

                {aberta ? (
                  <View style={estilos.formulario}>
                    <CampoTexto
                      rotulo="O que você comeu?"
                      valor={descricao}
                      aoMudar={(texto) => {
                        setDescricao(texto);
                        if (erro) setErro('');
                      }}
                      placeholder="Ex.: 2 fatias de pão integral e 1 ovo"
                      multilinha
                      maxCaracteres={200}
                      erro={erro}
                    />
                    {previsto ? (
                      <Text style={estilos.link} onPress={() => setDescricao(previsto)}>
                        Usar o que está no plano
                      </Text>
                    ) : null}
                    <View style={estilos.linhaBotoes}>
                      <Botao
                        titulo="Cancelar"
                        variante="contorno"
                        pequeno
                        aoPressionar={fecharFormulario}
                        estilo={estilos.botaoMetade}
                      />
                      <Botao titulo="Salvar" pequeno aoPressionar={salvarRefeicao} estilo={estilos.botaoMetade} />
                    </View>
                  </View>
                ) : (
                  <Text style={estilos.link} onPress={() => abrirFormulario(refeicao)}>
                    {registrada ? 'Editar' : 'Registrar'}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </Cartao>

      <CaixaAviso
        tom="info"
        texto="Você registra apenas o dia de hoje. Seu nutricionista acompanha estes registros."
      />
    </Tela>
  );
};

export default RegistrosPaciente;
