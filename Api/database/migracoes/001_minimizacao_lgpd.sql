-- Api/database/migracoes/001_minimizacao_lgpd.sql
--
-- MIGRAÇÃO DESTRUTIVA. Leia antes de rodar.
--
-- O que faz:
--   1. Apaga, de vez, as colunas de dado sensível que o aplicativo deixou
--      de preencher: alergias, condições de saúde, medicamentos, restrições
--      alimentares, objetivo da consulta e os dois telefones do paciente.
--   2. Apaga as tabelas dos planos alimentares (função removida do app).
--
-- Por que existe (LGPD):
--   Dado de saúde guardado sem finalidade atual é tratamento sem base legal
--   (Art. 6º, I e III; Art. 15, I; Art. 16). O schema.sql não faz isto
--   sozinho porque apagar coluna leva junto o que estava gravado nela.
--
-- Antes de rodar:
--   - faça um backup:  mysqldump -u root -p helthplus > backup_antes_001.sql
--   - confirme com a equipe que ninguém precisa desses dados. Se algum
--     paciente pediu cópia dos dados, gere a cópia ANTES (a exportação em
--     /api/lgpd inclui estas colunas enquanto elas existirem);
--   - guarde o backup com o mesmo cuidado do banco, e apague-o quando não
--     for mais necessário.
--
-- Como rodar (MySQL Workbench: File > Open SQL Script, raio):
--   mysql -u root -p -e "source Api/database/migracoes/001_minimizacao_lgpd.sql"
--
-- Pode rodar mais de uma vez: cada passo confere se ainda há o que apagar.

USE helthplus;

-- ---------------------------------------------------------------
-- 1. Colunas sensíveis desativadas da tabela paciente
-- ---------------------------------------------------------------

DROP PROCEDURE IF EXISTS hp_apagar_coluna;

DELIMITER //
CREATE PROCEDURE hp_apagar_coluna(IN tabela VARCHAR(64), IN coluna VARCHAR(64))
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = 'helthplus' AND TABLE_NAME = tabela AND COLUMN_NAME = coluna
  ) THEN
    SET @comando = CONCAT('ALTER TABLE `', tabela, '` DROP COLUMN `', coluna, '`');
    PREPARE apagar FROM @comando;
    EXECUTE apagar;
    DEALLOCATE PREPARE apagar;
  END IF;
END //
DELIMITER ;

CALL hp_apagar_coluna('paciente', 'ds_alergias');
CALL hp_apagar_coluna('paciente', 'ds_condicoes_saude');
CALL hp_apagar_coluna('paciente', 'ds_medicamentos');
CALL hp_apagar_coluna('paciente', 'ds_restricoes_alimentares');
CALL hp_apagar_coluna('paciente', 'ds_objetivo_consulta');
CALL hp_apagar_coluna('paciente', 'nr_telefone');
CALL hp_apagar_coluna('paciente', 'nr_telefone_responsavel');

DROP PROCEDURE hp_apagar_coluna;

-- ---------------------------------------------------------------
-- 2. Planos alimentares (função removida do aplicativo)
--
-- A ordem importa por causa das chaves estrangeiras.
-- ---------------------------------------------------------------

DROP TABLE IF EXISTS plano_alimento;
DROP TABLE IF EXISTS plano_refeicao;
DROP TABLE IF EXISTS plano_alimentar;

-- A API já lida com as colunas e tabelas ausentes: a exportação lê
-- "p.*" e a exclusão do paciente pula plano_alimentar se ela não existir.
