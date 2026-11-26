import { describe, it, expect } from 'vitest';
import { EstrategiaCorrer } from '../../src/logica/EstrategiasConcretas';
import type { CondicoesClimaticas } from '../../src/interfaces/clima.interfaces';

describe('EstrategiaCorrer', () => {
  const estrategia = new EstrategiaCorrer();

  const climaBase: CondicoesClimaticas = {
    temperatura: 25,
    umidade: 60,
    velocidadeVento: 10,
    probabilidadeChuva: 0,
    data: '2026-11-25',
  };

  const climaFavoravel = '🏃‍♂️ Clima perfeito para sua corrida! Aproveite.';

  const alertaChuva =
    '🌧️ Melhor evitar: Alta chance de chuva e pista escorregadia.';

  const alertaCalor =
    '🥵 Atenção: Calor excessivo! Hidrate-se muito ou corra na esteira.';

  it('permite correr com 49% de chance de chuva', () => {
    const clima = { ...climaBase, probabilidadeChuva: 49 };

    expect(estrategia.avaliar(clima)).toBe(climaFavoravel);
  });

  it('permite correr com exatamente 50% de chance de chuva', () => {
    const clima = { ...climaBase, probabilidadeChuva: 50 };

    expect(estrategia.avaliar(clima)).toBe(climaFavoravel);
  });

  it('recomenda evitar corrida com 51% de chance de chuva', () => {
    const clima = { ...climaBase, probabilidadeChuva: 51 };

    expect(estrategia.avaliar(clima)).toBe(alertaChuva);
  });

  it('permite correr com temperatura de 29°C', () => {
    const clima = { ...climaBase, temperatura: 29 };

    expect(estrategia.avaliar(clima)).toBe(climaFavoravel);
  });

  it('permite correr com exatamente 30°C', () => {
    const clima = { ...climaBase, temperatura: 30 };

    expect(estrategia.avaliar(clima)).toBe(climaFavoravel);
  });

  it('emite alerta de calor com temperatura de 31°C', () => {
    const clima = { ...climaBase, temperatura: 31 };

    expect(estrategia.avaliar(clima)).toBe(alertaCalor);
  });

  it('prioriza o alerta de chuva sobre o alerta de calor', () => {
    const clima = { ...climaBase, probabilidadeChuva: 51, temperatura: 31 };

    expect(estrategia.avaliar(clima)).toBe(alertaChuva);
  });
});
