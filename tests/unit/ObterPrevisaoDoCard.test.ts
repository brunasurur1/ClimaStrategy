import { describe, expect, it } from 'vitest';
import { ObterPrevisaoDoCard } from '../../src/domain/casos-de-uso/ObterPrevisaoDoCard';
import type { CondicoesClimaticas } from '../../src/domain/interfaces/CondicoesClimaticas';
import { SeletorDeEstrategia } from '../../src/domain/logica/SeletorDeEstrategia';
import { FakeProvedorClima } from '../fakes/FakeProvedorClima';
import { InMemoryAtividadeRepository } from '../fakes/InMemoryAtividadeRepository';
import { InMemoryCardRepository } from '../fakes/InMemoryCardRepository';

function dadosDeClima(temperatura: number): CondicoesClimaticas {
  return {
    temperatura,
    umidade: 50,
    velocidadeVento: 10,
    probabilidadeChuva: 0,
  };
}

async function montar() {
  const atividades = new InMemoryAtividadeRepository([
    { id: 'a1', nome: 'Correr', chave: 'correr' },
  ]);
  const cards = new InMemoryCardRepository(atividades);
  const clima = new FakeProvedorClima();
  const caso = new ObterPrevisaoDoCard(clima, cards);
  const card = await cards.criar({
    cidade: 'São Paulo',
    atividadeId: 'a1',
    temperatura: 20,
    umidade: 50,
    velocidadeVento: 10,
    precipitacaoProbabilidade: 0,
    condicaoAtual: 'FAVORAVEL',
  });
  return { caso, clima, card };
}

describe('ObterPrevisaoDoCard', () => {
  it('aplica a estratégia da atividade em cada dia da previsão', async () => {
    const { caso, clima, card } = await montar();
    clima.previsao = [
      { ...dadosDeClima(20), data: '2026-11-29 12:00:00' },
      { ...dadosDeClima(35), data: '2026-11-30 12:00:00' },
    ];

    const resultados = await caso.executar(card.id);

    const seletor = new SeletorDeEstrategia();
    expect(resultados).toHaveLength(2);
    resultados.forEach((r, i) => {
      const esperado = seletor.processar('correr', clima.previsao[i]);
      expect(r.data).toBe(clima.previsao[i].data);
      expect(r.dadosClima).toEqual(clima.previsao[i]);
      expect(r.resultado).toEqual({
        apropriado: esperado.apropriado,
        motivo: esperado.motivo,
      });
    });
  });

  it('lança erro quando o card não existe', async () => {
    const { caso } = await montar();

    await expect(caso.executar('inexistente')).rejects.toThrow(
      'Card não encontrado.',
    );
  });
});
