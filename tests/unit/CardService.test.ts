import { describe, expect, it } from 'vitest';
import { CardService } from '../../src/domain/CardService';
import type { CondicoesClimaticas } from '../../src/domain/interfaces/CondicoesClimaticas';
import { SeletorDeEstrategia } from '../../src/domain/logica/SeletorDeEstrategia';
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
  const service = new CardService(clima, atividades, cards, unidade);
  return { service, clima, cards, historico };
}

describe('CardService.criarCard', () => {
  it('cria o card com os dados do clima, aplica a estratégia e registra o histórico', async () => {
    const { service, clima, cards, historico } = montar();
    clima.clima = { dados: dadosDeClima(22), nomeCidade: 'Campinas' };

    const card = await service.criarCard('campinas', 'a1');

    expect(card).toMatchObject({
      cidade: 'Campinas',
      atividadeId: 'a1',
      temperatura: 22,
      umidade: 50,
      velocidadeVento: 10,
      precipitacaoProbabilidade: 0,
    });
    const esperado = new SeletorDeEstrategia().processar(
      'correr',
      clima.clima.dados,
    );
    expect(card.condicaoAtual).toBe(esperado.motivo);
    expect(await cards.listar()).toHaveLength(1);
    expect(historico.entradas).toHaveLength(1);
    expect(historico.entradas[0]).toMatchObject({
      operacao: 'CREATE',
      entidade: 'CARD',
    });
  });

  it('lança erro quando a atividade não existe, sem consultar o clima', async () => {
    const { service, clima } = montar();

    await expect(service.criarCard('Campinas', 'inexistente')).rejects.toThrow(
      'Atividade não encontrada.',
    );
    expect(clima.cidadesConsultadas).toHaveLength(0);
  });

  it('substitui o card repetido (mesma cidade e atividade)', async () => {
    const { service, cards } = montar();

    const primeiro = await service.criarCard('São Paulo', 'a1');
    const segundo = await service.criarCard('São Paulo', 'a1');

    const todos = await cards.listar();
    expect(todos).toHaveLength(1);
    expect(todos[0].id).toBe(segundo.id);
    expect(segundo.id).not.toBe(primeiro.id);
  });

  it('não grava card nem histórico quando o clima falha', async () => {
    const { service, clima, cards, historico } = montar();
    clima.erro = new Error('OpenWeather fora do ar');

    await expect(service.criarCard('Campinas', 'a1')).rejects.toThrow(
      'OpenWeather fora do ar',
    );
    expect(await cards.listar()).toHaveLength(0);
    expect(historico.entradas).toHaveLength(0);
  });
});

describe('CardService.listarCards e listarAtividades', () => {
  it('lista os cards com a atividade, do mais recente para o mais antigo', async () => {
    const { service, clima } = montar();
    clima.clima = { dados: dadosDeClima(20), nomeCidade: 'A' };
    await service.criarCard('A', 'a1');
    clima.clima = { dados: dadosDeClima(25), nomeCidade: 'B' };
    await service.criarCard('B', 'a1');

    const lista = await service.listarCards();

    expect(lista.map((c) => c.cidade)).toEqual(['B', 'A']);
    expect(lista[0].atividade.chave).toBe('correr');
  });

  it('lista as atividades disponíveis', async () => {
    const { service } = montar();

    expect(await service.listarAtividades()).toEqual([
      { id: 'a1', nome: 'Correr', chave: 'correr' },
    ]);
  });
});

describe('CardService.obterPrevisaoParaCard', () => {
  it('aplica a estratégia da atividade em cada dia da previsão', async () => {
    const { service, clima } = montar();
    const card = await service.criarCard('São Paulo', 'a1');
    clima.previsao = [
      { ...dadosDeClima(20), data: '2026-11-29 12:00:00' },
      { ...dadosDeClima(35), data: '2026-11-30 12:00:00' },
    ];

    const resultados = await service.obterPrevisaoParaCard(card.id);

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
    const { service } = montar();

    await expect(service.obterPrevisaoParaCard('x')).rejects.toThrow(
      'Card não encontrado.',
    );
  });
});

describe('CardService.atualizarCard', () => {
  it('atualiza os dados do clima e registra UPDATE no histórico', async () => {
    const { service, clima, historico } = montar();
    const card = await service.criarCard('Campinas', 'a1');
    clima.clima = { dados: dadosDeClima(30), nomeCidade: 'Campinas' };

    const atualizado = await service.atualizarCard(card.id);

    expect(atualizado.temperatura).toBe(30);
    expect(historico.entradas[1]).toEqual({
      operacao: 'UPDATE',
      entidade: 'CARD',
      entidadeId: card.id,
    });
  });

  it('lança erro quando o card não existe', async () => {
    const { service } = montar();

    await expect(service.atualizarCard('x')).rejects.toThrow(
      'Card não encontrado.',
    );
  });
});

describe('CardService.deletarCard', () => {
  it('remove o card e registra DELETE no histórico', async () => {
    const { service, cards, historico } = montar();
    const card = await service.criarCard('Campinas', 'a1');

    await service.deletarCard(card.id);

    expect(await cards.listar()).toHaveLength(0);
    expect(historico.entradas[1]).toEqual({
      operacao: 'DELETE',
      entidade: 'CARD',
      entidadeId: card.id,
    });
  });

  it('não registra histórico ao tentar excluir um card inexistente', async () => {
    const { service, historico } = montar();

    await expect(service.deletarCard('x')).rejects.toThrow();
    expect(historico.entradas).toHaveLength(0);
  });
});
