// Perfil do paciente: dados cadastrais (mantidos pelo nutricionista) e conta.
import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import Avatar from '../../componentes/Avatar';
import Icone from '../../componentes/Icone';
import CaixaAviso from '../../componentes/CaixaAviso';
import SemSessaoPaciente from '../../componentes/SemSessaoPaciente';
import { useDados } from '../../contexto/DadosContexto';
import { cores } from '../../tema';
import { formatarDataBR } from '../../utilitarios/datas';
import { estilos } from './style';

const PerfilPaciente = ({ navigation }) => {
  const { pacienteAtual: paciente, sairComoPaciente } = useDados();

  if (!paciente) return <SemSessaoPaciente />;

  const sair = () => {
    Alert.alert('Sair da conta', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          sairComoPaciente();
          navigation.reset({ index: 0, routes: [{ name: 'Inicio' }] });
        },
      },
    ]);
  };

  const itensDaConta = [
    { chave: 'senha', rotulo: 'Alterar senha', icone: 'cadeado', aoPressionar: () => navigation.navigate('RedefinirSenha') },
    { chave: 'termos', rotulo: 'Termos de Uso e Privacidade', icone: 'info', aoPressionar: () => navigation.navigate('Termos') },
  ];

  return (
    <Tela
      titulo="Perfil"
      subtitulo="Seus dados"
      mostrarVoltar={false}
      abaAtiva="perfil"
      perfilBarra="paciente"
      direita={<Avatar nome={paciente.nome} tamanho={56} cor={cores.branco} corTexto={cores.verdeEscuro} />}
    >
      <Cartao>
        <Text style={estilos.tituloCartao}>Dados pessoais</Text>
        <View style={estilos.grade}>
          <View style={estilos.colunaDado}>
            <Text style={estilos.rotuloDado}>Nome</Text>
            <Text style={estilos.valorDado}>{paciente.nome}</Text>
          </View>
          <View style={estilos.colunaDado}>
            <Text style={estilos.rotuloDado}>Nascimento</Text>
            <Text style={estilos.valorDado}>{paciente.nascimento ? formatarDataBR(paciente.nascimento) : '—'}</Text>
          </View>
          <View style={estilos.colunaDado}>
            <Text style={estilos.rotuloDado}>Telefone</Text>
            <Text style={estilos.valorDado}>{paciente.telefone || '—'}</Text>
          </View>
          <View style={estilos.colunaDado}>
            <Text style={estilos.rotuloDado}>E-mail</Text>
            <Text style={estilos.valorDado}>{paciente.email}</Text>
          </View>
        </View>
        <CaixaAviso
          tom="info"
          estilo={estilos.aviso}
          texto="Seus dados são mantidos pelo seu nutricionista. Para corrigir alguma informação, fale com ele."
        />
      </Cartao>

      <Cartao>
        <Text style={estilos.tituloCartao}>Conta e segurança</Text>
        {itensDaConta.map((item) => (
          <TouchableOpacity key={item.chave} style={estilos.itemConta} onPress={item.aoPressionar}>
            <Icone nome={item.icone} tamanho={20} cor={cores.verdeBotao} />
            <Text style={estilos.textoItemConta}>{item.rotulo}</Text>
            <Icone nome="chevron-direita" tamanho={18} cor={cores.textoSecundario} />
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={[estilos.itemConta, estilos.itemSair]} onPress={sair}>
          <Icone nome="sair" tamanho={20} cor={cores.erro} />
          <Text style={[estilos.textoItemConta, estilos.textoSair]}>Sair da conta</Text>
        </TouchableOpacity>
      </Cartao>
    </Tela>
  );
};

export default PerfilPaciente;
