import { describe, expect, it } from 'vitest';
import { CriarCard } from '../../src/domain/casos-de-uso/CriarCard';
import { ExcluirCard } from '../../src/domain/casos-de-uso/ExcluirCard';
import { FakeProvedorClima } from '../fakes/FakeProvedorClima';
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
  const clima = new FakeProvedorClima();
  const unidade = new FakeUnidadeDeTrabalho({ cards, historico });
  const criar = new CriarCard(clima, atividades, cards, unidade);
  const excluir = new ExcluirCard(unidade);
  return { criar, excluir, cards, historico };
}

describe('ExcluirCard', () => {
  it('remove o card e registra DELETE no histórico', async () => {
    const { criar, excluir, cards, historico } = montar();
    const card = await criar.executar('Campinas', 'a1');

    await excluir.executar(card.id);

    expect(await cards.listar()).toHaveLength(0);
    expect(historico.entradas[1]).toEqual({
      operacao: 'DELETE',
      entidade: 'CARD',
      entidadeId: card.id,
    });
  });

  it('não registra histórico ao tentar excluir um card inexistente', async () => {
    const { excluir, historico } = montar();

    await expect(excluir.executar('x')).rejects.toThrow();
    expect(historico.entradas).toHaveLength(0);
  });
});
