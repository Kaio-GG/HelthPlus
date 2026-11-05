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
  PRIMARY KEY (`id_profissional`),
  UNIQUE KEY `ds_email` (`ds_email`),
  KEY `id_unidade` (`id_unidade`),
  CONSTRAINT `profissional_ibfk_1` FOREIGN KEY (`id_unidade`) REFERENCES `unidade_saude` (`id_unidade`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------
-- paciente
-- Ficha cadastral do paciente, preenchida pelo nutricionista em 4 etapas.
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






CREATE TABLE IF NOT EXISTS consentimento_paciente (
  id_consentimento INT NOT NULL AUTO_INCREMENT,
  id_paciente INT NOT NULL,
  tp_consentimento VARCHAR(50) NOT NULL,
  st_aceito TINYINT(1) NOT NULL DEFAULT 1,
  ds_versao_termos VARCHAR(30) NOT NULL,
  dt_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  dt_revogacao TIMESTAMP NULL DEFAULT NULL,
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
-- 3. As tabelas de referência da OMS (tipo_medida, indicador,
--    padrao_crescimento, referencia_oms, classificacao_referencia) estão
--    vazias. A calculadora lê os JSON de app/utilitarios/oms/dados, que são
--    as tabelas OFICIAIS da OMS — não é dado de demonstração, e funciona.
--    Carregar essas tabelas só passa a valer a pena se a equipe quiser
--    editar as curvas sem publicar uma versão nova do aplicativo.
--
-- 4. "notificacao" não tem índice por data. Com a lista crescendo, o
--    ORDER BY dt_criacao de cada abertura da tela passa a ordenar tudo.
-- ---------------------------------------------------------------
