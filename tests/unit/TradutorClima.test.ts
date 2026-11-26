import { describe, it, expect } from 'vitest';
import { TradutorClima } from '../../src/logica/TradutorClima';
import type { DadosClima } from '../../src/logica/IEstrategia';

describe('TradutorClima', () => {
  const tradutor = new TradutorClima();

  const climaBase: DadosClima = {
    temp: 25,
    umidade: 60,
    vento: 10,
    chuva: 0,
    data: '2026-11-25',
  };

  it('seleciona a estratégia de corrida', () => {
    expect(tradutor.processar('Correr', climaBase)).toBe(
      '🏃‍♂️ Clima perfeito para sua corrida! Aproveite.',
    );
  });

  it('seleciona a estratégia de praia', () => {
    expect(tradutor.processar('Praia', climaBase)).toBe(
      '🏖️ Dia lindo! Não esqueça o protetor solar.',
    );
  });

  it('seleciona a estratégia de piquenique', () => {
    expect(tradutor.processar('Piquenique', climaBase)).toBe(
      '🧺 O parque espera por você! Ótimo clima.',
    );
  });

  it('reconhece o alias Praia/Piscina', () => {
    expect(tradutor.processar('Praia/Piscina', climaBase)).toBe(
      tradutor.processar('Praia', climaBase),
    );
  });

  it('retorna uma mensagem para atividade desconhecida', () => {
    expect(tradutor.processar('Futebol', climaBase)).toBe(
      'Atividade não reconhecida no sistema.',
    );
  });

  it('reconhece atividades independentemente de maiúsculas e minúsculas', () => {
    expect(tradutor.processar('CoRrEr', climaBase)).toBe(
      '🏃‍♂️ Clima perfeito para sua corrida! Aproveite.',
    );
  });
});
