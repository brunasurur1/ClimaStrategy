import { describe, it, expect } from 'vitest';
import { EstrategiaPraia } from '../../src/domain/logica/EstrategiasConcretas';
import type { CondicoesClimaticas } from '../../src/domain/interfaces/CondicoesClimaticas';

describe('EstrategiaPraia', () => {
  const estrategia = new EstrategiaPraia();

  const climaBase: CondicoesClimaticas = {
    temperatura: 25,
    umidade: 60,
    velocidadeVento: 10,
    probabilidadeChuva: 0,
    data: '2026-11-25',
  };

  const favoravel = { apropriado: true, motivo: 'FAVORAVEL' };
  const alertaFrio = { apropriado: false, motivo: 'FRIO' };
  const alertaChuva = { apropriado: false, motivo: 'CHUVA_FORTE' };

  it('emite alerta de frio com temperatura de 22°C', () => {
    const clima = { ...climaBase, temperatura: 22 };

    expect(estrategia.avaliar(clima)).toEqual(alertaFrio);
  });

  it('considera favorável a temperatura de exatamente 23°C', () => {
    const clima = { ...climaBase, temperatura: 23 };

    expect(estrategia.avaliar(clima)).toEqual(favoravel);
  });

  it('considera favorável a temperatura de 24°C', () => {
    const clima = { ...climaBase, temperatura: 24 };

    expect(estrategia.avaliar(clima)).toEqual(favoravel);
  });

  it('considera favorável a chance de chuva de 29%', () => {
    const clima = { ...climaBase, probabilidadeChuva: 29 };

    expect(estrategia.avaliar(clima)).toEqual(favoravel);
  });

  it('considera favorável exatamente 30% de chance de chuva', () => {
    const clima = { ...climaBase, probabilidadeChuva: 30 };

    expect(estrategia.avaliar(clima)).toEqual(favoravel);
  });

  it('emite alerta com 31% de chance de chuva', () => {
    const clima = { ...climaBase, probabilidadeChuva: 31 };

    expect(estrategia.avaliar(clima)).toEqual(alertaChuva);
  });

  it('prioriza o alerta de frio sobre o alerta de chuva', () => {
    const clima = { ...climaBase, temperatura: 22, probabilidadeChuva: 31 };

    expect(estrategia.avaliar(clima)).toEqual(alertaFrio);
  });
});
