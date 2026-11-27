import { describe, it, expect } from 'vitest';
import { TradutorClima } from '../../src/logica/TradutorClima';
import type { CondicoesClimaticas } from '../../src/interfaces/clima.interfaces';

describe('TradutorClima', () => {
  const tradutor = new TradutorClima();

  const climaBase: CondicoesClimaticas = {
    temperatura: 25,
    umidade: 60,
    velocidadeVento: 10,
    probabilidadeChuva: 0,
    data: '2026-11-25',
  };

  const favoravel = { apropriado: true, motivo: 'FAVORAVEL' };

  it('seleciona a estratégia de corrida', () => {
    expect(tradutor.processar('Correr', climaBase)).toEqual(favoravel);
  });

  it('seleciona a estratégia de praia', () => {
    expect(tradutor.processar('Praia', climaBase)).toEqual(favoravel);
  });

  it('seleciona a estratégia de piquenique', () => {
    expect(tradutor.processar('Piquenique', climaBase)).toEqual(favoravel);
  });

  it('reconhece o alias Praia/Piscina', () => {
    expect(tradutor.processar('Praia/Piscina', climaBase)).toEqual(
      tradutor.processar('Praia', climaBase),
    );
  });

  it('retorna motivo de atividade desconhecida para atividade não mapeada', () => {
    expect(tradutor.processar('Futebol', climaBase)).toEqual({
      apropriado: false,
      motivo: 'ATIVIDADE_DESCONHECIDA',
    });
  });

  it('reconhece atividades independentemente de maiúsculas e minúsculas', () => {
    expect(tradutor.processar('CoRrEr', climaBase)).toEqual(favoravel);
  });
});
