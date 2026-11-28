import { describe, expect, it } from 'vitest';
import { FakeUnidadeDeTrabalho } from '../fakes/FakeUnidadeDeTrabalho';
import { InMemoryAtividadeRepository } from '../fakes/InMemoryAtividadeRepository';
import { InMemoryCardRepository } from '../fakes/InMemoryCardRepository';
import { InMemoryHistoricoRepository } from '../fakes/InMemoryHistoricoRepository';

function montar() {
  const atividades = new InMemoryAtividadeRepository([
    { id: 'a1', nome: 'Correr', chave: 'correr' },
  ]);
  const cards = new InMemoryCardRepository(atividades);
  const historico = new InMemoryHistoricoRepository();
  const unidade = new FakeUnidadeDeTrabalho({ cards, historico });
  return { unidade, cards, historico };
}

const dadosDoCard = {
  cidade: 'Campinas',
  atividadeId: 'a1',
  temperatura: 22,
  umidade: 50,
  velocidadeVento: 10,
  precipitacaoProbabilidade: 0,
  condicaoAtual: 'FAVORAVEL',
};

describe('FakeUnidadeDeTrabalho', () => {
  it('persiste as alterações quando o bloco conclui com sucesso', async () => {
    const { unidade, cards, historico } = montar();

    await unidade.executar(async ({ cards, historico }) => {
      const card = await cards.criar(dadosDoCard);
      await historico.registrar({
        operacao: 'CREATE',
        entidade: 'CARD',
        entidadeId: card.id,
      });
    });

    expect(await cards.listar()).toHaveLength(1);
    expect(historico.entradas).toHaveLength(1);
  });

  it('desfaz todas as alterações (rollback) quando o bloco lança erro', async () => {
    const { unidade, cards, historico } = montar();

    await expect(
      unidade.executar(async ({ cards, historico }) => {
        await cards.criar(dadosDoCard);
        await historico.registrar({
          operacao: 'CREATE',
          entidade: 'CARD',
          entidadeId: 'qualquer',
        });
        throw new Error('falha no meio da transação');
      }),
    ).rejects.toThrow('falha no meio da transação');

    expect(await cards.listar()).toHaveLength(0);
    expect(historico.entradas).toHaveLength(0);
  });

  it('preserva o estado anterior à transação ao desfazer', async () => {
    const { unidade, cards } = montar();

    // Estado pré-existente, fora da transação que vai falhar.
    const preexistente = await cards.criar(dadosDoCard);

    await expect(
      unidade.executar(async ({ cards }) => {
        await cards.remover(preexistente.id);
        throw new Error('falha após remover');
      }),
    ).rejects.toThrow('falha após remover');

    // O rollback restaura o card removido.
    const todos = await cards.listar();
    expect(todos).toHaveLength(1);
    expect(todos[0].id).toBe(preexistente.id);
  });
});
