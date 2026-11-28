import { describe, expect, it } from 'vitest';
import { AtualizarCard } from '../../src/domain/casos-de-uso/AtualizarCard';
import { CriarCard } from '../../src/domain/casos-de-uso/CriarCard';
import type { CondicoesClimaticas } from '../../src/domain/interfaces/CondicoesClimaticas';
import { FakeProvedorClima } from '../fakes/FakeProvedorClima';
import { FakeUnidadeDeTrabalho } from '../fakes/FakeUnidadeDeTrabalho';
import { InMemoryAtividadeRepository } from '../fakes/InMemoryAtividadeRepository';
import { InMemoryCardRepository } from '../fakes/InMemoryCardRepository';
import { InMemoryHistoricoRepository } from '../fakes/InMemoryHistoricoRepository';

function dadosDeClima(temperatura: number): CondicoesClimaticas {
  return {
    temperatura,
    umidade: 50,
    velocidadeVento: 10,
    probabilidadeChuva: 0,
  };
}

function montar() {
  const atividades = new InMemoryAtividadeRepository([
    { id: 'a1', nome: 'Correr', chave: 'correr' },
  ]);
  const cards = new InMemoryCardRepository(atividades);
  const historico = new InMemoryHistoricoRepository();
  const clima = new FakeProvedorClima();
  const unidade = new FakeUnidadeDeTrabalho({ cards, historico });
  const criar = new CriarCard(clima, atividades, cards, unidade);
  const atualizar = new AtualizarCard(clima, cards, unidade);
  return { criar, atualizar, clima, historico };
}

describe('AtualizarCard', () => {
  it('atualiza os dados do clima e registra UPDATE no histórico', async () => {
    const { criar, atualizar, clima, historico } = montar();
    const card = await criar.executar('Campinas', 'a1');
    clima.clima = { dados: dadosDeClima(30), nomeCidade: 'Campinas' };

    const atualizado = await atualizar.executar(card.id);

    expect(atualizado.temperatura).toBe(30);
    expect(historico.entradas[1]).toEqual({
      operacao: 'UPDATE',
      entidade: 'CARD',
      entidadeId: card.id,
    });
  });

  it('lança erro quando o card não existe', async () => {
    const { atualizar } = montar();

    await expect(atualizar.executar('x')).rejects.toThrow(
      'Card não encontrado.',
    );
  });
});
