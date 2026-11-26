import { afterAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

// Cria um diretório exclusivo para os testes
const pastaTemporaria = mkdtempSync(join(tmpdir(), 'climastrategy-test-'));

// Configura as variáveis antes de carregar o Prisma
const bancoTeste = join(pastaTemporaria, 'test.db');

process.env.DATABASE_URL = `file:${bancoTeste.replace(/\\/g, '/')}`;

process.env.OPENWEATHER_API_KEY = 'chave-ficticia-de-teste';

// Aplica as migrations ao banco temporário
try {
  execFileSync(
    process.execPath,
    [resolve('node_modules/prisma/build/index.js'), 'migrate', 'deploy'],
    {
      env: {
        ...process.env,
        CHECKPOINT_DISABLE: '1',
      },
      stdio: 'inherit',
    },
  );
} catch (error) {
  rmSync(pastaTemporaria, {
    recursive: true,
    force: true,
  });

  throw error;
}

// Encerra a conexão e remove o banco após os testes
afterAll(async () => {
  const { prisma } = await import('../../src/prismaClient');

  await prisma.$disconnect();

  rmSync(pastaTemporaria, {
    recursive: true,
    force: true,
  });
});
