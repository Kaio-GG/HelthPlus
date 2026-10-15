// Perfil do nutricionista: dados profissionais, plano e segurança da conta.
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Pressable, Alert } from 'react-native';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import Avatar from '../../componentes/Avatar';
import CampoTexto from '../../componentes/CampoTexto';
import Selo from '../../componentes/Selo';
import Botao from '../../componentes/Botao';
import Icone from '../../componentes/Icone';
import BarraProgresso from '../../componentes/BarraProgresso';
import { useDados } from '../../contexto/DadosContexto';
import { cores } from '../../tema';
import { aplicarMascaraTelefone } from '../../utilitarios/mascaras';
import { formatarMoeda } from '../../utilitarios/formatos';
import { estilos } from './style';

const Perfil = ({ navigation }) => {
  const { nutricionista, pacientes, planoAtual, limitePacientes, cobrancas } = useDados();

  const [editando, setEditando] = useState(false);
const [nome, setNome] = useState(nutricionista?.nome ?? '');
const [crn, setCrn] = useState(nutricionista?.crn ?? '');
const [telefone, setTelefone] = useState(nutricionista?.telefone ?? '');
const [mostrarCobrancas, setMostrarCobrancas] = useState(false);

useEffect(() => {
  setNome(nutricionista?.nome ?? '');
  setCrn(nutricionista?.crn ?? '');
  setTelefone(nutricionista?.telefone ?? '');
}, [nutricionista]);

  const salvarDados = () => {
    // TODO: integrar com a API (atualizar dados profissionais).
    setEditando(false);
    Alert.alert('Dados salvos', 'Seus dados profissionais foram atualizados.');
  };

  const sair = () => {
    Alert.alert('Sair da conta', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Inicio' }] }),
      },
    ]);
  };

  const usoDoPlano = limitePacientes ? pacientes.length / limitePacientes : 0;

  const itensDeSeguranca = [
    { chave: 'senha', rotulo: 'Alterar senha', icone: 'cadeado', aoPressionar: () => navigation.navigate('RedefinirSenha') },
    {
      chave: 'notificacoes',
      rotulo: 'Notificações',
      icone: 'sino',
      aoPressionar: () => Alert.alert('Notificações', 'As preferências de notificação serão configuráveis em breve.'),
    },
    { chave: 'termos', rotulo: 'Termos de Uso e Privacidade', icone: 'info', aoPressionar: () => navigation.navigate('Termos') },
  ];

  return (
    <Tela
      titulo="Perfil"
      subtitulo="Seus dados e seu plano"
      mostrarVoltar={false}
      abaAtiva="perfil"
      direita={<Avatar nome={nome} tamanho={56} cor={cores.branco} corTexto={cores.verdeEscuro} />}
    >
      {/* ---------- Dados profissionais ---------- */}
      <Cartao>
        <View style={estilos.linhaTitulo}>
          <Text style={estilos.tituloCartao}>Dados profissionais</Text>
          <TouchableOpacity
            style={estilos.acaoEditar}
            onPress={() => (editando ? salvarDados() : setEditando(true))}
          >
            <Icone nome={editando ? 'check' : 'editar'} tamanho={15} cor={cores.verdeLink} />
            <Text style={estilos.textoEditar}>{editando ? 'Salvar' : 'Editar'}</Text>
          </TouchableOpacity>
        </View>

        {editando ? (
          <View>
            <CampoTexto rotulo="Nome" valor={nome} aoMudar={setNome} capitalizar="words" />
            <CampoTexto rotulo="CRN" valor={crn} aoMudar={setCrn} capitalizar="characters" />
            <CampoTexto rotulo="E-mail" valor={nutricionista?.email ?? ''} somenteLeitura />
            <CampoTexto
              rotulo="Telefone"
              valor={telefone}
              aoMudar={(texto) => setTelefone(aplicarMascaraTelefone(texto))}
              teclado="phone-pad"
            />
          </View>
        ) : (
          <View style={estilos.grade}>
            <View style={estilos.colunaDado}>
              <Text style={estilos.rotuloDado}>Nome</Text>
              <Text style={estilos.valorDado}>{nome || 'Não informado'}</Text>
            </View>
            <View style={estilos.colunaDado}>
              <Text style={estilos.rotuloDado}>CRN</Text>
              <Text style={estilos.valorDado}>{crn || 'Não informado'}</Text>
            </View>
            <View style={estilos.colunaDado}>
              <Text style={estilos.rotuloDado}>E-mail</Text>
              <Text style={estilos.valorDado}>{nutricionista?.email ?? 'Não informado'}</Text>
            </View>
            <View style={estilos.colunaDado}>
              <Text style={estilos.rotuloDado}>Telefone</Text>
              <Text style={estilos.valorDado}>{telefone}</Text>
            </View>
            <View style={estilos.colunaDado}>
              <Text style={estilos.rotuloDado}>Membro desde</Text>
              <Text style={estilos.valorDado}>{nutricionista?.membroDesde ?? 'Não informado'}</Text>
            </View>
          </View>
        )}
      </Cartao>

      {/* ---------- Meu plano ---------- */}
      <Cartao>
        <View style={estilos.linhaTitulo}>
          <Text style={estilos.tituloCartao}>Meu plano</Text>
          <Selo texto="Pagamento em dia" tom="sucesso" />
        </View>
        <Text style={estilos.nomePlano}>Plano {planoAtual?.nome}</Text>
        <Text style={estilos.detalhePlano}>Próxima cobrança em 20 dias</Text>

        <View style={estilos.linhaProgresso}>
          <Text style={estilos.rotuloDado}>Pacientes cadastrados</Text>
          <Text style={estilos.valorProgresso}>
            {pacientes.length}/{limitePacientes || '∞'}
          </Text>
        </View>
        <BarraProgresso valor={limitePacientes ? usoDoPlano : 1} />

        <Botao titulo="Alterar plano" aoPressionar={() => navigation.navigate('Pacotes')} estilo={estilos.botaoPlano} />

        <TouchableOpacity style={estilos.linkCobrancas} onPress={() => setMostrarCobrancas(true)}>
          <Text style={estilos.textoLink}>Ver histórico de cobranças</Text>
          <Icone nome="chevron-direita" tamanho={16} cor={cores.verdeLink} />
        </TouchableOpacity>
      </Cartao>

      {/* ---------- Conta e segurança ---------- */}
      <Cartao>
        <Text style={estilos.tituloCartao}>Conta e segurança</Text>
        {itensDeSeguranca.map((item) => (
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

      {/* ---------- Histórico de cobranças ---------- */}
      <Modal visible={mostrarCobrancas} transparent animationType="slide" onRequestClose={() => setMostrarCobrancas(false)}>
        <Pressable style={estilos.fundoModal} onPress={() => setMostrarCobrancas(false)} />
        <View style={estilos.painelModal}>
          <View style={estilos.alcaModal} />
          <Text style={estilos.tituloModal}>Histórico de cobranças</Text>
          <ScrollView style={estilos.listaModal}>
            {cobrancas.map((cobranca) => (
              <View key={cobranca.id} style={estilos.linhaCobranca}>
                <View>
                  <Text style={estilos.referenciaCobranca}>{cobranca.referencia}</Text>
                  <Text style={estilos.dataCobranca}>{cobranca.data}</Text>
                </View>
                <View style={estilos.ladoCobranca}>
                  <Text style={estilos.valorCobranca}>{formatarMoeda(cobranca.valor)}</Text>
                  <Selo texto="Pago" tom="sucesso" />
                </View>
              </View>
            ))}
          </ScrollView>
          <Botao titulo="Fechar" variante="contorno" aoPressionar={() => setMostrarCobrancas(false)} />
        </View>
      </Modal>
    </Tela>
  );
};

export default Perfil;
