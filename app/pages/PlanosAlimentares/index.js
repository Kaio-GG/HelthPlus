// Lista de todos os planos alimentares: consultar, editar, duplicar e arquivar.
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import CampoBusca from '../../componentes/CampoBusca';
import Chip from '../../componentes/Chip';
import CartaoPlano from '../../componentes/CartaoPlano';
import BotaoCircular from '../../componentes/BotaoCircular';
import Icone from '../../componentes/Icone';
import { useDados } from '../../contexto/DadosContexto';
import { useDialogo } from '../../contexto/DialogoContexto';
import { cores } from '../../tema';
import { formatarNumero, normalizarTexto } from '../../utilitarios/formatos';
import { estilos } from './style';

const filtros = [
  { chave: 'todos', rotulo: 'Todos' },
  { chave: 'ativo', rotulo: 'Ativos' },
  { chave: 'arquivado', rotulo: 'Arquivados' },
];

const PlanosAlimentares = ({ navigation }) => {
  const { planosAlimentares, duplicarPlanoAlimentar, alternarArquivamentoPlano } = useDados();
  const { avisar } = useDialogo();
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('todos');

  const lista = planosAlimentares.filter((plano) => {
    const textoDoPlano = normalizarTexto(`${plano.nome} ${plano.pacienteNome}`);
    const combinaBusca = textoDoPlano.includes(normalizarTexto(busca));
    const combinaFiltro = filtro === 'todos' || plano.status === filtro;
    return combinaBusca && combinaFiltro;
  });

  const verPlano = (plano) => {
    const refeicoes = (plano.refeicoes || []).map((refeicao) => `• ${refeicao.nome}`).join('\n');
    avisar({
      titulo: plano.nome,
      mensagem: `Paciente: ${plano.pacienteNome}\nVigência: ${plano.inicio} a ${plano.fim}\nMeta diária: ${formatarNumero(plano.metaKcal, 0)} kcal\n\nRefeições:\n${refeicoes}`,
      rotuloBotao: 'Fechar',
    });
  };

  const duplicarPlano = (plano) => {
    duplicarPlanoAlimentar(plano.id);
    avisar({
      titulo: 'Plano duplicado',
      mensagem: 'Uma cópia foi criada no topo da lista.',
      tom: 'sucesso',
    });
  };

  return (
    <Tela
      titulo="Planos alimentares"
      subtitulo="Consulte, edite e duplique"
      flutuante={
        <BotaoCircular
          icone="mais"
          tamanho={56}
          fundo={cores.verdeBotao}
          cor={cores.branco}
          acessibilidade="Criar plano alimentar"
          aoPressionar={() => navigation.navigate('CriarPlanoAlimentar')}
        />
      }
    >
      <Cartao>
        <CampoBusca valor={busca} aoMudar={setBusca} placeholder="Buscar por paciente ou plano" />
        <View style={estilos.linhaFiltros}>
          {filtros.map((item) => (
            <Chip
              key={item.chave}
              rotulo={item.rotulo}
              ativo={filtro === item.chave}
              comCheck
              aoPressionar={() => setFiltro(item.chave)}
            />
          ))}
        </View>
      </Cartao>

      {lista.length === 0 ? <Text style={estilos.vazio}>Nenhum plano encontrado.</Text> : null}

      {lista.map((plano) => (
        <CartaoPlano
          key={plano.id}
          plano={plano}
          mostrarPaciente
          aoVer={() => verPlano(plano)}
          aoEditar={() => navigation.navigate('CriarPlanoAlimentar', { planoId: plano.id })}
          aoDuplicar={() => duplicarPlano(plano)}
          aoAlternarArquivo={() => alternarArquivamentoPlano(plano.id)}
        />
      ))}

      <TouchableOpacity
        style={estilos.linhaModelos}
        activeOpacity={0.85}
        onPress={() =>
          avisar({
            titulo: 'Modelos de plano',
            mensagem: 'Em breve você poderá salvar planos como modelos e reutilizá-los.',
          })
        }
      >
        <View style={estilos.textosModelos}>
          <Text style={estilos.tituloModelos}>Modelos de plano</Text>
          <Text style={estilos.descricaoModelos}>Reutilize planos prontos com novos pacientes</Text>
        </View>
        <Icone nome="chevron-direita" tamanho={20} cor={cores.verdeEscuro} />
      </TouchableOpacity>
    </Tela>
  );
};

export default PlanosAlimentares;
