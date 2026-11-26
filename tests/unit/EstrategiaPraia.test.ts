import { describe, it, expect } from 'vitest';
import { EstrategiaPraia } from '../../src/logica/EstrategiasConcretas';
import type { CondicoesClimaticas } from '../../src/interfaces/clima.interfaces';

describe('EstrategiaPraia', () => {
  const estrategia = new EstrategiaPraia();

  const climaBase: CondicoesClimaticas = {
    temperatura: 25,
    umidade: 60,
    velocidadeVento: 10,
    probabilidadeChuva: 0,
    data: '2026-11-25',
  };

  const climaFavoravel = '🏖️ Dia lindo! Não esqueça o protetor solar.';

  const alertaFrio = '🥶 Está um pouco frio para pegar sol/mar hoje.';

  const alertaChuva = '☁️ O tempo está fechando. Risco de perder a viagem.';

  it('emite alerta de frio com temperatura de 22°C', () => {
    const clima = { ...climaBase, temperatura: 22 };

    expect(estrategia.avaliar(clima)).toBe(alertaFrio);
  });

  it('considera favorável a temperatura de exatamente 23°C', () => {
    const clima = { ...climaBase, temperatura: 23 };

    expect(estrategia.avaliar(clima)).toBe(climaFavoravel);
  });

  it('considera favorável a temperatura de 24°C', () => {
    const clima = { ...climaBase, temperatura: 24 };

    expect(estrategia.avaliar(clima)).toBe(climaFavoravel);
  });

  it('considera favorável a chance de chuva de 29%', () => {
    const clima = { ...climaBase, probabilidadeChuva: 29 };

    expect(estrategia.avaliar(clima)).toBe(climaFavoravel);
  });

  it('considera favorável exatamente 30% de chance de chuva', () => {
    const clima = { ...climaBase, probabilidadeChuva: 30 };

    expect(estrategia.avaliar(clima)).toBe(climaFavoravel);
  });

  it('emite alerta com 31% de chance de chuva', () => {
    const clima = { ...climaBase, probabilidadeChuva: 31 };

    expect(estrategia.avaliar(clima)).toBe(alertaChuva);
  });

  it('prioriza o alerta de frio sobre o alerta de chuva', () => {
    const clima = { ...climaBase, temperatura: 22, probabilidadeChuva: 31 };

    expect(estrategia.avaliar(clima)).toBe(alertaFrio);
  });
});
