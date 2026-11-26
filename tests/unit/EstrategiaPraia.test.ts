import { describe, it, expect } from 'vitest';
import { EstrategiaPraia } from '../../src/logica/EstrategiasConcretas';
import type { DadosClima } from '../../src/logica/IEstrategia';

describe('EstrategiaPraia', () => {
  const estrategia = new EstrategiaPraia();

  const climaBase: DadosClima = {
    temp: 25,
    umidade: 60,
    vento: 10,
    chuva: 0,
    data: '2026-11-25',
  };

  const climaFavoravel = '🏖️ Dia lindo! Não esqueça o protetor solar.';

  const alertaFrio = '🥶 Está um pouco frio para pegar sol/mar hoje.';

  const alertaChuva = '☁️ O tempo está fechando. Risco de perder a viagem.';

  it('emite alerta de frio com temperatura de 22°C', () => {
    const clima = { ...climaBase, temp: 22 };

    expect(estrategia.avaliar(clima)).toBe(alertaFrio);
  });

  it('considera favorável a temperatura de exatamente 23°C', () => {
    const clima = { ...climaBase, temp: 23 };

    expect(estrategia.avaliar(clima)).toBe(climaFavoravel);
  });

  it('considera favorável a temperatura de 24°C', () => {
    const clima = { ...climaBase, temp: 24 };

    expect(estrategia.avaliar(clima)).toBe(climaFavoravel);
  });

  it('considera favorável a chance de chuva de 29%', () => {
    const clima = { ...climaBase, chuva: 29 };

    expect(estrategia.avaliar(clima)).toBe(climaFavoravel);
  });

  it('considera favorável exatamente 30% de chance de chuva', () => {
    const clima = { ...climaBase, chuva: 30 };

    expect(estrategia.avaliar(clima)).toBe(climaFavoravel);
  });

  it('emite alerta com 31% de chance de chuva', () => {
    const clima = { ...climaBase, chuva: 31 };

    expect(estrategia.avaliar(clima)).toBe(alertaChuva);
  });

  it('prioriza o alerta de frio sobre o alerta de chuva', () => {
    const clima = { ...climaBase, temp: 22, chuva: 31 };

    expect(estrategia.avaliar(clima)).toBe(alertaFrio);
  });
});
