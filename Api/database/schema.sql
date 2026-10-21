-- Health Plus — estrutura do banco (MySQL)
--
-- Este arquivo é a fonte da verdade do banco. Foi montado a partir das
-- queries que já existem em Api/repository/. Sempre que uma query nova
-- precisar de uma coluna ou tabela, acrescente aqui no mesmo commit.
--
-- Como rodar:
--   mysql -u root -p < Api/database/schema.sql
--
-- O script pode ser executado mais de uma vez sem erro (IF NOT EXISTS).

CREATE DATABASE IF NOT EXISTS healthplus
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE healthplus;


-- ---------------------------------------------------------------
-- profissional — o nutricionista que usa o aplicativo
-- Usada em: Api/repository/profissionalRepository.js
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profissional (
  id_profissional        INT           NOT NULL AUTO_INCREMENT,
  nm_profissional        VARCHAR(150)  NOT NULL,
  nr_registro_conselho   VARCHAR(30)   NOT NULL,
  ds_email               VARCHAR(150)  NOT NULL,
  -- Hash bcrypt (60 caracteres). Nunca guardar a senha em texto puro.
  ds_senha_hash          VARCHAR(255)  NOT NULL,
  ds_profissao           VARCHAR(50)   NOT NULL DEFAULT 'Nutricionista',
  -- O login recusa a entrada quando st_ativo = 0.
  st_ativo               TINYINT(1)    NOT NULL DEFAULT 1,
  dt_criacao             DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  dt_atualizacao         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                       ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id_profissional),
  -- O cadastro recusa e-mail e registro repetidos; o banco garante isso.
  UNIQUE KEY uq_profissional_email (ds_email),
  UNIQUE KEY uq_profissional_registro (nr_registro_conselho)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;


-- ---------------------------------------------------------------
-- paciente — ficha cadastral, sempre ligada a um profissional
-- Usada em: Api/repository/pacienteRepository.js
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS paciente (
  id_paciente                INT           NOT NULL AUTO_INCREMENT,
  id_profissional            INT           NOT NULL,

  -- Etapa 1 do cadastro: dados básicos
  nm_paciente                VARCHAR(150)  NOT NULL,
  dt_nascimento              DATE          NOT NULL,
  sg_sexo                    CHAR(1)       NOT NULL,
  nm_responsavel             VARCHAR(150)  NULL,
  nr_telefone_responsavel    VARCHAR(20)   NULL,

  -- Etapa 2: contato e endereço
  ds_email                   VARCHAR(150)  NULL,
  nr_telefone                VARCHAR(20)   NULL,
  ds_cep                     VARCHAR(9)    NULL,
  ds_numero                  VARCHAR(10)   NULL,
  ds_logradouro              VARCHAR(200)  NULL,
  nm_cidade                  VARCHAR(100)  NULL,

  -- Etapa 3: informações clínicas
  ds_objetivo_consulta       VARCHAR(255)  NULL,
  ds_restricoes_alimentares  TEXT          NULL,
  ds_alergias                TEXT          NULL,
  ds_condicoes_saude         TEXT          NULL,
  ds_medicamentos            TEXT          NULL,

  dt_criacao                 DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  dt_atualizacao             DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                           ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id_paciente),
  -- Busca mais comum: "todos os pacientes deste nutricionista".
  KEY idx_paciente_profissional (id_profissional),
  CONSTRAINT fk_paciente_profissional
    FOREIGN KEY (id_profissional) REFERENCES profissional (id_profissional)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  -- A aplicação envia sempre 'F' ou 'M' (primeira letra, em maiúscula).
  CONSTRAINT ck_paciente_sexo CHECK (sg_sexo IN ('F', 'M'))
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;


-- ---------------------------------------------------------------
-- usuario_paciente — acesso do paciente ao aplicativo
--
-- Criada junto com o paciente, na mesma transação, quando o
-- nutricionista marca "enviar convite".
--
-- ds_status = 'pendente' significa que o paciente ainda não trocou a
-- senha inicial. O login do paciente deve exigir a troca nesse caso.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuario_paciente (
  id_usuario_paciente  INT           NOT NULL AUTO_INCREMENT,
  id_paciente          INT           NOT NULL,
  ds_email             VARCHAR(150)  NOT NULL,
  -- Hash bcrypt da senha inicial (a data de nascimento, formato DDMMAAAA).
  ds_senha             VARCHAR(255)  NOT NULL,
  ds_status            VARCHAR(20)   NOT NULL DEFAULT 'pendente',
  dt_criacao           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  dt_atualizacao       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                     ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id_usuario_paciente),
  -- O cadastro trata ER_DUP_ENTRY como "já existe um acesso com esse
  -- e-mail", então esta chave única é obrigatória para a mensagem funcionar.
  UNIQUE KEY uq_usuario_paciente_email (ds_email),
  -- Um acesso por paciente.
  UNIQUE KEY uq_usuario_paciente_paciente (id_paciente),
  CONSTRAINT fk_usuario_paciente_paciente
    FOREIGN KEY (id_paciente) REFERENCES paciente (id_paciente)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT ck_usuario_paciente_status
    CHECK (ds_status IN ('pendente', 'ativo', 'inativo'))
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
