import { describe, it, expect } from 'vitest';
import { EstrategiaPiquenique } from '../../src/logica/EstrategiasConcretas';
import type { DadosClima } from '../../src/logica/IEstrategia';

describe('EstrategiaPiquenique', () => {
  const estrategia = new EstrategiaPiquenique();

  const climaBase: DadosClima = {
    temp: 25,
    umidade: 60,
    vento: 10,
    chuva: 0,
    data: '2026-11-25',
  };

  const climaFavoravel = '🧺 O parque espera por você! Ótimo clima.';

  const alertaVento =
    '🌬️ Vento muito forte! Vai ser difícil segurar as toalhas.';

  const alertaChuva =
    '☔ Risco de chuva. Piquenique em local coberto seria melhor.';

  it('considera favorável o vento de 19 km/h', () => {
    const clima = { ...climaBase, vento: 19 };

    expect(estrategia.avaliar(clima)).toBe(climaFavoravel);
  });

  it('considera favorável o vento de exatamente 20 km/h', () => {
    const clima = { ...climaBase, vento: 20 };

    expect(estrategia.avaliar(clima)).toBe(climaFavoravel);
  });

  it('emite alerta de vento com 21 km/h', () => {
    const clima = { ...climaBase, vento: 21 };

    expect(estrategia.avaliar(clima)).toBe(alertaVento);
  });

  it('considera favorável a chance de chuva de 39%', () => {
    const clima = { ...climaBase, chuva: 39 };

    expect(estrategia.avaliar(clima)).toBe(climaFavoravel);
  });

  it('considera favorável exatamente 40% de chance de chuva', () => {
    const clima = { ...climaBase, chuva: 40 };

    expect(estrategia.avaliar(clima)).toBe(climaFavoravel);
  });

  it('emite alerta com 41% de chance de chuva', () => {
    const clima = { ...climaBase, chuva: 41 };

    expect(estrategia.avaliar(clima)).toBe(alertaChuva);
  });

  it('prioriza o alerta de vento sobre o alerta de chuva', () => {
    const clima = { ...climaBase, vento: 21, chuva: 41 };

    expect(estrategia.avaliar(clima)).toBe(alertaVento);
  });
});
