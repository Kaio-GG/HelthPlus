// Perfil do nutricionista: dados profissionais, plano e segurança da conta.
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Pressable } from 'react-native';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import Avatar from '../../componentes/Avatar';
import CampoTexto from '../../componentes/CampoTexto';
import CampoSelecao from '../../componentes/CampoSelecao';
import Selo from '../../componentes/Selo';
import Botao from '../../componentes/Botao';
import Icone from '../../componentes/Icone';
import BarraProgresso from '../../componentes/BarraProgresso';
import { useDados } from '../../contexto/DadosContexto';
import { useAuth } from '../../contexto/AuthContext';
import { useDialogo } from '../../contexto/DialogoContexto';
import { atualizarNutricionista } from '../../Api/loginCadastro';
import { convidarTestador } from '../../Api/convite';
import { cores } from '../../tema';
import { aplicarMascaraTelefone } from '../../utilitarios/mascaras';
import {
  emailValido,
  normalizarCrn,
  montarCrn,
  separarCrn,
  numeroDoCrnValido,
  REGIONAIS_DO_CRN,
  DIGITOS_MINIMOS_DO_CRN,
  DIGITOS_MAXIMOS_DO_CRN,
} from '../../utilitarios/validacoes';
import { formatarMoeda } from '../../utilitarios/formatos';
import { estilos } from './style';

const Perfil = ({ navigation }) => {
  const {
    nutricionista,
    pacientes,
    planoAtual,
    limitePacientes,
    cobrancas,
    carregandoAssinatura,
  } = useDados();
  const { token, sairSessao, atualizarProfissional } = useAuth();
  const { avisar, confirmar } = useDialogo();

  const [editando, setEditando] = useState(false);
// Os nomes dos campos são os da tabela profissional, que é o que o login
// devolve: nm_profissional, nr_registro_conselho, ds_email e nr_telefone.
const [nome, setNome] = useState(nutricionista?.nm_profissional ?? '');
const [telefone, setTelefone] = useState(nutricionista?.nr_telefone ?? '');
const [mostrarCobrancas, setMostrarCobrancas] = useState(false);

// Convite para testar o aplicativo (ele ainda não está nas lojas).
const [mostrarConvite, setMostrarConvite] = useState(false);
const [emailConvite, setEmailConvite] = useState('');
const [recadoConvite, setRecadoConvite] = useState('');
const [enviandoConvite, setEnviandoConvite] = useState(false);

// O CRN é editado em duas partes, como na tela de criar conta: a regional
// sai de uma lista e só o número é digitado, com teclado numérico. O banco
// continua guardando as duas juntas numa string ("CRN-3 12345").
const partesDoCrn = separarCrn(nutricionista?.nr_registro_conselho ?? '');
const [crnRegional, setCrnRegional] = useState(partesDoCrn?.regional ?? '');
const [crnNumero, setCrnNumero] = useState(partesDoCrn?.numero ?? '');
// Não há onde marcar "provisório" na tela; ele só é guardado para voltar
// ao texto na hora de salvar, em vez de sumir numa edição de telefone.
const [crnProvisorio, setCrnProvisorio] = useState(partesDoCrn?.provisorio ?? false);

// O nutricionista chega depois de o app ler a sessão salva no celular,
// então os campos precisam ser preenchidos quando ele aparecer.
useEffect(() => {
  setNome(nutricionista?.nm_profissional ?? '');
  setTelefone(nutricionista?.nr_telefone ?? '');

  const partes = separarCrn(nutricionista?.nr_registro_conselho ?? '');
  setCrnRegional(partes?.regional ?? '');
  setCrnNumero(partes?.numero ?? '');
  setCrnProvisorio(partes?.provisorio ?? false);
}, [nutricionista]);

// O que aparece no modo leitura. Quando o registro gravado não está no
// formato (conta antiga), as partes ficam vazias e mostramos o texto cru,
// para o perfil não dizer "Não informado" sobre um CRN que existe.
const crnTexto =
  crnRegional && crnNumero
    ? montarCrn(crnRegional, crnNumero, crnProvisorio)
    : (nutricionista?.nr_registro_conselho ?? '');

  const [salvando, setSalvando] = useState(false);

  const salvarDados = async () => {
    if (salvando) return;

    if (nome.trim().length < 3) {
      avisar({ titulo: 'Nome inválido', mensagem: 'Informe seu nome completo.', tom: 'alerta' });
      return;
    }
    if (!crnRegional) {
      avisar({
        titulo: 'Registro inválido',
        mensagem: 'Escolha a regional do seu CRN.',
        tom: 'alerta',
      });
      return;
    }
    if (!numeroDoCrnValido(crnNumero)) {
      avisar({
        titulo: 'Registro inválido',
        mensagem: `O número do CRN tem de ${DIGITOS_MINIMOS_DO_CRN} a ${DIGITOS_MAXIMOS_DO_CRN} dígitos.`,
        tom: 'alerta',
      });
      return;
    }

    try {
      setSalvando(true);

      const resposta = await atualizarNutricionista(
        nutricionista.id_profissional,
        {
          nome: nome.trim(),
          crn: normalizarCrn(montarCrn(crnRegional, crnNumero, crnProvisorio)),
          telefone,
        },
        token
      );

      // Guarda na sessão o que o servidor confirmou, não o que foi digitado.
      await atualizarProfissional(resposta.profissional);

      setEditando(false);
      avisar({
        titulo: 'Dados salvos',
        mensagem: 'Seus dados profissionais foram atualizados.',
        tom: 'sucesso',
      });
    } catch (erro) {
      avisar({ titulo: 'Erro ao salvar', mensagem: erro.message, tom: 'erro' });
    } finally {
      setSalvando(false);
    }
  };

  // Manda o link de instalação para quem vai testar. O link fica no
  // servidor (LINK_TESTE_APP), porque muda a cada rodada de teste.
  const enviarConvite = async () => {
    if (enviandoConvite) return;

    if (!emailValido(emailConvite)) {
      avisar({
        titulo: 'E-mail inválido',
        mensagem: 'Informe o e-mail de quem vai testar o aplicativo.',
        tom: 'alerta',
      });
      return;
    }

    try {
      setEnviandoConvite(true);

      const resposta = await convidarTestador(token, {
        email: emailConvite.trim(),
        recado: recadoConvite.trim(),
      });

      setMostrarConvite(false);
      setEmailConvite('');
      setRecadoConvite('');

      avisar({
        titulo: resposta.enviado ? 'Convite enviado' : 'Convite não enviado',
        mensagem: resposta.mensagem,
        tom: resposta.enviado ? 'sucesso' : 'alerta',
      });
    } catch (erro) {
      avisar({ titulo: 'Erro ao convidar', mensagem: erro.message, tom: 'erro' });
    } finally {
      setEnviandoConvite(false);
    }
  };

  const sair = async () => {
    const confirmou = await confirmar({
      titulo: 'Sair da conta',
      mensagem: 'Você vai precisar entrar de novo com e-mail e senha.',
      rotuloConfirmar: 'Sair',
      perigo: true,
    });
    if (!confirmou) return;

    // Apaga a sessão salva no celular antes de voltar para a tela inicial.
    // Sem isso o app volta logado quando for reaberto.
    await sairSessao();
    navigation.reset({ index: 0, routes: [{ name: 'Inicio' }] });
  };

  const usoDoPlano = limitePacientes ? pacientes.length / limitePacientes : 0;

  const itensDeSeguranca = [
    {
      chave: 'senha',
      rotulo: 'Alterar senha',
      icone: 'cadeado',
      aoPressionar: () => navigation.navigate('AlterarSenha'),
    },
    {
      chave: 'notificacoes',
      rotulo: 'Notificações',
      icone: 'sino',
      aoPressionar: () => navigation.navigate('PreferenciasNotificacao'),
    },
    {
      chave: 'convidar',
      rotulo: 'Convidar alguém para testar',
      icone: 'enviar',
      aoPressionar: () => setMostrarConvite(true),
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
            style={[
              estilos.acaoEditar,
              editando && estilos.acaoSalvar,
              salvando && estilos.acaoSalvando,
            ]}
            onPress={() => (editando ? salvarDados() : setEditando(true))}
            disabled={salvando}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={editando ? 'Salvar dados profissionais' : 'Editar dados profissionais'}
          >
            <Icone
              nome={editando ? 'check' : 'editar'}
              tamanho={15}
              cor={editando ? cores.branco : cores.verdeLink}
            />
            <Text style={[estilos.textoEditar, editando && estilos.textoSalvar]}>
              {editando ? (salvando ? 'Salvando...' : 'Salvar') : 'Editar'}
            </Text>
          </TouchableOpacity>
        </View>

        {editando ? (
          <View>
            <CampoTexto rotulo="Nome" valor={nome} aoMudar={setNome} capitalizar="words" />
            <Text style={estilos.rotuloGrupo}>CRN</Text>
            <View style={estilos.linhaCrn}>
              <CampoSelecao
                valor={crnRegional}
                opcoes={REGIONAIS_DO_CRN}
                aoMudar={setCrnRegional}
                placeholder="Regional"
                estilo={estilos.campoRegional}
              />
              <CampoTexto
                valor={crnNumero}
                aoMudar={setCrnNumero}
                placeholder="Número"
                preenchimento="nenhum"
                teclado="number-pad"
                somenteDigitos
                maxCaracteres={DIGITOS_MAXIMOS_DO_CRN}
                contador
                valido={numeroDoCrnValido(crnNumero)}
                estilo={estilos.campoNumeroCrn}
              />
            </View>
            <CampoTexto rotulo="E-mail" valor={nutricionista?.ds_email ?? ''} somenteLeitura />
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
              <Text style={estilos.valorDado}>{crnTexto || 'Não informado'}</Text>
            </View>
            <View style={estilos.colunaDado}>
              <Text style={estilos.rotuloDado}>E-mail</Text>
              <Text style={estilos.valorDado}>{nutricionista?.ds_email ?? 'Não informado'}</Text>
            </View>
            <View style={estilos.colunaDado}>
              <Text style={estilos.rotuloDado}>Telefone</Text>
              <Text style={estilos.valorDado}>{telefone}</Text>
            </View>
          </View>
        )}
      </Cartao>

      {/* ---------- Meu plano ---------- */}
      <Cartao>
        <View style={estilos.linhaTitulo}>
          <Text style={estilos.tituloCartao}>Meu plano</Text>
          {planoAtual ? <Selo texto="Pagamento em dia" tom="sucesso" /> : null}
        </View>

        {carregandoAssinatura ? (
          <Text style={estilos.semPlano}>Carregando o seu plano...</Text>
        ) : planoAtual ? (
          <>
            <Text style={estilos.nomePlano}>Plano {planoAtual.nome}</Text>
            <Text style={estilos.detalhePlano}>Próxima cobrança em 20 dias</Text>

            <View style={estilos.linhaProgresso}>
              <Text style={estilos.rotuloDado}>Pacientes cadastrados</Text>
              <Text style={estilos.valorProgresso}>
                {pacientes.length}/{limitePacientes || '∞'}
              </Text>
            </View>
            <BarraProgresso valor={limitePacientes ? usoDoPlano : 0} />
          </>
        ) : (
          <Text style={estilos.semPlano}>
            Você ainda não assinou nenhum plano. Escolha um para liberar o
            cadastro de pacientes e os planos alimentares.
          </Text>
        )}

        <Botao
          titulo={planoAtual ? 'Alterar plano' : 'Escolher um plano'}
          aoPressionar={() => navigation.navigate('Pacotes')}
          estilo={estilos.botaoPlano}
        />

        {/* Sem assinatura não existe cobrança para listar. */}
        {planoAtual ? (
          <TouchableOpacity style={estilos.linkCobrancas} onPress={() => setMostrarCobrancas(true)}>
            <Text style={estilos.textoLink}>Ver histórico de cobranças</Text>
            <Icone nome="chevron-direita" tamanho={16} cor={cores.verdeLink} />
          </TouchableOpacity>
        ) : null}
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

      {/* ---------- Convidar alguém para testar ---------- */}
      <Modal
        visible={mostrarConvite}
        transparent
        animationType="slide"
        onRequestClose={() => setMostrarConvite(false)}
      >
        <Pressable style={estilos.fundoModal} onPress={() => setMostrarConvite(false)} />
        <View style={estilos.painelModal}>
          <View style={estilos.alcaModal} />
          <Text style={estilos.tituloModal}>Convidar para testar</Text>
          <ScrollView style={estilos.listaModal}>
            <Text style={estilos.semCobrancas}>
              O Health Plus ainda não está nas lojas. Quem você convidar
              recebe por e-mail o link para instalar e testar.
            </Text>

            <CampoTexto
              rotulo="E-mail de quem vai testar"
              valor={emailConvite}
              aoMudar={setEmailConvite}
              teclado="email-address"
              preenchimento="email"
              capitalizar="none"
              placeholder="nome@exemplo.com"
            />

            <CampoTexto
              rotulo="Recado (opcional)"
              valor={recadoConvite}
              aoMudar={setRecadoConvite}
              placeholder="Oi! Dá uma olhada no app que estou usando."
              maxCaracteres={300}
              multilinha
            />
          </ScrollView>

          <Botao
            titulo={enviandoConvite ? 'Enviando...' : 'Enviar convite'}
            desabilitado={enviandoConvite}
            aoPressionar={enviarConvite}
          />
          <Botao
            titulo="Fechar"
            variante="contorno"
            aoPressionar={() => setMostrarConvite(false)}
          />
        </View>
      </Modal>

      {/* ---------- Histórico de cobranças ---------- */}
      <Modal visible={mostrarCobrancas} transparent animationType="slide" onRequestClose={() => setMostrarCobrancas(false)}>
        <Pressable style={estilos.fundoModal} onPress={() => setMostrarCobrancas(false)} />
        <View style={estilos.painelModal}>
          <View style={estilos.alcaModal} />
          <Text style={estilos.tituloModal}>Histórico de cobranças</Text>
          <ScrollView style={estilos.listaModal}>
            {cobrancas.length === 0 ? (
              <Text style={estilos.semCobrancas}>
                Nenhuma cobrança ainda. A primeira aparece aqui quando você contratar um plano.
              </Text>
            ) : null}

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
