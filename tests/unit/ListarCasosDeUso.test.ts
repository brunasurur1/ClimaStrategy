import { describe, expect, it } from 'vitest';
import { ListarAtividades } from '../../src/domain/casos-de-uso/ListarAtividades';
import { ListarCards } from '../../src/domain/casos-de-uso/ListarCards';
import { InMemoryAtividadeRepository } from '../fakes/InMemoryAtividadeRepository';
import { InMemoryCardRepository } from '../fakes/InMemoryCardRepository';

function montar() {
  const atividades = new InMemoryAtividadeRepository([
    { id: 'a1', nome: 'Correr', chave: 'correr' },
  ]);
  const cards = new InMemoryCardRepository(atividades);
  return { atividades, cards };
}

const dadosDoCard = {
  atividadeId: 'a1',
  temperatura: 22,
  umidade: 50,
  velocidadeVento: 10,
  precipitacaoProbabilidade: 0,
  condicaoAtual: 'FAVORAVEL',
};

describe('ListarAtividades', () => {
  it('lista as atividades disponíveis', async () => {
    const { atividades } = montar();
    const caso = new ListarAtividades(atividades);

    expect(await caso.executar()).toEqual([
      { id: 'a1', nome: 'Correr', chave: 'correr' },
    ]);
  });
});

describe('ListarCards', () => {
  it('retorna lista vazia quando não há cards', async () => {
    const { cards } = montar();
    const caso = new ListarCards(cards);

    expect(await caso.executar()).toEqual([]);
  });

  it('lista os cards com a atividade, do mais recente para o mais antigo', async () => {
    const { cards } = montar();
    await cards.criar({ ...dadosDoCard, cidade: 'A' });
    await cards.criar({ ...dadosDoCard, cidade: 'B' });

    const caso = new ListarCards(cards);
    const lista = await caso.executar();

    expect(lista.map((c) => c.cidade)).toEqual(['B', 'A']);
    expect(lista[0].atividade.chave).toBe('correr');
  });
});
