// Histórico de acessos aos dados de um paciente.
//
// A mesma tela serve aos dois lados:
//   - o PACIENTE vê quem abriu a ficha dele, viu a evolução, registrou
//     avaliação... (Perfil > Meus dados e privacidade);
//   - o NUTRICIONISTA vê o mesmo histórico na ficha do paciente.
//
// Os dados vêm do log de auditoria da API (Api/servicos/auditoria.js), que
// grava cada acesso sem guardar o conteúdo acessado.
//
// Parâmetros: pacienteId e nomePaciente quando é o nutricionista quem abre.
import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text } from 'react-native';

import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import CaixaAviso from '../../componentes/CaixaAviso';
import Icone from '../../componentes/Icone';
import { useAuth } from '../../contexto/AuthContext';
import { useDados } from '../../contexto/DadosContexto';
import { listarMeusAcessos, listarAcessosDoPaciente } from '../../Api/lgpd';
import { dataHoraBR } from '../../utilitarios/compartilhar';
import { anunciar } from '../../utilitarios/acessibilidade';
import { cores } from '../../tema';
import { estilos } from './style';

const HistoricoAcessos = ({ route }) => {
  const pacienteId = route.params?.pacienteId;
  const nomePaciente = route.params?.nomePaciente;
  const ehNutricionista = Boolean(pacienteId);

  const { token } = useAuth();
  const { tokenPaciente } = useDados();

  const [acessos, setAcessos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');

    try {
      const resposta = ehNutricionista
        ? await listarAcessosDoPaciente(token, pacienteId)
        : await listarMeusAcessos(tokenPaciente);

      setAcessos(resposta.acessos || []);
      anunciar(`${(resposta.acessos || []).length} registros de acesso carregados.`);
    } catch (problema) {
      setErro(problema.message);
    } finally {
      setCarregando(false);
    }
  }, [ehNutricionista, token, tokenPaciente, pacienteId]);

  // Recarrega ao abrir a tela e ao voltar para ela.
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  return (
    <Tela
      titulo="Histórico de acessos"
      subtitulo={ehNutricionista ? nomePaciente || 'Paciente' : 'Quem acessou os seus dados'}
      aoAtualizar={carregar}
      atualizando={carregando}
    >
      <Cartao>
        <CaixaAviso
          tom="info"
          texto={
            ehNutricionista
              ? 'Cada vez que alguém abre a ficha, vê a evolução, registra uma avaliação ou exporta os dados deste paciente, fica registrado aqui. O paciente vê esta mesma lista no aplicativo dele.'
              : 'Cada vez que alguém abre a sua ficha, vê a sua evolução ou registra uma avaliação, fica registrado aqui. Viu algo que não reconhece? Fale com o seu nutricionista.'
          }
        />

        {erro ? (
          <Text style={estilos.erro} accessibilityLiveRegion="polite">
            {erro}
          </Text>
        ) : null}

        {!carregando && !erro && acessos.length === 0 ? (
          <Text style={estilos.vazio}>Nenhum acesso registrado ainda.</Text>
        ) : null}

        {acessos.map((acesso) => (
          <View
            key={acesso.id}
            style={estilos.item}
            accessible
            accessibilityLabel={`${acesso.quem}. ${acesso.descricao}. ${dataHoraBR(acesso.quando)}.`}
          >
            <View style={estilos.icone}>
              <Icone
                nome={acesso.tipoAtor === 'profissional' ? 'usuario' : acesso.tipoAtor === 'paciente' ? 'casa' : 'escudo'}
                tamanho={18}
                cor={cores.verdeEscuro}
              />
            </View>
            <View style={estilos.textos}>
              <Text style={estilos.quem}>{acesso.quem}</Text>
              <Text style={estilos.descricao}>{acesso.descricao}</Text>
              <Text style={estilos.quando}>{dataHoraBR(acesso.quando)}</Text>
            </View>
          </View>
        ))}
      </Cartao>
    </Tela>
  );
};

export default HistoricoAcessos;
