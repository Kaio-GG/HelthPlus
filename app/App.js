// Navegação principal do aplicativo Health Plus.
// Todas as telas ficam em ./pages/<NomeDaTela>/ (index.js = código, style.js = estilo).
import React, { useEffect, useRef } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';

import { AuthProvider, useAuth } from './contexto/AuthContext';
import { DadosProvider, useDados } from './contexto/DadosContexto';
import { NotificacoesProvider } from './contexto/NotificacoesContexto';
import { DialogoProvider, useDialogo } from './contexto/DialogoContexto';
import { AcessibilidadeProvider, useAcessibilidade } from './contexto/AcessibilidadeContexto';
import { aoEncerrarSessao } from './Api/connection';
import { cores } from './tema';

// Entrada e acesso
import Inicio from './pages/inicialHome';
import Nutricionista from './pages/Nutricionista';
import Paciente from './pages/Paciente';
import PrimeiroAcessoPaciente from './pages/PrimeiroAcessoPaciente';
import EsqueciSenha from './pages/EsqueciSenha';
import VerificacaoEmail from './pages/VerificacaoEmail';
import RedefinirSenha from './pages/RedefinirSenha';

// Área do nutricionista
import HomeNutricionista from './pages/HomeNutricionista';
import CadastroPaciente from './pages/CadastroPaciente';
import Pacientes from './pages/Pacientes';
import FichaPaciente from './pages/FichaPaciente';
import FaixaCalculadora from './pages/FaixaCalculadora';
import Calculadora from './pages/Calculadora';
import ResultadoCalculadora from './pages/ResultadoCalculadora';
import PrevisaoAltura from './pages/PrevisaoAltura';
import Pacotes from './pages/Pacotes';
import Agenda from './pages/Agenda';
import NovaConsulta from './pages/NovaConsulta';
import Perfil from './pages/Perfil';
import AlterarSenha from './pages/AlterarSenha';
import Notificacoes from './pages/Notificacoes';
import PreferenciasNotificacao from './pages/PreferenciasNotificacao';
import PrivacidadeNutricionista from './pages/PrivacidadeNutricionista';

// Área do paciente
import HomePaciente from './pages/HomePaciente';
import EvolucaoPaciente from './pages/EvolucaoPaciente';
import AgendaPaciente from './pages/AgendaPaciente';
import PerfilPaciente from './pages/PerfilPaciente';
import AlterarSenhaPaciente from './pages/AlterarSenhaPaciente';
import PrivacidadePaciente from './pages/PrivacidadePaciente';
import Dicas from './pages/Dicas';

// Usadas pelos dois perfis
import DetalheAvaliacao from './pages/DetalheAvaliacao';
import HistoricoAcessos from './pages/HistoricoAcessos';
import Termos from './pages/Termos';
import Acessibilidade from './pages/Acessibilidade';

const Pilha = createNativeStackNavigator();
const navegacao = createNavigationContainerRef();

const semAnimacao = { animation: 'none' };

const ligacoes = {
  prefixes: [Linking.createURL('/'), 'healthplus://'],
  config: {
    screens: {
      RedefinirSenha: 'redefinir-senha',
    },
  },
};

// Quando a API responde que a sessão acabou (token vencido, senha trocada
// em outro aparelho, "sair de todos os aparelhos"), limpa a sessão e volta
// para a tela inicial com um aviso — em vez de cada tela mostrar um erro
// diferente e o usuário ficar preso numa tela vazia.
function VigiaDeSessao() {
  const { token, sairSessao } = useAuth();
  const { tokenPaciente, sairComoPaciente } = useDados();
  const { avisar } = useDialogo();
  const encerrando = useRef(false);

  useEffect(() => {
    encerrando.current = false;
  }, [token, tokenPaciente]);

  useEffect(
    () =>
      aoEncerrarSessao(async (tokenRecusado) => {
        const doNutricionista = token && tokenRecusado === token;
        const doPaciente = tokenPaciente && tokenRecusado === tokenPaciente;

        // Várias requisições podem falhar juntas: avisa uma vez só.
        if ((!doNutricionista && !doPaciente) || encerrando.current) return;
        encerrando.current = true;

        if (doNutricionista) await sairSessao();
        if (doPaciente) sairComoPaciente();

        if (navegacao.isReady()) {
          navegacao.reset({ index: 0, routes: [{ name: 'Inicio' }] });
        }

        avisar({
          titulo: 'Sessão encerrada',
          mensagem: 'Por segurança, entre novamente.',
          tom: 'info',
        });
      }),
    [token, tokenPaciente, sairSessao, sairComoPaciente, avisar]
  );

  return null;
}

function Navegacao() {
  // Animação de transição só para quem não pediu para reduzir movimento
  // (no aplicativo ou nas configurações do celular).
  const { reduzirMovimento } = useAcessibilidade();

  return (
    <NavigationContainer ref={navegacao} linking={ligacoes}>
      <VigiaDeSessao />
      <Pilha.Navigator
        initialRouteName="Inicio"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: cores.fundo },
          ...(reduzirMovimento ? semAnimacao : {}),
        }}
      >
        {/* Entrada e acesso */}
        <Pilha.Screen name="Inicio" component={Inicio} />
        <Pilha.Screen name="Nutricionista" component={Nutricionista} />
        <Pilha.Screen name="Paciente" component={Paciente} />
        <Pilha.Screen
          name="PrimeiroAcessoPaciente"
          component={PrimeiroAcessoPaciente}
          // Sem gesto de voltar: sair daqui é pelo botão "Agora não", que
          // explica o que acontece sem o aceite.
          options={{ gestureEnabled: false }}
        />
        <Pilha.Screen name="EsqueciSenha" component={EsqueciSenha} />
        <Pilha.Screen name="VerificacaoEmail" component={VerificacaoEmail} />
        <Pilha.Screen name="RedefinirSenha" component={RedefinirSenha} />

        {/* Área do nutricionista */}
        <Pilha.Screen name="HomeNutricionista" component={HomeNutricionista} options={semAnimacao} />
        <Pilha.Screen name="Agenda" component={Agenda} options={semAnimacao} />
        <Pilha.Screen name="Perfil" component={Perfil} options={semAnimacao} />
        <Pilha.Screen name="CadastroPaciente" component={CadastroPaciente} />
        <Pilha.Screen name="Pacientes" component={Pacientes} />
        <Pilha.Screen name="FichaPaciente" component={FichaPaciente} />

        {/* Calculadora OMS */}
        <Pilha.Screen name="FaixaCalculadora" component={FaixaCalculadora} />
        <Pilha.Screen name="Calculadora" component={Calculadora} />
        <Pilha.Screen name="ResultadoCalculadora" component={ResultadoCalculadora} />
        <Pilha.Screen name="PrevisaoAltura" component={PrevisaoAltura} />

        {/* Assinatura e consultas */}
        <Pilha.Screen name="Pacotes" component={Pacotes} />
        <Pilha.Screen name="NovaConsulta" component={NovaConsulta} />

        {/* Conta, notificações e privacidade */}
        <Pilha.Screen name="AlterarSenha" component={AlterarSenha} />
        <Pilha.Screen name="Notificacoes" component={Notificacoes} />
        <Pilha.Screen name="PreferenciasNotificacao" component={PreferenciasNotificacao} />
        <Pilha.Screen name="PrivacidadeNutricionista" component={PrivacidadeNutricionista} />

        {/* Área do paciente */}
        <Pilha.Screen name="HomePaciente" component={HomePaciente} options={semAnimacao} />
        <Pilha.Screen name="EvolucaoPaciente" component={EvolucaoPaciente} options={semAnimacao} />
        <Pilha.Screen name="AgendaPaciente" component={AgendaPaciente} options={semAnimacao} />
        <Pilha.Screen name="PerfilPaciente" component={PerfilPaciente} options={semAnimacao} />
        <Pilha.Screen name="AlterarSenhaPaciente" component={AlterarSenhaPaciente} />
        <Pilha.Screen name="PrivacidadePaciente" component={PrivacidadePaciente} />
        <Pilha.Screen name="Dicas" component={Dicas} />

        {/* Usadas pelos dois perfis. A avaliação por extenso: o nutricionista
            chega pela ficha, o paciente por "Minha evolução". */}
        <Pilha.Screen name="DetalheAvaliacao" component={DetalheAvaliacao} />
        <Pilha.Screen name="HistoricoAcessos" component={HistoricoAcessos} />
        <Pilha.Screen name="Termos" component={Termos} />
        <Pilha.Screen name="Acessibilidade" component={Acessibilidade} />
      </Pilha.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AcessibilidadeProvider>
      <AuthProvider>
        <DadosProvider>
          <NotificacoesProvider>
            <DialogoProvider>
              <Navegacao />
            </DialogoProvider>
          </NotificacoesProvider>
        </DadosProvider>
      </AuthProvider>
    </AcessibilidadeProvider>
  );
}
