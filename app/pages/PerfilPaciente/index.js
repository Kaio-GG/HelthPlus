// Perfil do paciente: os dados da ficha (mantidos pelo nutricionista) e a
// conta dele.
//
// "Alterar senha" aponta para a tela do PACIENTE (AlterarSenhaPaciente), e
// não para RedefinirSenha: aquela tela espera o código que chega por
// e-mail, e quem já está logado não precisa de código nenhum — precisa de
// uma tela que peça a senha atual e grave a nova.
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import Logo from '../../componentes/Logo';
import Icone from '../../componentes/Icone';
import Selo from '../../componentes/Selo';
import CaixaAviso from '../../componentes/CaixaAviso';
import SemSessaoPaciente from '../../componentes/SemSessaoPaciente';
import { useDados } from '../../contexto/DadosContexto';
import { useDialogo } from '../../contexto/DialogoContexto';
import { cores } from '../../tema';
import { formatarDataBR } from '../../utilitarios/datas';
import { estilos } from './style';

const PerfilPaciente = ({ navigation }) => {
  const {
    pacienteAtual: paciente,
    sairComoPaciente,
    senhaProvisoria,
  } = useDados();

  const { confirmar } = useDialogo();

  if (!paciente) return <SemSessaoPaciente />;

  const sair = async () => {
    const querSair = await confirmar({
      titulo: 'Sair da conta',
      mensagem: 'Você vai precisar entrar outra vez para ver a sua evolução.',
      rotuloConfirmar: 'Sair',
      rotuloCancelar: 'Ficar',
      perigo: true,
    });

    if (!querSair) return;

    sairComoPaciente();
    navigation.reset({ index: 0, routes: [{ name: 'Inicio' }] });
  };

  const itensDaConta = [
    {
      chave: 'senha',
      rotulo: 'Alterar senha',
      icone: 'cadeado',
      aoPressionar: () => navigation.navigate('AlterarSenhaPaciente'),
    },
    {
      chave: 'privacidade',
      rotulo: 'Meus dados e privacidade',
      icone: 'escudo',
      aoPressionar: () => navigation.navigate('PrivacidadePaciente'),
    },
    {
      chave: 'acessibilidade',
      rotulo: 'Acessibilidade',
      icone: 'acessibilidade',
      aoPressionar: () => navigation.navigate('Acessibilidade'),
    },
    {
      chave: 'dicas',
      rotulo: 'Saúde e dicas',
      icone: 'info',
      aoPressionar: () => navigation.navigate('Dicas'),
    },
    {
      chave: 'termos',
      rotulo: 'Termos de Uso e Privacidade',
      icone: 'info',
      aoPressionar: () => navigation.navigate('Termos'),
    },
  ];

  return (
    <Tela
      titulo="Perfil"
      subtitulo="Seus dados e a sua conta"
      mostrarVoltar={false}
      abaAtiva="perfil"
      perfilBarra="paciente"
      // A marca do HealthPlus no canto, no lugar das iniciais do paciente:
      // o nome dele já está no cartão abaixo, e o que faltava na tela era
      // dizer em qual aplicativo ele está.
      direita={<Logo />}
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
            <Text style={estilos.valorDado}>
              {paciente.nascimento ? formatarDataBR(paciente.nascimento) : '—'}
            </Text>
          </View>
          {/* O telefone saiu: o cadastro não pede mais, e o que estava
              gravado não é mais mostrado (LGPD). */}
          <View style={estilos.colunaDado}>
            <Text style={estilos.rotuloDado}>E-mail</Text>
            <Text style={estilos.valorDado}>{paciente.email || '—'}</Text>
          </View>
        </View>

        <CaixaAviso
          tom="info"
          estilo={estilos.aviso}
          texto="Seus dados são mantidos pelo seu nutricionista. Para corrigir alguma informação, faça um pedido em Meus dados e privacidade."
        />
      </Cartao>

      <Cartao>
        <View style={estilos.linhaTitulo}>
          <Text style={estilos.tituloCartao}>Conta e segurança</Text>
          {senhaProvisoria ? <Selo texto="Senha provisória" tom="alerta" /> : null}
        </View>

        {/* Quem ainda não trocou a senha precisa saber que ela é a data de
            nascimento — e que isso não é uma boa senha para ficar. */}
        {senhaProvisoria ? (
          <CaixaAviso
            tom="alerta"
            icone="cadeado"
            estilo={estilos.avisoSenha}
            texto="Você entrou com a sua data de nascimento. Qualquer pessoa que a saiba consegue entrar na sua conta: troque por uma senha só sua em Alterar senha."
          />
        ) : null}

        {itensDaConta.map((item) => (
          <TouchableOpacity
            key={item.chave}
            style={estilos.itemConta}
            onPress={item.aoPressionar}
            accessibilityRole="button"
            accessibilityLabel={item.rotulo}
          >
            <Icone nome={item.icone} tamanho={20} cor={cores.verdeBotao} />
            <Text style={estilos.textoItemConta}>{item.rotulo}</Text>
            <Icone nome="chevron-direita" tamanho={18} cor={cores.textoSecundario} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[estilos.itemConta, estilos.itemSair]}
          onPress={sair}
          accessibilityRole="button"
          accessibilityLabel="Sair da conta"
        >
          <Icone nome="sair" tamanho={20} cor={cores.erro} />
          <Text style={[estilos.textoItemConta, estilos.textoSair]}>Sair da conta</Text>
        </TouchableOpacity>
      </Cartao>

      {/* Os dados do paciente são dele: a LGPD dá o direito de pedir a
          exclusão, e o aplicativo precisa dizer como se exerce esse
          direito em vez de só mencioná-lo nos Termos. */}
      <Cartao>
        <Text style={estilos.tituloCartao}>Seus direitos</Text>
        <Text style={estilos.textoDireitos}>
          Você pode baixar uma cópia dos seus dados, ver quem os acessou, pedir
          correção ou exclusão e desistir do seu aceite, a qualquer momento e
          sem precisar justificar. É um direito garantido pela LGPD.
        </Text>
        <TouchableOpacity
          style={estilos.itemConta}
          onPress={() => navigation.navigate('PrivacidadePaciente')}
          accessibilityRole="button"
          accessibilityLabel="Abrir Meus dados e privacidade"
        >
          <Icone nome="escudo" tamanho={20} cor={cores.verdeBotao} />
          <Text style={estilos.textoItemConta}>Meus dados e privacidade</Text>
          <Icone nome="chevron-direita" tamanho={18} cor={cores.textoSecundario} />
        </TouchableOpacity>
      </Cartao>
    </Tela>
  );
};

export default PerfilPaciente;
