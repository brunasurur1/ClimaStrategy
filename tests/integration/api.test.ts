import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import nock from 'nock';
import { createApp } from '../../src/app';
import { prisma } from '../../src/prismaClient';
import {
  simularClima,
  simularCidadeInexistente,
  simularPrevisao,
} from './weatherMock';

const app = createApp();

// ======================================================
// FUNÇÃO AUXILIAR
// ======================================================

async function criarCardTeste(cidade = 'São Paulo') {
  const atividade = await prisma.atividade.findUniqueOrThrow({
    where: { nome: 'Correr' },
  });

  return prisma.card.create({
    data: {
      cidade,
      atividadeId: atividade.id,
      temperatura: 25,
      umidade: 60,
      velocidadeVento: 18,
      precipitacaoProbabilidade: 10,
      condicaoAtual: 'FAVORAVEL',
    },
  });
}

// ======================================================
// CONFIGURAÇÃO E LIMPEZA DOS TESTES
// ======================================================

beforeEach(async () => {
  // Bloqueia conexões HTTP externas
  nock.disableNetConnect();

  // Permite somente conexões locais do Supertest
  nock.enableNetConnect(/^127\.0\.0\.1(:\d+)?$/);

  // Limpa os dados do banco de testes
  await prisma.historico.deleteMany();
  await prisma.card.deleteMany();
  await prisma.atividade.deleteMany();

  // Insere as atividades iniciais
  await prisma.atividade.createMany({
    data: [
      { nome: 'Correr', chave: 'correr' },
      { nome: 'Praia/Piscina', chave: 'praia' },
      { nome: 'Piquenique', chave: 'piquenique' },
    ],
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  nock.cleanAll();
  nock.enableNetConnect();
});

// ======================================================
// GET /atividades
// ======================================================

describe('GET /atividades', () => {
  it('retorna as atividades cadastradas com status 200', async () => {
    const resposta = await request(app).get('/atividades');

    expect(resposta.status).toBe(200);
    expect(resposta.body).toHaveLength(3);

    expect(resposta.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ nome: 'Correr' }),
        expect.objectContaining({ nome: 'Praia/Piscina' }),
        expect.objectContaining({ nome: 'Piquenique' }),
      ]),
    );
  });

  it('retorna uma lista vazia quando não existem atividades', async () => {
    await prisma.atividade.deleteMany();

    const resposta = await request(app).get('/atividades');

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual([]);
  });

  it('retorna status 500 quando ocorre uma falha no banco', async () => {
    vi.spyOn(prisma.atividade, 'findMany').mockRejectedValueOnce(
      new Error('Falha simulada no banco'),
    );

    const resposta = await request(app).get('/atividades');

    expect(resposta.status).toBe(500);
    expect(resposta.body).toEqual({
      message: 'Falha simulada no banco',
    });
  });
});

// ======================================================
// POST /cards
// ======================================================

describe('POST /cards', () => {
  it('cria um card com status 201 e persiste os dados', async () => {
    const atividade = await prisma.atividade.findUniqueOrThrow({
      where: { nome: 'Correr' },
    });

    const mock = simularClima('Sao Paulo', undefined, 'São Paulo');

    const resposta = await request(app).post('/cards').send({
      cidade: 'Sao Paulo',
      atividadeId: atividade.id,
    });

    expect(resposta.status).toBe(201);

    expect(resposta.body).toMatchObject({
      cidade: 'São Paulo',
      atividadeId: atividade.id,
      temperatura: 25,
      umidade: 60,
      velocidadeVento: 18,
      precipitacaoProbabilidade: 10,
      condicaoAtual: 'FAVORAVEL',
    });

    const cardSalvo = await prisma.card.findUnique({
      where: { id: resposta.body.id },
    });

    expect(cardSalvo).not.toBeNull();
    expect(cardSalvo?.cidade).toBe('São Paulo');
    expect(mock.isDone()).toBe(true);
  });

  // Teste complementar: substituição de card repetido
  it('substitui um card repetido da mesma cidade e atividade', async () => {
    const cardAntigo = await criarCardTeste();

    const mock = simularClima('São Paulo', {
      temperatura: 28,
      umidade: 70,
      vento: 5,
      chuva: 0.2,
    });

    const resposta = await request(app).post('/cards').send({
      cidade: 'São Paulo',
      atividadeId: cardAntigo.atividadeId,
    });

    expect(resposta.status).toBe(201);
    expect(resposta.body.id).not.toBe(cardAntigo.id);
    expect(mock.isDone()).toBe(true);

    const cards = await prisma.card.findMany();

    expect(cards).toHaveLength(1);
    expect(cards[0].id).toBe(resposta.body.id);
    expect(cards[0].temperatura).toBe(28);

    const cardRemovido = await prisma.card.findUnique({
      where: { id: cardAntigo.id },
    });

    expect(cardRemovido).toBeNull();
  });

  it('preserva o card antigo quando a recriação falha na transação (rollback)', async () => {
    const cardAntigo = await criarCardTeste('São Paulo');

    const mock = simularClima('São Paulo', {
      temperatura: 28,
      umidade: 70,
      vento: 5,
      chuva: 0.2,
    });

    // Executa a transação real, mas faz o card.create falhar depois que o
    // remover do card antigo já rodou dentro da transação.
    const transacaoReal = prisma.$transaction.bind(prisma);
    vi.spyOn(prisma, '$transaction').mockImplementationOnce((arg: any) =>
      transacaoReal(async (tx: any) => {
        const txComFalha = new Proxy(tx, {
          get(alvo, propriedade) {
            if (propriedade === 'card') {
              return new Proxy(alvo.card, {
                get(cardAlvo, metodo) {
                  if (metodo === 'create') {
                    return () => {
                      throw new Error('falha simulada no create');
                    };
                  }
                  return Reflect.get(cardAlvo, metodo);
                },
              });
            }
            return Reflect.get(alvo, propriedade);
          },
        });
        return arg(txComFalha);
      }),
    );

    const resposta = await request(app).post('/cards').send({
      cidade: 'São Paulo',
      atividadeId: cardAntigo.atividadeId,
    });

    expect(resposta.status).toBe(500);
    expect(mock.isDone()).toBe(true);

    // O card antigo sobrevive ao rollback e nenhum histórico foi gravado.
    const cardPreservado = await prisma.card.findUnique({
      where: { id: cardAntigo.id },
    });
    expect(cardPreservado).not.toBeNull();
    expect(await prisma.card.count()).toBe(1);
    expect(await prisma.historico.count()).toBe(0);
  });

  it('retorna status 400 quando a cidade não é informada', async () => {
    const atividade = await prisma.atividade.findUniqueOrThrow({
      where: { nome: 'Correr' },
    });

    const resposta = await request(app).post('/cards').send({
      atividadeId: atividade.id,
    });

    expect(resposta.status).toBe(400);
    expect(resposta.body.message).toBe(
      'Cidade e atividadeId são obrigatórios.',
    );

    expect(await prisma.card.count()).toBe(0);
  });

  it('retorna status 400 quando atividadeId não é informado', async () => {
    const resposta = await request(app).post('/cards').send({
      cidade: 'São Paulo',
    });

    expect(resposta.status).toBe(400);
    expect(await prisma.card.count()).toBe(0);
  });

  it('retorna status 500 para uma atividade inexistente', async () => {
    const resposta = await request(app).post('/cards').send({
      cidade: 'São Paulo',
      atividadeId: 'atividade-inexistente',
    });

    expect(resposta.status).toBe(500);
    expect(resposta.body.message).toBe('Atividade não encontrada.');

    expect(await prisma.card.count()).toBe(0);
  });

  it('registra a operação CREATE no histórico', async () => {
    const atividade = await prisma.atividade.findUniqueOrThrow({
      where: { nome: 'Correr' },
    });

    const mock = simularClima('São Paulo');

    const resposta = await request(app).post('/cards').send({
      cidade: 'São Paulo',
      atividadeId: atividade.id,
    });

    expect(resposta.status).toBe(201);
    expect(mock.isDone()).toBe(true);

    const historico = await prisma.historico.findMany();

    expect(historico).toHaveLength(1);
    expect(historico[0]).toMatchObject({
      operacao: 'CREATE',
      entidade: 'CARD',
    });
  });

  it('caracteriza o erro atual para cidade inexistente', async () => {
    const atividade = await prisma.atividade.findUniqueOrThrow({
      where: { nome: 'Correr' },
    });

    const mock = simularCidadeInexistente('CidadeInexistente');

    const resposta = await request(app).post('/cards').send({
      cidade: 'CidadeInexistente',
      atividadeId: atividade.id,
    });

    expect(mock.isDone()).toBe(true);
    expect(resposta.status).toBe(500);
    expect(await prisma.card.count()).toBe(0);
  });
});

// ======================================================
// GET /cards
// ======================================================

describe('GET /cards', () => {
  it('retorna os cards cadastrados com status 200', async () => {
    const card = await criarCardTeste();

    const resposta = await request(app).get('/cards');

    expect(resposta.status).toBe(200);
    expect(resposta.body).toHaveLength(1);

    expect(resposta.body[0]).toMatchObject({
      id: card.id,
      cidade: 'São Paulo',
      temperatura: 25,
      atividade: {
        nome: 'Correr',
      },
    });
  });

  it('retorna uma lista vazia quando não existem cards', async () => {
    const resposta = await request(app).get('/cards');

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual([]);
  });

  it('retorna os cards do mais recente para o mais antigo', async () => {
    const primeiroCard = await criarCardTeste('São Paulo');
    const segundoCard = await criarCardTeste('Recife');

    await prisma.card.update({
      where: { id: primeiroCard.id },
      data: {
        createdAt: new Date('2026-01-01T12:00:00Z'),
      },
    });

    await prisma.card.update({
      where: { id: segundoCard.id },
      data: {
        createdAt: new Date('2026-01-02T12:00:00Z'),
      },
    });

    const resposta = await request(app).get('/cards');

    expect(resposta.status).toBe(200);
    expect(resposta.body).toHaveLength(2);
    expect(resposta.body[0].id).toBe(segundoCard.id);
    expect(resposta.body[1].id).toBe(primeiroCard.id);
  });

  it('retorna status 500 quando ocorre uma falha no banco', async () => {
    vi.spyOn(prisma.card, 'findMany').mockRejectedValueOnce(
      new Error('Falha simulada no banco'),
    );

    const resposta = await request(app).get('/cards');

    expect(resposta.status).toBe(500);
    expect(resposta.body.message).toBe('Falha simulada no banco');
  });
});

// ======================================================
// PUT /cards/:id
// ======================================================

describe('PUT /cards/:id', () => {
  it('atualiza os dados climáticos de um card existente', async () => {
    const card = await criarCardTeste();

    const mock = simularClima('São Paulo', {
      temperatura: 32,
      umidade: 80,
      vento: 10,
      chuva: 0.7,
    });

    const resposta = await request(app).put(`/cards/${card.id}`);

    expect(resposta.status).toBe(200);

    expect(resposta.body).toMatchObject({
      id: card.id,
      cidade: 'São Paulo',
      temperatura: 32,
      umidade: 80,
      velocidadeVento: 36,
      precipitacaoProbabilidade: 70,
      condicaoAtual: 'CHUVA_FORTE',
    });

    const cardAtualizado = await prisma.card.findUniqueOrThrow({
      where: { id: card.id },
    });

    expect(cardAtualizado.temperatura).toBe(32);
    expect(cardAtualizado.precipitacaoProbabilidade).toBe(70);
    expect(mock.isDone()).toBe(true);
  });

  it('retorna status 404 para um card inexistente', async () => {
    const resposta = await request(app).put('/cards/card-inexistente');

    expect(resposta.status).toBe(404);
    expect(resposta.body.message).toBe('Card não encontrado.');
  });

  it('registra a operação UPDATE no histórico', async () => {
    const card = await criarCardTeste();

    const mock = simularClima('São Paulo');

    const resposta = await request(app).put(`/cards/${card.id}`);

    expect(resposta.status).toBe(200);
    expect(mock.isDone()).toBe(true);

    const historico = await prisma.historico.findMany();

    expect(historico).toHaveLength(1);
    expect(historico[0]).toMatchObject({
      operacao: 'UPDATE',
      entidade: 'CARD',
      entidadeId: card.id,
    });
  });

  it('preserva os dados do card quando a OpenWeather falha', async () => {
    const card = await criarCardTeste();

    const mock = simularCidadeInexistente('São Paulo');

    const resposta = await request(app).put(`/cards/${card.id}`);

    expect(resposta.status).toBe(500);
    expect(mock.isDone()).toBe(true);

    const cardPreservado = await prisma.card.findUniqueOrThrow({
      where: { id: card.id },
    });

    expect(cardPreservado).toEqual(card);
    expect(await prisma.historico.count()).toBe(0);
  });
});

// ======================================================
// DELETE /cards/:id
// ======================================================

describe('DELETE /cards/:id', () => {
  it('remove um card existente e retorna status 204', async () => {
    const card = await criarCardTeste();

    const resposta = await request(app).delete(`/cards/${card.id}`);

    expect(resposta.status).toBe(204);
    expect(resposta.text).toBe('');

    const cardRemovido = await prisma.card.findUnique({
      where: { id: card.id },
    });

    expect(cardRemovido).toBeNull();
  });

  it('registra a operação DELETE no histórico', async () => {
    const card = await criarCardTeste();

    const resposta = await request(app).delete(`/cards/${card.id}`);

    expect(resposta.status).toBe(204);

    const historico = await prisma.historico.findMany();

    expect(historico).toHaveLength(1);
    expect(historico[0]).toMatchObject({
      operacao: 'DELETE',
      entidade: 'CARD',
      entidadeId: card.id,
    });
  });

  // Falha conhecida: atualmente a API retorna status 500
  // ao tentar excluir um card inexistente.
  // Após a correção, substituir it.fails por it.
  it.fails('retorna status 404 para um card inexistente', async () => {
    const resposta = await request(app).delete('/cards/card-inexistente');

    expect(resposta.status).toBe(404);
    expect(resposta.body.message).toBe('Card não encontrado.');
  });

  it('não registra histórico ao tentar excluir um card inexistente', async () => {
    await request(app).delete('/cards/card-inexistente');

    expect(await prisma.historico.count()).toBe(0);
  });
});

// ======================================================
// GET /cards/:id/forecast
// ======================================================

describe('GET /cards/:id/forecast', () => {
  it('retorna as previsões diárias com status 200', async () => {
    const card = await criarCardTeste();

    const mock = simularPrevisao('São Paulo');

    const resposta = await request(app).get(`/cards/${card.id}/forecast`);

    expect(resposta.status).toBe(200);
    expect(resposta.body).toHaveLength(3);
    expect(mock.isDone()).toBe(true);
  });

  it('retorna os dados climáticos convertidos corretamente', async () => {
    const card = await criarCardTeste();

    const mock = simularPrevisao('São Paulo');

    const resposta = await request(app).get(`/cards/${card.id}/forecast`);

    expect(resposta.status).toBe(200);

    expect(resposta.body[0].dadosClima).toMatchObject({
      temperatura: 25,
      umidade: 60,
      velocidadeVento: 18,
      probabilidadeChuva: 10,
    });

    expect(resposta.body[1].dadosClima).toMatchObject({
      temperatura: 32,
      umidade: 80,
      velocidadeVento: 36,
      probabilidadeChuva: 70,
    });

    expect(mock.isDone()).toBe(true);
  });

  it('aplica a estratégia de corrida para cada dia', async () => {
    const card = await criarCardTeste();

    const mock = simularPrevisao('São Paulo');

    const resposta = await request(app).get(`/cards/${card.id}/forecast`);

    expect(resposta.status).toBe(200);

    expect(resposta.body[0].resultado).toEqual({
      apropriado: true,
      motivo: 'FAVORAVEL',
    });

    expect(resposta.body[1].resultado).toEqual({
      apropriado: false,
      motivo: 'CHUVA_FORTE',
    });

    expect(resposta.body[2].resultado).toEqual({
      apropriado: false,
      motivo: 'CALOR_EXCESSIVO',
    });

    expect(mock.isDone()).toBe(true);
  });

  it('retorna status 404 para um card inexistente', async () => {
    const resposta = await request(app).get('/cards/card-inexistente/forecast');

    expect(resposta.status).toBe(404);
    expect(resposta.body.message).toBe('Card não encontrado.');
  });

  it('retorna status 500 quando a OpenWeather falha', async () => {
    const card = await criarCardTeste();

    const mock = simularCidadeInexistente('São Paulo');

    const resposta = await request(app).get(`/cards/${card.id}/forecast`);

    expect(resposta.status).toBe(500);
    expect(resposta.body.message).toBe(
      'Não foi possível obter a previsão futura.',
    );

    expect(mock.isDone()).toBe(true);
  });
});

// ======================================================
// FALHAS CONHECIDAS DA API
// ======================================================

describe('Falhas conhecidas da API', () => {
  it('CREATE deve registrar o ID real do card no histórico', async () => {
    const atividade = await prisma.atividade.findUniqueOrThrow({
      where: { nome: 'Correr' },
    });

    const mock = simularClima('São Paulo');

    const resposta = await request(app).post('/cards').send({
      cidade: 'São Paulo',
      atividadeId: atividade.id,
    });

    expect(resposta.status).toBe(201);
    expect(mock.isDone()).toBe(true);

    const historico = await prisma.historico.findFirstOrThrow({
      where: {
        operacao: 'CREATE',
        entidade: 'CARD',
      },
    });

    expect(historico.entidadeId).toBe(resposta.body.id);
  });

  // Atualmente retorna 500 em vez de 404.
  it.fails(
    'POST deve retornar status 404 para cidade inexistente',
    async () => {
      const atividade = await prisma.atividade.findUniqueOrThrow({
        where: { nome: 'Correr' },
      });

      const mock = simularCidadeInexistente('CidadeInexistente');

      const resposta = await request(app).post('/cards').send({
        cidade: 'CidadeInexistente',
        atividadeId: atividade.id,
      });

      expect(mock.isDone()).toBe(true);
      expect(resposta.status).toBe(404);
    },
  );

  // Agora o forecast reflete a estratégia de cada dia (issue #7).
  it('forecast deve indicar apropriado false em condições desfavoráveis', async () => {
    const card = await criarCardTeste();

    const mock = simularPrevisao('São Paulo');

    const resposta = await request(app).get(`/cards/${card.id}/forecast`);

    expect(resposta.status).toBe(200);
    expect(mock.isDone()).toBe(true);
    expect(resposta.body).toHaveLength(3);

    expect(resposta.body[1].resultado.apropriado).toBe(false);
  });
});
