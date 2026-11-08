-- Health Plus — estrutura do banco (MySQL)
--
-- Gerado a partir do dump do banco montado pelo Kaio (Dump20261021),
-- com as tabelas reordenadas para que as chaves estrangeiras sejam
-- criadas na sequência certa.
--
-- Contém SOMENTE a estrutura. Os dados do dump (contas, pacientes e
-- hashes de senha) ficaram de fora de propósito: não se versiona dado
-- de paciente nem senha, nem de teste.
--
-- Como rodar:
--   mysql -u root -p < Api/database/schema.sql
--
-- No Windows o comando "mysql" costuma não estar no PATH; use o caminho
-- completo, por exemplo:
--   "C:Program FilesMySQLMySQL Server 8.0inmysql.exe" -u root -p < Api/database/schema.sql
--
-- O script pode ser executado mais de uma vez sem dar erro.
--
-- IMPORTANTE: ao mudar uma query que precise de coluna ou tabela nova,
-- atualize este arquivo no MESMO commit. Senão o banco de quem baixar o
-- código deixa de bater com o código.

CREATE DATABASE IF NOT EXISTS helthplus
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE helthplus;

-- ---------------------------------------------------------------
-- unidade_saude
-- Unidades de saúde (clínicas, postos) às quais um profissional pode estar ligado.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `unidade_saude` (
  `id_unidade` int NOT NULL AUTO_INCREMENT,
  `nm_unidade` varchar(100) DEFAULT NULL,
  `tp_unidade` varchar(50) DEFAULT NULL,
  `ds_endereco` varchar(150) DEFAULT NULL,
  `nm_cidade` varchar(50) DEFAULT NULL,
  `sg_uf` char(2) DEFAULT NULL,
  `nr_telefone` varchar(20) DEFAULT NULL,
  `ds_email` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_unidade`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------
-- profissional
-- Nutricionistas que usam o aplicativo. Login e cadastro já integrados.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `profissional` (
  `id_profissional` int NOT NULL AUTO_INCREMENT,
  `nm_profissional` varchar(100) DEFAULT NULL,
  `ds_email` varchar(100) DEFAULT NULL,
  `ds_senha_hash` varchar(255) DEFAULT NULL,
  `ds_profissao` varchar(50) DEFAULT NULL,
  `nr_registro_conselho` varchar(50) DEFAULT NULL,
  `id_unidade` int DEFAULT NULL,
  `nr_telefone` varchar(20) DEFAULT NULL,
  `st_ativo` tinyint(1) DEFAULT '1',
  `nr_versao_sessao` int NOT NULL DEFAULT '0',
  `nr_tentativas_falhas` int NOT NULL DEFAULT '0',
  `dt_bloqueio_ate` datetime DEFAULT NULL,
  PRIMARY KEY (`id_profissional`),
  UNIQUE KEY `ds_email` (`ds_email`),
  KEY `id_unidade` (`id_unidade`),
  CONSTRAINT `profissional_ibfk_1` FOREIGN KEY (`id_unidade`) REFERENCES `unidade_saude` (`id_unidade`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------
-- paciente
-- Ficha cadastral do paciente, preenchida pelo nutricionista em 3 etapas:
-- dados pessoais, endereço e acesso ao aplicativo.
--
-- COLUNAS QUE NÃO SÃO MAIS PREENCHIDAS (ficam nulas em cadastro novo):
--
--   nr_telefone, nr_telefone_responsavel
--     O aplicativo parou de pedir telefone. Não era usado em lugar
--     nenhum, e guardar dado pessoal sem uso é exposição de graça pela
--     LGPD. O contato com o paciente é pelo aplicativo e pelo e-mail.
--
--   ds_objetivo_consulta, ds_restricoes_alimentares, ds_alergias,
--   ds_condicoes_saude, ds_medicamentos
--     Era a etapa 3 do cadastro ("dados de saúde"), removida junto com os
--     planos alimentares — o que a usava.
--
-- As colunas continuam aqui, e não foram derrubadas, porque quem já tem
-- banco montado tem dado gravado nelas: um DROP COLUMN apagaria o
-- histórico de quem cadastrou antes da mudança. Quem for mexer nisso
-- precisa decidir o que fazer com esses dados (apagar é o mais provável,
-- justamente pela LGPD), e aí o DROP entra num migration próprio.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `paciente` (
  `id_paciente` int NOT NULL AUTO_INCREMENT,
  `id_profissional` int NOT NULL,
  `nm_paciente` varchar(100) DEFAULT NULL,
  `dt_nascimento` date DEFAULT NULL,
  `sg_sexo` char(1) DEFAULT NULL,
  `nm_responsavel` varchar(100) DEFAULT NULL,
  `nr_telefone` varchar(20) DEFAULT NULL,
  `ds_email` varchar(100) DEFAULT NULL,
  `ds_endereco` varchar(150) DEFAULT NULL,
  `nm_cidade` varchar(50) DEFAULT NULL,
  `ds_observacoes` text,
  `nr_telefone_responsavel` varchar(20) DEFAULT NULL,
  `ds_cep` varchar(9) DEFAULT NULL,
  `ds_numero` varchar(10) DEFAULT NULL,
  `ds_logradouro` varchar(200) DEFAULT NULL,
  `ds_objetivo_consulta` varchar(100) DEFAULT NULL,
  `ds_restricoes_alimentares` text,
  `ds_alergias` text,
  `ds_condicoes_saude` text,
  `ds_medicamentos` text,
  PRIMARY KEY (`id_paciente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------
-- usuario_paciente
-- Acesso do paciente ao aplicativo. Criado junto com o paciente quando o nutricionista envia o convite.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `usuario_paciente` (
  `id_usuario_paciente` int NOT NULL AUTO_INCREMENT,
  `id_paciente` int NOT NULL,
  `ds_email` varchar(150) NOT NULL,
  `ds_senha` varchar(255) DEFAULT NULL,
  `ds_status` varchar(30) NOT NULL DEFAULT 'pendente',
  `dt_criacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `nr_versao_sessao` int NOT NULL DEFAULT '0',
  `nr_tentativas_falhas` int NOT NULL DEFAULT '0',
  `dt_bloqueio_ate` datetime DEFAULT NULL,
  PRIMARY KEY (`id_usuario_paciente`),
  UNIQUE KEY `id_paciente` (`id_paciente`),
  UNIQUE KEY `ds_email` (`ds_email`),
  CONSTRAINT `usuario_paciente_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------
-- tipo_medida
-- Catálogo de medidas antropométricas (peso, altura, PB, PCT, PCS...).
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tipo_medida` (
  `id_tipo_medida` int NOT NULL AUTO_INCREMENT,
  `nm_tipo_medida` varchar(50) DEFAULT NULL,
  `sg_tipo_medida` varchar(10) DEFAULT NULL,
  `ds_descricao` text,
  `ds_unidade_padrao` varchar(10) DEFAULT NULL,
  `nr_idade_min_meses` int DEFAULT NULL,
  `nr_idade_max_meses` int DEFAULT NULL,
  `st_ativo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_tipo_medida`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------
-- indicador
-- Catálogo de indicadores da OMS (IMC/idade, peso/idade, altura/idade...).
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `indicador` (
  `id_indicador` int NOT NULL AUTO_INCREMENT,
  `nm_indicador` varchar(100) DEFAULT NULL,
  `sg_indicador` varchar(20) DEFAULT NULL,
  `ds_descricao` text,
  `ds_formula_calculo` text,
  `nr_idade_min_meses` int DEFAULT NULL,
  `nr_idade_max_meses` int DEFAULT NULL,
  `sg_sexo_aplicavel` varchar(20) DEFAULT NULL,
  `st_ativo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_indicador`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------
-- padrao_crescimento
-- Padrões de crescimento de referência (OMS 2006, OMS 2007...).
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `padrao_crescimento` (
  `id_padrao` int NOT NULL AUTO_INCREMENT,
  `nm_padrao` varchar(100) DEFAULT NULL,
  `ds_descricao` text,
  `nm_fonte` varchar(100) DEFAULT NULL,
  `nr_ano_referencia` int DEFAULT NULL,
  `nr_idade_min_meses` int DEFAULT NULL,
  `nr_idade_max_meses` int DEFAULT NULL,
  `st_ativo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_padrao`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------
-- referencia_oms
-- Curvas da OMS em parâmetros L, M e S, por padrão, indicador, sexo e idade. É daqui que sai o escore-z.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `referencia_oms` (
  `id_referencia` int NOT NULL AUTO_INCREMENT,
  `id_padrao` int NOT NULL,
  `id_indicador` int NOT NULL,
  `sg_sexo` char(1) DEFAULT NULL,
  `nr_idade_meses` int DEFAULT NULL,
  `vl_parametro_l` decimal(10,6) DEFAULT NULL,
  `vl_parametro_m` decimal(10,6) DEFAULT NULL,
  `vl_parametro_s` decimal(10,6) DEFAULT NULL,
  `vl_medida_min` decimal(10,4) DEFAULT NULL,
  `vl_medida_max` decimal(10,4) DEFAULT NULL,
  `st_ativo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_referencia`),
  KEY `id_padrao` (`id_padrao`),
  KEY `id_indicador` (`id_indicador`),
  CONSTRAINT `referencia_oms_ibfk_1` FOREIGN KEY (`id_padrao`) REFERENCES `padrao_crescimento` (`id_padrao`),
  CONSTRAINT `referencia_oms_ibfk_2` FOREIGN KEY (`id_indicador`) REFERENCES `indicador` (`id_indicador`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------
-- classificacao_referencia
-- Faixas de escore-z e o nome da classificação correspondente (eutrofia, magreza...).
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `classificacao_referencia` (
  `id_classificacao` int NOT NULL AUTO_INCREMENT,
  `id_indicador` int NOT NULL,
  `nm_classificacao` varchar(50) DEFAULT NULL,
  `vl_escore_z_min` decimal(5,2) DEFAULT NULL,
  `vl_escore_z_max` decimal(5,2) DEFAULT NULL,
  `ds_descricao` text,
  `st_ativo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_classificacao`),
  KEY `id_indicador` (`id_indicador`),
  CONSTRAINT `classificacao_referencia_ibfk_1` FOREIGN KEY (`id_indicador`) REFERENCES `indicador` (`id_indicador`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------
-- avaliacao
-- Uma consulta de avaliação: paciente, profissional, data e idade no momento.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `avaliacao` (
  `id_avaliacao` int NOT NULL AUTO_INCREMENT,
  `id_paciente` int NOT NULL,
  `id_profissional` int NOT NULL,
  `dt_avaliacao` date DEFAULT NULL,
  `nr_idade_dias` int DEFAULT NULL,
  `nr_idade_meses` int DEFAULT NULL,
  `nr_idade_anos` decimal(5,2) DEFAULT NULL,
  `nm_local_atendimento` varchar(100) DEFAULT NULL,
  `tp_avaliacao` varchar(20) DEFAULT NULL,
  `ds_observacoes` text,
  PRIMARY KEY (`id_avaliacao`),
  KEY `id_paciente` (`id_paciente`),
  KEY `id_profissional` (`id_profissional`),
  CONSTRAINT `avaliacao_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`),
  CONSTRAINT `avaliacao_ibfk_2` FOREIGN KEY (`id_profissional`) REFERENCES `profissional` (`id_profissional`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------
-- medida_antropometrica
-- Os valores medidos numa avaliação (um registro por tipo de medida).
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `medida_antropometrica` (
  `id_medida` int NOT NULL AUTO_INCREMENT,
  `id_avaliacao` int NOT NULL,
  `id_tipo_medida` int NOT NULL,
  `vl_medida` decimal(8,3) DEFAULT NULL,
  `ds_unidade` varchar(10) DEFAULT NULL,
  `sg_lado` varchar(10) DEFAULT NULL,
  `ds_observacoes` text,
  PRIMARY KEY (`id_medida`),
  KEY `id_avaliacao` (`id_avaliacao`),
  KEY `id_tipo_medida` (`id_tipo_medida`),
  CONSTRAINT `medida_antropometrica_ibfk_1` FOREIGN KEY (`id_avaliacao`) REFERENCES `avaliacao` (`id_avaliacao`),
  CONSTRAINT `medida_antropometrica_ibfk_2` FOREIGN KEY (`id_tipo_medida`) REFERENCES `tipo_medida` (`id_tipo_medida`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------
-- resultado_avaliacao
-- O que o cálculo produziu: escore-z, percentil e classificação de cada indicador.
--
-- ds_tom guarda em qual dos três grupos a classificação caiu:
-- 'adequado', 'atencao' ou 'risco'. É o que as telas usam para contar
-- "3 de 4 indicadores adequados" e para colorir os gráficos.
--
-- Existe como coluna, e não como consulta a classificacao_referencia,
-- porque essa tabela está vazia (ver as pendências no fim do arquivo): os
-- pontos de corte vivem no código, em app/utilitarios/oms/faixasOms.js.
-- Guardar o tom junto do resultado também congela a leitura feita NAQUELE
-- dia — se a equipe mudar um ponto de corte amanhã, o histórico não muda
-- de classificação sozinho.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `resultado_avaliacao` (
  `id_resultado` int NOT NULL AUTO_INCREMENT,
  `id_avaliacao` int NOT NULL,
  `id_indicador` int NOT NULL,
  `id_referencia` int DEFAULT NULL,
  `id_classificacao` int DEFAULT NULL,
  `vl_observado` decimal(8,3) DEFAULT NULL,
  `vl_escore_z` decimal(5,2) DEFAULT NULL,
  `vl_percentil` decimal(5,2) DEFAULT NULL,
  `ds_classificacao` varchar(50) DEFAULT NULL,
  `ds_tom` varchar(20) DEFAULT NULL,
  `st_valor_extremo` tinyint(1) DEFAULT '0',
  `ds_interpretacao` text,
  `ds_observacoes` text,
  PRIMARY KEY (`id_resultado`),
  KEY `id_avaliacao` (`id_avaliacao`),
  KEY `id_indicador` (`id_indicador`),
  KEY `id_referencia` (`id_referencia`),
  KEY `id_classificacao` (`id_classificacao`),
  CONSTRAINT `resultado_avaliacao_ibfk_1` FOREIGN KEY (`id_avaliacao`) REFERENCES `avaliacao` (`id_avaliacao`),
  CONSTRAINT `resultado_avaliacao_ibfk_2` FOREIGN KEY (`id_indicador`) REFERENCES `indicador` (`id_indicador`),
  CONSTRAINT `resultado_avaliacao_ibfk_3` FOREIGN KEY (`id_referencia`) REFERENCES `referencia_oms` (`id_referencia`),
  CONSTRAINT `resultado_avaliacao_ibfk_4` FOREIGN KEY (`id_classificacao`) REFERENCES `classificacao_referencia` (`id_classificacao`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------
-- inquerito
-- Inquéritos ou estudos populacionais que agrupam pacientes.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `inquerito` (
  `id_inquerito` int NOT NULL AUTO_INCREMENT,
  `nm_titulo` varchar(100) DEFAULT NULL,
  `ds_descricao` text,
  `dt_inicio` date DEFAULT NULL,
  `dt_fim` date DEFAULT NULL,
  `nm_instituicao` varchar(100) DEFAULT NULL,
  `nm_responsavel` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_inquerito`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------
-- inquerito_paciente
-- Quais pacientes participam de qual inquérito.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `inquerito_paciente` (
  `id_inquerito` int NOT NULL,
  `id_paciente` int NOT NULL,
  `dt_inclusao` date DEFAULT NULL,
  `ds_observacoes` text,
  PRIMARY KEY (`id_inquerito`,`id_paciente`),
  KEY `id_paciente` (`id_paciente`),
  CONSTRAINT `inquerito_paciente_ibfk_1` FOREIGN KEY (`id_inquerito`) REFERENCES `inquerito` (`id_inquerito`),
  CONSTRAINT `inquerito_paciente_ibfk_2` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------
-- token_senha
-- Pedidos de redefinição de senha. Guarda o HASH do token, nunca o token
-- em si: quem ler o banco não consegue redefinir a senha de ninguém.
-- O token vale 30 minutos e só pode ser usado uma vez (dt_uso).
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `token_senha` (
  `id_token` int NOT NULL AUTO_INCREMENT,
  `id_profissional` int NOT NULL,
  `ds_token_hash` char(64) NOT NULL,
  `dt_expiracao` datetime NOT NULL,
  `dt_uso` datetime DEFAULT NULL,
  `dt_criacao` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_token`),
  UNIQUE KEY `ds_token_hash` (`ds_token_hash`),
  KEY `id_profissional` (`id_profissional`),
  CONSTRAINT `token_senha_ibfk_1` FOREIGN KEY (`id_profissional`)
    REFERENCES `profissional` (`id_profissional`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------
-- token_senha_paciente
-- O mesmo que token_senha, para a conta do PACIENTE (usuario_paciente).
--
-- É uma tabela separada, e não uma coluna a mais em token_senha, porque
-- as duas contas vivem em tabelas diferentes: uma chave estrangeira não
-- aponta para duas tabelas. Separado, o banco continua garantindo que
-- todo token pertence a uma conta que existe.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `token_senha_paciente` (
  `id_token` int NOT NULL AUTO_INCREMENT,
  `id_paciente` int NOT NULL,
  `ds_token_hash` char(64) NOT NULL,
  `dt_expiracao` datetime NOT NULL,
  `dt_uso` datetime DEFAULT NULL,
  `dt_criacao` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_token`),
  UNIQUE KEY `ds_token_hash` (`ds_token_hash`),
  KEY `id_paciente` (`id_paciente`),
  CONSTRAINT `token_senha_paciente_ibfk_1` FOREIGN KEY (`id_paciente`)
    REFERENCES `paciente` (`id_paciente`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------
-- notificacao
-- Avisos para o nutricionista dentro do aplicativo: consulta chegando,
-- paciente novo, plano vencendo. dt_leitura nulo = ainda não lida (é o que
-- alimenta o número no sino).
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notificacao` (
  `id_notificacao` int NOT NULL AUTO_INCREMENT,
  `id_profissional` int NOT NULL,
  `tp_notificacao` varchar(20) NOT NULL,
  `ds_titulo` varchar(120) NOT NULL,
  `ds_mensagem` varchar(255) DEFAULT NULL,
  `ds_rota` varchar(60) DEFAULT NULL,
  `id_referencia` int DEFAULT NULL,
  `dt_criacao` datetime DEFAULT CURRENT_TIMESTAMP,
  `dt_leitura` datetime DEFAULT NULL,
  PRIMARY KEY (`id_notificacao`),
  KEY `nao_lidas` (`id_profissional`,`dt_leitura`),
  CONSTRAINT `notificacao_ibfk_1` FOREIGN KEY (`id_profissional`)
    REFERENCES `profissional` (`id_profissional`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------
-- preferencia_notificacao
-- Quais tipos de aviso o nutricionista quer receber. Uma linha por
-- profissional; quem não tem linha recebe tudo (o padrao das colunas).
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `preferencia_notificacao` (
  `id_profissional` int NOT NULL,
  `st_consultas` tinyint(1) DEFAULT '1',
  `st_pacientes` tinyint(1) DEFAULT '1',
  `st_planos` tinyint(1) DEFAULT '1',
  `st_sistema` tinyint(1) DEFAULT '1',
  `st_email` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id_profissional`),
  CONSTRAINT `preferencia_notificacao_ibfk_1` FOREIGN KEY (`id_profissional`)
    REFERENCES `profissional` (`id_profissional`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;






-- ---------------------------------------------------------------
-- consentimento_paciente
-- Os aceites do paciente (ou do responsável legal): Termos e Política de
-- Privacidade, e o tratamento dos dados de saúde (LGPD, Art. 11, I).
--
--   tp_consentidor   'titular' (o próprio paciente adulto) ou
--                    'responsavel' (pai, mãe ou responsável legal do menor)
--   nm_consentidor   o nome de quem aceitou
--   ds_origem        'app_primeiro_acesso' = aceito na tela, pela pessoa.
--                    NULL = gravado automaticamente pela versão antiga do
--                    sistema, no primeiro login, sem tela nenhuma. Essas
--                    linhas NÃO valem como consentimento e ficam só como
--                    histórico; quem só tem elas aceita de novo no login.
--   dt_revogacao     preenchida quando o paciente revoga, ou quando um
--                    aceite novo (versão nova dos termos) substitui este
--   ds_motivo_revogacao  'revogado_pelo_titular' ou 'substituido'
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS consentimento_paciente (
  id_consentimento INT NOT NULL AUTO_INCREMENT,
  id_paciente INT NOT NULL,
  tp_consentimento VARCHAR(50) NOT NULL,
  st_aceito TINYINT(1) NOT NULL DEFAULT 1,
  ds_versao_termos VARCHAR(30) NOT NULL,
  tp_consentidor VARCHAR(20) DEFAULT NULL,
  nm_consentidor VARCHAR(100) DEFAULT NULL,
  ds_origem VARCHAR(30) DEFAULT NULL,
  dt_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  dt_revogacao TIMESTAMP NULL DEFAULT NULL,
  ds_motivo_revogacao VARCHAR(40) DEFAULT NULL,
  PRIMARY KEY (id_consentimento),
  INDEX idx_consentimento_paciente (id_paciente),
  CONSTRAINT fk_consentimento_paciente
    FOREIGN KEY (id_paciente)
    REFERENCES paciente (id_paciente)
);

-- ---------------------------------------------------------------
-- plano_alimentar
-- O plano de um paciente: o período, as metas e o estado.
--
-- Um plano pertence ao paciente E ao profissional que o escreveu. O
-- id_profissional é repetido aqui de propósito: toda query do plano
-- filtra por ele para que um nutricionista não alcance o plano de
-- outro, e assim a checagem não depende de um JOIN com paciente.
--
-- ds_status guarda 'ativo' ou 'arquivado' (planoStorage.js recusa o
-- resto). Arquivar não apaga: o histórico do paciente continua.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS plano_alimentar (
  id_plano INT NOT NULL AUTO_INCREMENT,
  id_paciente INT NOT NULL,
  id_profissional INT NOT NULL,
  nm_plano VARCHAR(100) NOT NULL,
  dt_inicio DATE NOT NULL,
  dt_fim DATE NOT NULL,
  vl_meta_kcal INT NOT NULL,
  vl_meta_agua_litros DECIMAL(4,2) NOT NULL DEFAULT 0,
  ds_observacoes TEXT,
  ds_status VARCHAR(20) NOT NULL DEFAULT 'ativo',
  PRIMARY KEY (id_plano),
  INDEX idx_plano_profissional (id_profissional),
  INDEX idx_plano_paciente (id_paciente),
  CONSTRAINT fk_plano_paciente
    FOREIGN KEY (id_paciente)
    REFERENCES paciente (id_paciente),
  CONSTRAINT fk_plano_profissional
    FOREIGN KEY (id_profissional)
    REFERENCES profissional (id_profissional)
);

-- ---------------------------------------------------------------
-- plano_refeicao
-- As refeições de um plano (café, almoço, jantar...), na ordem em
-- que aparecem na tela — nr_ordem, porque o id não serve: ao editar
-- um plano as refeições são apagadas e regravadas.
--
-- O CASCADE é usado pelo código: atualizarPlano() apaga as refeições
-- do plano e as grava de novo, contando que os alimentos saiam junto.
-- Sem ele, cada edição deixaria alimentos órfãos no banco.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS plano_refeicao (
  id_refeicao INT NOT NULL AUTO_INCREMENT,
  id_plano INT NOT NULL,
  nm_refeicao VARCHAR(100) NOT NULL,
  nr_ordem INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id_refeicao),
  INDEX idx_refeicao_plano (id_plano),
  CONSTRAINT fk_refeicao_plano
    FOREIGN KEY (id_plano)
    REFERENCES plano_alimentar (id_plano)
    ON DELETE CASCADE
);

-- ---------------------------------------------------------------
-- plano_alimento
-- Os alimentos de cada refeição, com a porção e os valores.
--
-- Os valores são copiados da tabela TACO no momento em que o plano é
-- montado, não consultados depois: ds_codigo_taco serve para saber de
-- onde o alimento veio, mas o plano do paciente não deve mudar sozinho
-- se a base da TACO for atualizada. Alimento digitado à mão não tem
-- código — por isso a coluna aceita nulo.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS plano_alimento (
  id_plano_alimento INT NOT NULL AUTO_INCREMENT,
  id_refeicao INT NOT NULL,
  ds_codigo_taco VARCHAR(30) DEFAULT NULL,
  nm_alimento VARCHAR(150) NOT NULL,
  ds_porcao VARCHAR(50) DEFAULT NULL,
  vl_kcal DECIMAL(8,2) NOT NULL DEFAULT 0,
  vl_proteina DECIMAL(8,2) NOT NULL DEFAULT 0,
  vl_carboidrato DECIMAL(8,2) NOT NULL DEFAULT 0,
  vl_gordura DECIMAL(8,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (id_plano_alimento),
  INDEX idx_alimento_refeicao (id_refeicao),
  CONSTRAINT fk_alimento_refeicao
    FOREIGN KEY (id_refeicao)
    REFERENCES plano_refeicao (id_refeicao)
    ON DELETE CASCADE
);

-- ---------------------------------------------------------------
-- assinatura
-- O plano pago do nutricionista. Uma linha por profissional: a
-- assinatura atual, não o histórico (quem troca de plano reescreve a
-- mesma linha).
--
-- ds_plano guarda o id do plano do catálogo ('basico', 'profissional',
-- 'avancado', 'clinica_start'...). É texto, e não chave estrangeira para
-- uma tabela de planos, porque o catálogo (nome, preço, benefícios) vive
-- no código: Api/dados/planosAssinatura.js, igual ao arquivo do
-- aplicativo. Reajustar um preço não deve mexer no banco.
--
-- Cancelar não apaga a linha: ds_status vira 'cancelada' e
-- dt_cancelamento é preenchida, para a conta lembrar que já assinou.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `assinatura` (
  `id_assinatura` int NOT NULL AUTO_INCREMENT,
  `id_profissional` int NOT NULL,
  `ds_plano` varchar(40) NOT NULL,
  `ds_status` varchar(20) NOT NULL DEFAULT 'ativa',
  `dt_inicio` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dt_cancelamento` datetime DEFAULT NULL,
  PRIMARY KEY (`id_assinatura`),
  UNIQUE KEY `uk_assinatura_profissional` (`id_profissional`),
  CONSTRAINT `assinatura_ibfk_1` FOREIGN KEY (`id_profissional`)
    REFERENCES `profissional` (`id_profissional`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------
-- cobranca
-- Histórico de cobranças da assinatura, mostrado no Perfil.
--
-- O valor é gravado aqui, e não lido do catálogo na hora de mostrar: uma
-- cobrança de setembro tem que continuar mostrando o preço de setembro
-- depois de um reajuste.
--
-- Enquanto não houver gateway de pagamento, a linha nasce no momento em
-- que o plano é contratado pelo aplicativo.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cobranca` (
  `id_cobranca` int NOT NULL AUTO_INCREMENT,
  `id_profissional` int NOT NULL,
  `ds_referencia` varchar(100) NOT NULL,
  `vl_cobranca` decimal(10,2) NOT NULL,
  `dt_cobranca` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_cobranca`),
  KEY `idx_cobranca_profissional` (`id_profissional`,`dt_cobranca`),
  CONSTRAINT `cobranca_ibfk_1` FOREIGN KEY (`id_profissional`)
    REFERENCES `profissional` (`id_profissional`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------
-- consulta
-- O agendamento: quem atende, quem é atendido, quando e por quanto tempo.
--
-- Um paciente CADASTRADO entra por id_paciente; quem ainda não tem ficha
-- entra como avulso, com nm_paciente_avulso. Por isso as duas colunas
-- aceitam nulo, e nunca as duas ao mesmo tempo: quem garante isso é o
-- código (Api/storage/consultaStorage.js exige o nome quando não vem id).
--
-- O telefone avulso existe porque esse paciente não tem ficha nenhuma —
-- é o único jeito de avisá-lo. Paciente cadastrado não tem telefone
-- guardado: o aviso vai pelo aplicativo e pelo e-mail.
--
-- ds_status guarda 'pendente', 'confirmada', 'cancelada' ou 'realizada'.
-- Cancelar não apaga a linha: o horário continua no histórico, e é por
-- isso que a checagem de conflito ignora as canceladas.
--
-- Os dois índices são os dois jeitos de ler a tabela: a agenda do
-- nutricionista (por profissional e data) e o histórico de consultas que
-- aparece na ficha do paciente (por paciente e data).
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `consulta` (
  `id_consulta` int NOT NULL AUTO_INCREMENT,
  `id_profissional` int NOT NULL,
  `id_paciente` int DEFAULT NULL,
  `nm_paciente_avulso` varchar(100) DEFAULT NULL,
  `nr_telefone_avulso` varchar(20) DEFAULT NULL,
  `dt_inicio` datetime NOT NULL,
  `nr_duracao_minutos` int NOT NULL DEFAULT '45',
  `ds_tipo` varchar(40) NOT NULL,
  `ds_observacoes` text,
  `ds_status` varchar(20) NOT NULL DEFAULT 'pendente',
  `fl_notificar` tinyint(1) NOT NULL DEFAULT '0',
  `dt_criacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_consulta`),
  KEY `idx_consulta_agenda` (`id_profissional`,`dt_inicio`),
  KEY `idx_consulta_paciente` (`id_paciente`,`dt_inicio`),
  CONSTRAINT `consulta_ibfk_1` FOREIGN KEY (`id_profissional`)
    REFERENCES `profissional` (`id_profissional`),
  CONSTRAINT `consulta_ibfk_2` FOREIGN KEY (`id_paciente`)
    REFERENCES `paciente` (`id_paciente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- ---------------------------------------------------------------
-- solicitacao_titular
-- Pedidos que o paciente faz pelo aplicativo com base na LGPD (Art. 18):
-- cópia dos dados, correção, exclusão, informação, oposição.
--
-- O prazo de resposta completa é de 15 dias (Art. 19, II) e fica gravado
-- em dt_prazo, para a tela do nutricionista mostrar o que está vencendo.
-- ds_status: 'aberta', 'em_andamento', 'atendida' ou 'recusada'.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `solicitacao_titular` (
  `id_solicitacao` int NOT NULL AUTO_INCREMENT,
  `id_paciente` int NOT NULL,
  `id_profissional` int NOT NULL,
  `tp_solicitacao` varchar(20) NOT NULL,
  `ds_mensagem` varchar(1000) DEFAULT NULL,
  `ds_status` varchar(20) NOT NULL DEFAULT 'aberta',
  `ds_resposta` varchar(1000) DEFAULT NULL,
  `dt_abertura` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dt_prazo` datetime NOT NULL,
  `dt_conclusao` datetime DEFAULT NULL,
  PRIMARY KEY (`id_solicitacao`),
  KEY `idx_solicitacao_profissional` (`id_profissional`, `ds_status`, `dt_prazo`),
  KEY `idx_solicitacao_paciente` (`id_paciente`),
  CONSTRAINT `solicitacao_titular_ibfk_1` FOREIGN KEY (`id_paciente`)
    REFERENCES `paciente` (`id_paciente`),
  CONSTRAINT `solicitacao_titular_ibfk_2` FOREIGN KEY (`id_profissional`)
    REFERENCES `profissional` (`id_profissional`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------
-- log_auditoria
-- Quem fez o quê, quando, de onde, e em qual paciente (LGPD, Art. 37).
-- Gravado por Api/servicos/auditoria.js.
--
-- NÃO guarda nome nem dado de saúde: só ids, a ação e um detalhe técnico
-- curto. E-mail de quem errou o login entra como pseudônimo (HMAC), nunca
-- em texto.
--
-- Encadeado por hash: ds_hash = SHA-256(ds_hash_anterior + conteúdo da
-- linha). Editar ou apagar uma linha no meio quebra a corrente, e
-- "npm run auditoria:verificar" (pasta Api) mostra onde.
--
-- Sem chave estrangeira de propósito: a linha precisa sobreviver à
-- exclusão do paciente e do profissional — é ela que prova o que houve.
--
-- Recomendado em produção: o usuário do banco da API com INSERT e SELECT
-- nesta tabela, e sem UPDATE (o DELETE fica só para o expurgo por prazo):
--   REVOKE UPDATE ON helthplus.log_auditoria FROM 'helthplus'@'localhost';
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `log_auditoria` (
  `id_log` bigint NOT NULL AUTO_INCREMENT,
  `dt_evento` datetime(3) NOT NULL,
  `tp_ator` varchar(20) NOT NULL,
  `id_ator` int DEFAULT NULL,
  `ds_acao` varchar(60) NOT NULL,
  `ds_recurso` varchar(40) DEFAULT NULL,
  `id_recurso` int DEFAULT NULL,
  `id_paciente_alvo` int DEFAULT NULL,
  `st_sucesso` tinyint(1) NOT NULL DEFAULT '1',
  `ds_ip` varchar(45) DEFAULT NULL,
  `ds_dispositivo` varchar(120) DEFAULT NULL,
  `ds_id_requisicao` char(36) DEFAULT NULL,
  `ds_detalhe` text,
  `ds_hash_anterior` char(64) NOT NULL,
  `ds_hash` char(64) NOT NULL,
  PRIMARY KEY (`id_log`),
  KEY `idx_auditoria_paciente` (`id_paciente_alvo`, `dt_evento`),
  KEY `idx_auditoria_ator` (`tp_ator`, `id_ator`, `dt_evento`),
  KEY `idx_auditoria_data` (`dt_evento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------
-- Catálogos de referência: tipo_medida e indicador
--
-- Estas duas tabelas eram as únicas de referência que o código PRECISA
-- preenchidas, e estavam vazias — era por isso que não havia como gravar
-- uma avaliação: medida_antropometrica e resultado_avaliacao têm chave
-- estrangeira para elas.
--
-- As curvas da OMS continuam fora do banco, nos JSON de
-- app/utilitarios/oms/dados (ver a pendência 3, no fim do arquivo). O que
-- entra aqui é só o CATÁLOGO: o nome de cada medida e de cada indicador.
--
-- Os ids são fixos e escritos à mão porque o código grava por eles
-- (Api/repository/avaliacaoRepository.js procura o indicador pela sigla,
-- que é a mesma chave usada no aplicativo). O ON DUPLICATE KEY deixa o
-- script rodar de novo sem erro e sem duplicar linha.
--
-- As siglas de "indicador" são as chaves do aplicativo
-- (app/utilitarios/oms/faixasOms.js). Se mudar lá, mude aqui.
-- ---------------------------------------------------------------
INSERT INTO `tipo_medida`
  (`id_tipo_medida`, `nm_tipo_medida`, `sg_tipo_medida`, `ds_unidade_padrao`,
   `nr_idade_min_meses`, `nr_idade_max_meses`, `ds_descricao`)
VALUES
  (1, 'Peso',                        'PESO', 'kg',   0, 228, 'Peso corporal'),
  (2, 'Estatura',                    'EST',  'cm',   0, 228, 'Estatura em pé ou comprimento deitado'),
  (3, 'Perímetro cefálico',          'PC',   'cm',   0,  60, 'Perímetro da cabeça'),
  (4, 'Perímetro braquial',          'PB',   'cm',   3,  60, 'Perímetro do braço'),
  (5, 'Prega cutânea tricipital',    'PCT',  'mm',   3,  60, 'Dobra cutânea do tríceps'),
  (6, 'Prega cutânea subescapular',  'PCS',  'mm',   3,  60, 'Dobra cutânea subescapular')
AS novo
ON DUPLICATE KEY UPDATE
  `nm_tipo_medida`    = novo.`nm_tipo_medida`,
  `sg_tipo_medida`    = novo.`sg_tipo_medida`,
  `ds_unidade_padrao` = novo.`ds_unidade_padrao`;

INSERT INTO `indicador`
  (`id_indicador`, `nm_indicador`, `sg_indicador`,
   `nr_idade_min_meses`, `nr_idade_max_meses`, `sg_sexo_aplicavel`, `ds_descricao`)
VALUES
  (1,  'Peso por idade',                  'peso_idade',       0, 120, 'MF', 'Peso comparado ao esperado para a idade'),
  (2,  'Estatura por idade',              'estatura_idade',   0, 228, 'MF', 'Estatura comparada ao esperado para a idade'),
  (3,  'IMC por idade',                   'imc_idade',        0, 228, 'MF', 'IMC comparado ao esperado para a idade'),
  (4,  'Peso por comprimento',            'peso_comprimento', 0,  24, 'MF', 'Peso comparado ao esperado para o comprimento'),
  (5,  'Peso por estatura',               'peso_estatura',   24,  60, 'MF', 'Peso comparado ao esperado para a estatura'),
  (6,  'Perímetro cefálico por idade',    'pc_idade',         0,  60, 'MF', 'Perímetro cefálico comparado ao esperado para a idade'),
  (7,  'Perímetro braquial por idade',    'pb_idade',         3,  60, 'MF', 'Perímetro braquial comparado ao esperado para a idade'),
  (8,  'Prega tricipital por idade',      'pct_idade',        3,  60, 'MF', 'Dobra do tríceps comparada ao esperado para a idade'),
  (9,  'Prega subescapular por idade',    'pcs_idade',        3,  60, 'MF', 'Dobra subescapular comparada ao esperado para a idade'),
  (10, 'IMC de adulto',                   'imc_adulto',     228, 1440, 'MF', 'IMC classificado pelas faixas da OMS para adultos')
AS novo
ON DUPLICATE KEY UPDATE
  `nm_indicador` = novo.`nm_indicador`,
  `sg_indicador` = novo.`sg_indicador`;

-- ---------------------------------------------------------------
-- Atualizações de banco já existente
--
-- Os CREATE TABLE acima têm IF NOT EXISTS: eles criam o que falta e não
-- tocam no que já existe. É o que se quer — menos num caso: COLUNA NOVA
-- numa tabela que já existe. Nesse caso o CREATE é ignorado por inteiro,
-- e a coluna nunca chega ao banco de quem rodou o script antes.
--
-- Por isso cada coluna acrescentada depois da primeira versão precisa de
-- um ALTER aqui embaixo. O MySQL 8.0 não tem "ADD COLUMN IF NOT EXISTS",
-- então o jeito de deixar o script re-executável é olhar o
-- information_schema e só montar o ALTER quando a coluna faltar.
--
-- Ao acrescentar coluna: mude o CREATE TABLE lá em cima (para quem monta
-- o banco do zero) E acrescente o bloco aqui (para quem já tem banco).
-- ---------------------------------------------------------------

-- resultado_avaliacao.ds_tom — o grupo da classificação ('adequado',
-- 'atencao', 'risco'). É o que as telas usam para contar os indicadores
-- adequados e para colorir os gráficos da evolução.
SET @coluna_existe = (
  SELECT COUNT(*)
    FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = 'helthplus'
     AND TABLE_NAME   = 'resultado_avaliacao'
     AND COLUMN_NAME  = 'ds_tom'
);

SET @comando = IF(
  @coluna_existe = 0,
  'ALTER TABLE `resultado_avaliacao`
     ADD COLUMN `ds_tom` varchar(20) DEFAULT NULL AFTER `ds_classificacao`',
  'SELECT "resultado_avaliacao.ds_tom já existe" AS resultado'
);

PREPARE acrescentar FROM @comando;
EXECUTE acrescentar;
DEALLOCATE PREPARE acrescentar;


-- ---- Segurança, LGPD e auditoria (2026-11-07) ----

-- profissional.nr_versao_sessao — sobe quando a senha muda ou em "sair de todos os aparelhos"; derruba os tokens antigos
SET @coluna_existe = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = 'helthplus' AND TABLE_NAME = 'profissional' AND COLUMN_NAME = 'nr_versao_sessao'
);
SET @comando = IF(@coluna_existe = 0,
  'ALTER TABLE `profissional` ADD COLUMN `nr_versao_sessao` int NOT NULL DEFAULT ''0''',
  'SELECT "profissional.nr_versao_sessao já existe" AS resultado');
PREPARE acrescentar FROM @comando;
EXECUTE acrescentar;
DEALLOCATE PREPARE acrescentar;

-- profissional.nr_tentativas_falhas — senhas erradas seguidas, para o bloqueio temporário
SET @coluna_existe = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = 'helthplus' AND TABLE_NAME = 'profissional' AND COLUMN_NAME = 'nr_tentativas_falhas'
);
SET @comando = IF(@coluna_existe = 0,
  'ALTER TABLE `profissional` ADD COLUMN `nr_tentativas_falhas` int NOT NULL DEFAULT ''0''',
  'SELECT "profissional.nr_tentativas_falhas já existe" AS resultado');
PREPARE acrescentar FROM @comando;
EXECUTE acrescentar;
DEALLOCATE PREPARE acrescentar;

-- profissional.dt_bloqueio_ate — até quando a conta fica bloqueada por excesso de tentativas (UTC)
SET @coluna_existe = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = 'helthplus' AND TABLE_NAME = 'profissional' AND COLUMN_NAME = 'dt_bloqueio_ate'
);
SET @comando = IF(@coluna_existe = 0,
  'ALTER TABLE `profissional` ADD COLUMN `dt_bloqueio_ate` datetime DEFAULT NULL',
  'SELECT "profissional.dt_bloqueio_ate já existe" AS resultado');
PREPARE acrescentar FROM @comando;
EXECUTE acrescentar;
DEALLOCATE PREPARE acrescentar;

-- usuario_paciente.nr_versao_sessao — sobe quando a senha muda ou em "sair de todos os aparelhos"; derruba os tokens antigos
SET @coluna_existe = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = 'helthplus' AND TABLE_NAME = 'usuario_paciente' AND COLUMN_NAME = 'nr_versao_sessao'
);
SET @comando = IF(@coluna_existe = 0,
  'ALTER TABLE `usuario_paciente` ADD COLUMN `nr_versao_sessao` int NOT NULL DEFAULT ''0''',
  'SELECT "usuario_paciente.nr_versao_sessao já existe" AS resultado');
PREPARE acrescentar FROM @comando;
EXECUTE acrescentar;
DEALLOCATE PREPARE acrescentar;

-- usuario_paciente.nr_tentativas_falhas — senhas erradas seguidas, para o bloqueio temporário
SET @coluna_existe = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = 'helthplus' AND TABLE_NAME = 'usuario_paciente' AND COLUMN_NAME = 'nr_tentativas_falhas'
);
SET @comando = IF(@coluna_existe = 0,
  'ALTER TABLE `usuario_paciente` ADD COLUMN `nr_tentativas_falhas` int NOT NULL DEFAULT ''0''',
  'SELECT "usuario_paciente.nr_tentativas_falhas já existe" AS resultado');
PREPARE acrescentar FROM @comando;
EXECUTE acrescentar;
DEALLOCATE PREPARE acrescentar;

-- usuario_paciente.dt_bloqueio_ate — até quando a conta fica bloqueada por excesso de tentativas (UTC)
SET @coluna_existe = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = 'helthplus' AND TABLE_NAME = 'usuario_paciente' AND COLUMN_NAME = 'dt_bloqueio_ate'
);
SET @comando = IF(@coluna_existe = 0,
  'ALTER TABLE `usuario_paciente` ADD COLUMN `dt_bloqueio_ate` datetime DEFAULT NULL',
  'SELECT "usuario_paciente.dt_bloqueio_ate já existe" AS resultado');
PREPARE acrescentar FROM @comando;
EXECUTE acrescentar;
DEALLOCATE PREPARE acrescentar;

-- consentimento_paciente.tp_consentidor — titular ou responsavel
SET @coluna_existe = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = 'helthplus' AND TABLE_NAME = 'consentimento_paciente' AND COLUMN_NAME = 'tp_consentidor'
);
SET @comando = IF(@coluna_existe = 0,
  'ALTER TABLE `consentimento_paciente` ADD COLUMN `tp_consentidor` varchar(20) DEFAULT NULL',
  'SELECT "consentimento_paciente.tp_consentidor já existe" AS resultado');
PREPARE acrescentar FROM @comando;
EXECUTE acrescentar;
DEALLOCATE PREPARE acrescentar;

-- consentimento_paciente.nm_consentidor — nome de quem aceitou
SET @coluna_existe = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = 'helthplus' AND TABLE_NAME = 'consentimento_paciente' AND COLUMN_NAME = 'nm_consentidor'
);
SET @comando = IF(@coluna_existe = 0,
  'ALTER TABLE `consentimento_paciente` ADD COLUMN `nm_consentidor` varchar(100) DEFAULT NULL',
  'SELECT "consentimento_paciente.nm_consentidor já existe" AS resultado');
PREPARE acrescentar FROM @comando;
EXECUTE acrescentar;
DEALLOCATE PREPARE acrescentar;

-- consentimento_paciente.ds_origem — app_primeiro_acesso, ou NULL nos aceites automáticos antigos
SET @coluna_existe = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = 'helthplus' AND TABLE_NAME = 'consentimento_paciente' AND COLUMN_NAME = 'ds_origem'
);
SET @comando = IF(@coluna_existe = 0,
  'ALTER TABLE `consentimento_paciente` ADD COLUMN `ds_origem` varchar(30) DEFAULT NULL',
  'SELECT "consentimento_paciente.ds_origem já existe" AS resultado');
PREPARE acrescentar FROM @comando;
EXECUTE acrescentar;
DEALLOCATE PREPARE acrescentar;

-- consentimento_paciente.ds_motivo_revogacao — revogado_pelo_titular ou substituido
SET @coluna_existe = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = 'helthplus' AND TABLE_NAME = 'consentimento_paciente' AND COLUMN_NAME = 'ds_motivo_revogacao'
);
SET @comando = IF(@coluna_existe = 0,
  'ALTER TABLE `consentimento_paciente` ADD COLUMN `ds_motivo_revogacao` varchar(40) DEFAULT NULL',
  'SELECT "consentimento_paciente.ds_motivo_revogacao já existe" AS resultado');
PREPARE acrescentar FROM @comando;
EXECUTE acrescentar;
DEALLOCATE PREPARE acrescentar;

-- índice notificacao.idx_notificacao_data — a lista do sino ordena por data (era a pendência 4)
SET @indice_existe = (
  SELECT COUNT(*) FROM information_schema.STATISTICS
   WHERE TABLE_SCHEMA = 'helthplus' AND TABLE_NAME = 'notificacao' AND INDEX_NAME = 'idx_notificacao_data'
);
SET @comando = IF(@indice_existe = 0,
  'ALTER TABLE `notificacao` ADD INDEX `idx_notificacao_data` (`id_profissional`, `dt_criacao`)',
  'SELECT "índice notificacao.idx_notificacao_data já existe" AS resultado');
PREPARE acrescentar FROM @comando;
EXECUTE acrescentar;
DEALLOCATE PREPARE acrescentar;

-- ---------------------------------------------------------------
-- Pendências conhecidas da modelagem
--
-- 1. "paciente" não tem chave estrangeira para "profissional", embora
--    guarde id_profissional e o código dependa dessa ligação. Sem ela o
--    banco aceita paciente apontando para profissional inexistente.
--
-- 2. "nr_registro_conselho" não tem índice único. O cadastro só recusa
--    CRN repetido pela checagem no código (profissionalStorage.js); por
--    duas requisições ao mesmo tempo, dá para gravar duplicado.
--
-- 3. As tabelas de CURVAS da OMS (padrao_crescimento, referencia_oms,
--    classificacao_referencia) continuam vazias. A calculadora lê os JSON
--    de app/utilitarios/oms/dados, que são as tabelas OFICIAIS da OMS —
--    não é dado de demonstração, e funciona. Carregá-las no banco só
--    passa a valer a pena se a equipe quiser editar as curvas sem
--    publicar uma versão nova do aplicativo.
--
--    tipo_medida e indicador saíram dessa lista: agora vêm preenchidas
--    pelos INSERT acima, porque medida_antropometrica e
--    resultado_avaliacao não gravam sem elas.
--
-- 4. (Resolvida em 2026-11-07: índice idx_notificacao_data.)
--
-- 5. Colunas de dado sensível que o aplicativo não preenche mais
--    (ds_alergias, ds_condicoes_saude, ds_medicamentos...) continuam aqui
--    com o que foi gravado antes. Apagá-las é destrutivo e por isso está
--    num arquivo à parte, para rodar com consciência:
--      Api/database/migracoes/001_minimizacao_lgpd.sql
-- ---------------------------------------------------------------
