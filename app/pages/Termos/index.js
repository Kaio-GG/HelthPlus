// Termos de Uso e Política de Privacidade (texto ilustrativo).
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import Alternador from '../../componentes/Alternador';
import Botao from '../../componentes/Botao';
import { estilos } from './style';

const secoesDosTermos = [
  { titulo: 'Sobre o aplicativo', texto: 'O Health Plus ajuda nutricionistas a organizar pacientes e planos, e permite ao paciente registrar água e refeições.' },
  { titulo: 'Cadastro e acesso', texto: 'A conta é pessoal e intransferível. Nutricionistas devem informar um CRN válido e manter seus dados atualizados.' },
  { titulo: 'Planos e pagamento', texto: 'O uso pelo paciente é gratuito. O nutricionista e a clínica contratam um plano de assinatura, com cobrança mensal.' },
  { titulo: 'Uso adequado', texto: 'É proibido compartilhar a senha, acessar dados de outras pessoas sem autorização ou usar o aplicativo para fins ilícitos.' },
  { titulo: 'Limites do aplicativo', texto: 'As ferramentas apoiam, mas não substituem, a avaliação do nutricionista. A conduta clínica é do profissional.' },
  { titulo: 'Alterações', texto: 'Estes termos podem ser atualizados. Avisaremos você pelo aplicativo.' },
];

const secoesDaPrivacidade = [
  { titulo: 'Quais dados coletamos', texto: 'Dados de identificação e contato, dados de saúde (peso, altura, refeições e água) e dados de acesso ao aplicativo.' },
  { titulo: 'Para que usamos', texto: 'Para o acompanhamento nutricional, o agendamento de consultas, a cobrança do plano do nutricionista e a segurança.' },
  { titulo: 'Quem pode acessar', texto: 'O nutricionista vinculado a você. Em clínicas, apenas profissionais com permissão. Todo acesso fica registrado.' },
  { titulo: 'Seus direitos', texto: 'Você pode acessar, corrigir, exportar ou excluir seus dados e revogar o consentimento a qualquer momento.' },
  { titulo: 'Segurança', texto: 'Conexão criptografada (HTTPS), controle de acesso por perfil e registro de auditoria dos acessos às fichas.' },
  { titulo: 'Contato', texto: 'Dúvidas sobre seus dados? Fale com o encarregado: privacidade@exemplo.com' },
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
            <Text style={estilos.tituloSecao}>{secao.titulo}</Text>
            <Text style={estilos.textoSecao}>{secao.texto}</Text>
          </View>
        ))}

        <Text style={estilos.nota}>Texto ilustrativo, sujeito à revisão jurídica.</Text>
      </Cartao>
    </Tela>
  );
};

export default Termos;
