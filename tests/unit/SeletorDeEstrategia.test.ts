import { describe, it, expect } from 'vitest';
import { SeletorDeEstrategia } from '../../src/domain/logica/SeletorDeEstrategia';
import { EstrategiaNaoRegistradaError } from '../../src/domain/logica/EstrategiaNaoRegistradaError';
import type { CondicoesClimaticas } from '../../src/domain/interfaces/CondicoesClimaticas';

describe('SeletorDeEstrategia', () => {
  const seletor = new SeletorDeEstrategia();

  const climaBase: CondicoesClimaticas = {
    temperatura: 25,
    umidade: 60,
    velocidadeVento: 10,
    probabilidadeChuva: 0,
    data: '2026-11-25',
  };

  const favoravel = { apropriado: true, motivo: 'FAVORAVEL' };

  it('seleciona a estratégia de corrida pela chave "correr"', () => {
    expect(seletor.processar('correr', climaBase)).toEqual(favoravel);
  });

  it('seleciona a estratégia de praia pela chave "praia"', () => {
    expect(seletor.processar('praia', climaBase)).toEqual(favoravel);
  });

  it('seleciona a estratégia de piquenique pela chave "piquenique"', () => {
    expect(seletor.processar('piquenique', climaBase)).toEqual(favoravel);
  });

  it('aplica a estratégia escolhida ao clima (praia com frio é FRIO)', () => {
    expect(
      seletor.processar('praia', { ...climaBase, temperatura: 18 }),
    ).toEqual({ apropriado: false, motivo: 'FRIO' });
  });

  it('lança EstrategiaNaoRegistradaError para chave não registrada', () => {
    expect(() => seletor.processar('futebol', climaBase)).toThrow(
      EstrategiaNaoRegistradaError,
    );
  });

  it('não reconhece o nome exibido como chave (roteia só por chave)', () => {
    expect(() => seletor.processar('Praia/Piscina', climaBase)).toThrow(
      EstrategiaNaoRegistradaError,
    );
  });
});
