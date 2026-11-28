import { describe, it, expect } from 'vitest';
import { EstrategiaPiquenique } from '../../src/domain/logica/EstrategiasConcretas';
import type { CondicoesClimaticas } from '../../src/domain/interfaces/clima.interfaces';

describe('EstrategiaPiquenique', () => {
  const estrategia = new EstrategiaPiquenique();

  const climaBase: CondicoesClimaticas = {
    temperatura: 25,
    umidade: 60,
    velocidadeVento: 10,
    probabilidadeChuva: 0,
    data: '2026-11-25',
  };

  const favoravel = { apropriado: true, motivo: 'FAVORAVEL' };
  const alertaVento = { apropriado: false, motivo: 'VENTO_FORTE' };
  const alertaChuva = { apropriado: false, motivo: 'CHUVA_FORTE' };

  it('considera favorável o vento de 19 km/h', () => {
    const clima = { ...climaBase, velocidadeVento: 19 };

    expect(estrategia.avaliar(clima)).toEqual(favoravel);
  });

  it('considera favorável o vento de exatamente 20 km/h', () => {
    const clima = { ...climaBase, velocidadeVento: 20 };

    expect(estrategia.avaliar(clima)).toEqual(favoravel);
  });

  it('emite alerta de vento com 21 km/h', () => {
    const clima = { ...climaBase, velocidadeVento: 21 };

    expect(estrategia.avaliar(clima)).toEqual(alertaVento);
  });

  it('considera favorável a chance de chuva de 39%', () => {
    const clima = { ...climaBase, probabilidadeChuva: 39 };

    expect(estrategia.avaliar(clima)).toEqual(favoravel);
  });

  it('considera favorável exatamente 40% de chance de chuva', () => {
    const clima = { ...climaBase, probabilidadeChuva: 40 };

    expect(estrategia.avaliar(clima)).toEqual(favoravel);
  });

  it('emite alerta com 41% de chance de chuva', () => {
    const clima = { ...climaBase, probabilidadeChuva: 41 };

    expect(estrategia.avaliar(clima)).toEqual(alertaChuva);
  });

  it('prioriza o alerta de vento sobre o alerta de chuva', () => {
    const clima = { ...climaBase, velocidadeVento: 21, probabilidadeChuva: 41 };

    expect(estrategia.avaliar(clima)).toEqual(alertaVento);
  });
});
