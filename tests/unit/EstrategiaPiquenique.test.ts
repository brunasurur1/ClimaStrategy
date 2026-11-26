import { describe, it, expect } from 'vitest';
import { EstrategiaPiquenique } from '../../src/logica/EstrategiasConcretas';
import type { CondicoesClimaticas } from '../../src/interfaces/clima.interfaces';
describe('EstrategiaPiquenique', () => {
  const estrategia = new EstrategiaPiquenique();

  const climaBase: CondicoesClimaticas = {
    temperatura: 25,
    umidade: 60,
    velocidadeVento: 10,
    probabilidadeChuva: 0,
    data: '2026-11-25',
  };

  const climaFavoravel = '🧺 O parque espera por você! Ótimo clima.';

  const alertaVento =
    '🌬️ Vento muito forte! Vai ser difícil segurar as toalhas.';

  const alertaChuva =
    '☔ Risco de chuva. Piquenique em local coberto seria melhor.';

  it('considera favorável o vento de 19 km/h', () => {
    const clima = { ...climaBase, velocidadeVento: 19 };

    expect(estrategia.avaliar(clima)).toBe(climaFavoravel);
  });

  it('considera favorável o vento de exatamente 20 km/h', () => {
    const clima = { ...climaBase, velocidadeVento: 20 };

    expect(estrategia.avaliar(clima)).toBe(climaFavoravel);
  });

  it('emite alerta de vento com 21 km/h', () => {
    const clima = { ...climaBase, velocidadeVento: 21 };

    expect(estrategia.avaliar(clima)).toBe(alertaVento);
  });

  it('considera favorável a chance de chuva de 39%', () => {
    const clima = { ...climaBase, probabilidadeChuva: 39 };

    expect(estrategia.avaliar(clima)).toBe(climaFavoravel);
  });

  it('considera favorável exatamente 40% de chance de chuva', () => {
    const clima = { ...climaBase, probabilidadeChuva: 40 };

    expect(estrategia.avaliar(clima)).toBe(climaFavoravel);
  });

  it('emite alerta com 41% de chance de chuva', () => {
    const clima = { ...climaBase, probabilidadeChuva: 41 };

    expect(estrategia.avaliar(clima)).toBe(alertaChuva);
  });

  it('prioriza o alerta de vento sobre o alerta de chuva', () => {
    const clima = { ...climaBase, velocidadeVento: 21, probabilidadeChuva: 41 };

    expect(estrategia.avaliar(clima)).toBe(alertaVento);
  });
});
