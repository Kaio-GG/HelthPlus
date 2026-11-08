// Termos de Uso e Política de Privacidade.
//
// O texto segue os itens que a LGPD manda informar ao titular (Art. 9º):
// finalidade, forma e duração do tratamento, quem é o controlador, com
// quem os dados são compartilhados, os direitos e como exercê-los.
//
// VERSÃO: mudou o texto, mude a versão nos DOIS lugares —
//   app/.env  EXPO_PUBLIC_VERSAO_TERMOS
//   Api/.env  VERSAO_TERMOS
// A API pede um aceite novo de todo paciente quando a versão muda.
//
// CONTATO: o canal de privacidade (encarregado, Art. 41) vem de
// EXPO_PUBLIC_CONTATO_PRIVACIDADE no app/.env. Sem ele, a tela orienta a
// falar pelo próprio aplicativo — nunca um endereço de exemplo, que
// ninguém lê.
//
// Antes de publicar o aplicativo, este texto precisa passar por revisão
// jurídica (ver README, seção LGPD).
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import Alternador from '../../componentes/Alternador';
import Botao from '../../componentes/Botao';
import { estilos } from './style';

const VERSAO = process.env.EXPO_PUBLIC_VERSAO_TERMOS || '2026-11-07';
const CONTATO = (process.env.EXPO_PUBLIC_CONTATO_PRIVACIDADE || '').trim();

// A tela só afirma "conexão criptografada" quando é verdade: quando o
// endereço da API configurado neste aplicativo é https.
const CONEXAO_CRIPTOGRAFADA = String(process.env.EXPO_PUBLIC_API_URL || '').startsWith('https://');

const secoesDosTermos = [
  {
    titulo: 'Sobre o aplicativo',
    texto:
      'O Health Plus ajuda nutricionistas a acompanhar pacientes — cadastro, avaliações antropométricas pelas curvas da OMS e agenda de consultas — e permite ao paciente acompanhar a própria evolução.',
  },
  {
    titulo: 'Cadastro e acesso',
    texto:
      'A conta é pessoal e intransferível. O nutricionista informa um CRN válido e mantém os dados atualizados. A conta do paciente é criada pelo nutricionista; no primeiro acesso, o paciente (ou o responsável, se for menor de idade) aceita estes termos e cria a própria senha.',
  },
  {
    titulo: 'Planos e pagamento',
    texto:
      'O uso pelo paciente é gratuito. O nutricionista contrata um plano de assinatura mensal.',
  },
  {
    titulo: 'Uso adequado',
    texto:
      'É proibido compartilhar a senha, acessar dados de outras pessoas sem autorização ou usar o aplicativo para fins ilícitos. Tentativas de acesso indevido ficam registradas.',
  },
  {
    titulo: 'Limites do aplicativo',
    texto:
      'As ferramentas apoiam, mas não substituem, a avaliação do nutricionista. A conduta clínica é do profissional.',
  },
  {
    titulo: 'Alterações',
    texto:
      'Estes termos podem mudar. Quando mudarem, o aplicativo pede um novo aceite antes de você continuar.',
  },
];

const secoesDaPrivacidade = [
  {
    titulo: 'Quem é responsável pelos seus dados',
    texto:
      'O seu nutricionista é o controlador dos seus dados: é ele quem decide sobre o seu acompanhamento. O Health Plus é a ferramenta que ele usa para isso.',
  },
  {
    titulo: 'Quais dados tratamos',
    texto:
      'Identificação e contato (nome, data de nascimento, sexo, e-mail, endereço e, para menores, o nome do responsável), dados de saúde (peso, altura, perímetros, dobras cutâneas e a classificação pelas curvas da OMS), consultas marcadas e dados de acesso (data, hora e IP de cada login e de cada acesso à ficha).',
  },
  {
    titulo: 'Para que usamos',
    texto:
      'Para o acompanhamento nutricional, o agendamento de consultas, a cobrança do plano do nutricionista e a segurança da conta. Os dados de saúde são tratados com o seu consentimento, específico e destacado (LGPD, Art. 11, I). Não vendemos dados e não usamos para publicidade.',
  },
  {
    titulo: 'Crianças e adolescentes',
    texto:
      'Para menores de 18 anos, o aceite é dado pelo pai, mãe ou responsável legal, e os dados são tratados no melhor interesse da criança ou do adolescente (LGPD, Art. 14).',
  },
  {
    titulo: 'Quem pode acessar',
    texto:
      'Só o nutricionista que acompanha você, e você mesmo. Cada acesso à sua ficha fica registrado, e você vê a lista em Perfil > Meus dados e privacidade.',
  },
  {
    titulo: 'Com quem compartilhamos',
    texto:
      'Com o serviço de hospedagem do sistema e com o serviço de envio de e-mails (para avisos, convite de acesso e redefinição de senha). O provedor de e-mail pode ficar fora do Brasil. O e-mail não leva dados de saúde.',
  },
  {
    titulo: 'Por quanto tempo',
    texto:
      'Enquanto durar o acompanhamento, ou até você pedir a exclusão — respeitado o prazo que a lei exija para o prontuário. Registros de acesso ficam por até 5 anos; códigos de redefinição de senha, por 7 dias depois de vencerem; avisos já lidos, por 6 meses.',
  },
  {
    titulo: 'Seus direitos',
    texto:
      'Confirmar que tratamos os seus dados, acessá-los e baixar uma cópia, pedir correção, pedir a exclusão, se opor a um uso e revogar o consentimento a qualquer momento. Tudo em Perfil > Meus dados e privacidade. O prazo de resposta é de até 15 dias.',
  },
  {
    titulo: 'Segurança',
    texto:
      (CONEXAO_CRIPTOGRAFADA
        ? 'Conexão criptografada (HTTPS). '
        : 'Atenção: este aplicativo está ligado a um servidor de teste, sem conexão criptografada. Não use com dados reais. ') +
      'Senhas guardadas de forma irreversível, bloqueio temporário depois de várias senhas erradas, sessão encerrada em todos os aparelhos quando a senha muda, e registro de auditoria protegido contra alteração.',
  },
  {
    titulo: 'Contato sobre privacidade',
    texto: CONTATO
      ? `Dúvidas ou pedidos sobre os seus dados: ${CONTATO}. Você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).`
      : 'Dúvidas ou pedidos sobre os seus dados: faça um pedido em Perfil > Meus dados e privacidade, que ele chega ao seu nutricionista. Você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).',
  },
];

const Termos = ({ navigation, route }) => {
  const [aba, setAba] = useState(route.params?.abaInicial || 'termos');
  const ehTermos = aba === 'termos';
  const secoes = ehTermos ? secoesDosTermos : secoesDaPrivacidade;

  return (
    <Tela
      titulo={ehTermos ? 'Termos de Uso' : 'Privacidade e dados'}
      subtitulo={ehTermos ? 'Regras para usar o aplicativo' : 'Como tratamos seus dados (LGPD)'}
      rodape={<Botao titulo="Entendi" aoPressionar={() => navigation.goBack()} />}
    >
      <Cartao>
        <Alternador
          opcoes={[
            { valor: 'termos', rotulo: 'Termos' },
            { valor: 'privacidade', rotulo: 'Privacidade' },
          ]}
          valor={aba}
          aoMudar={setAba}
        />

        {secoes.map((secao) => (
          <View key={secao.titulo} style={estilos.secao}>
            <Text style={estilos.tituloSecao} accessibilityRole="header">
              {secao.titulo}
            </Text>
            <Text style={estilos.textoSecao}>{secao.texto}</Text>
          </View>
        ))}

        <Text style={estilos.nota}>Versão {VERSAO}</Text>
      </Cartao>
    </Tela>
  );
};

export default Termos;
