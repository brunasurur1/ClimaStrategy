import { describe, expect, it } from 'vitest';
import { CriarCard } from '../../src/domain/casos-de-uso/CriarCard';
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
  const caso = new CriarCard(clima, atividades, cards, unidade);
  return { caso, clima, cards, historico };
}

describe('CriarCard', () => {
  it('cria o card com os dados do clima, aplica a estratégia e registra o histórico com o id real', async () => {
    const { caso, clima, cards, historico } = montar();
    clima.clima = { dados: dadosDeClima(22), nomeCidade: 'Campinas' };

    const card = await caso.executar('campinas', 'a1');

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
      entidadeId: card.id,
    });
  });

  it('lança erro quando a atividade não existe, sem consultar o clima', async () => {
    const { caso, clima } = montar();

    await expect(caso.executar('Campinas', 'inexistente')).rejects.toThrow(
      'Atividade não encontrada.',
    );
    expect(clima.cidadesConsultadas).toHaveLength(0);
  });

  it('substitui o card repetido (mesma cidade e atividade)', async () => {
    const { caso, cards } = montar();

    const primeiro = await caso.executar('São Paulo', 'a1');
    const segundo = await caso.executar('São Paulo', 'a1');

    const todos = await cards.listar();
    expect(todos).toHaveLength(1);
    expect(todos[0].id).toBe(segundo.id);
    expect(segundo.id).not.toBe(primeiro.id);
  });

  it('não grava card nem histórico quando o clima falha', async () => {
    const { caso, clima, cards, historico } = montar();
    clima.erro = new Error('OpenWeather fora do ar');

    await expect(caso.executar('Campinas', 'a1')).rejects.toThrow(
      'OpenWeather fora do ar',
    );
    expect(await cards.listar()).toHaveLength(0);
    expect(historico.entradas).toHaveLength(0);
  });

  it('preserva o card antigo quando a recriação falha (rollback)', async () => {
    const { caso, cards, historico } = montar();

    const antigo = await caso.executar('São Paulo', 'a1');
    const historicoAposCriar = historico.entradas.length;

    // Força a falha no create da substituição, depois que o remover já rodou.
    const criarOriginal = cards.criar.bind(cards);
    let primeiraChamada = true;
    cards.criar = async (dados) => {
      if (primeiraChamada) {
        primeiraChamada = false;
        throw new Error('falha ao recriar o card');
      }
      return criarOriginal(dados);
    };

    await expect(caso.executar('São Paulo', 'a1')).rejects.toThrow(
      'falha ao recriar o card',
    );

    const todos = await cards.listar();
    expect(todos).toHaveLength(1);
    expect(todos[0].id).toBe(antigo.id);
    expect(historico.entradas).toHaveLength(historicoAposCriar);
  });
});
