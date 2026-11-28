-- Adiciona a coluna `chave` (identificador estável de roteamento) à tabela
-- Atividade, preservando as linhas existentes.
--
-- SQLite não suporta adicionar coluna NOT NULL sem default a uma tabela com
-- dados, então recriamos a tabela e fazemos o backfill da `chave` a partir do
-- `nome` exibido durante a cópia das linhas. Atividades sem mapeamento conhecido
-- recebem uma chave derivada do nome (minúsculo), evitando violar o NOT NULL.

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Atividade" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "chave" TEXT NOT NULL
);
INSERT INTO "new_Atividade" ("id", "nome", "chave")
SELECT
    "id",
    "nome",
    CASE "nome"
        WHEN 'Correr' THEN 'correr'
        WHEN 'Praia/Piscina' THEN 'praia'
        WHEN 'Piquenique' THEN 'piquenique'
        ELSE LOWER("nome")
    END
FROM "Atividade";
DROP TABLE "Atividade";
ALTER TABLE "new_Atividade" RENAME TO "Atividade";
CREATE UNIQUE INDEX "Atividade_nome_key" ON "Atividade"("nome");
CREATE UNIQUE INDEX "Atividade_chave_key" ON "Atividade"("chave");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
