import { describe, it, expect } from 'vitest';
import { EstrategiaCorrer } from '../../src/domain/logica/EstrategiasConcretas';
import type { CondicoesClimaticas } from '../../src/domain/interfaces/CondicoesClimaticas';

describe('EstrategiaCorrer', () => {
  const estrategia = new EstrategiaCorrer();

  const climaBase: CondicoesClimaticas = {
    temperatura: 25,
    umidade: 60,
    velocidadeVento: 10,
    probabilidadeChuva: 0,
    data: '2026-11-25',
  };

  const favoravel = { apropriado: true, motivo: 'FAVORAVEL' };
  const alertaChuva = { apropriado: false, motivo: 'CHUVA_FORTE' };
  const alertaCalor = { apropriado: false, motivo: 'CALOR_EXCESSIVO' };

  it('permite correr com 49% de chance de chuva', () => {
    const clima = { ...climaBase, probabilidadeChuva: 49 };

    expect(estrategia.avaliar(clima)).toEqual(favoravel);
  });

  it('permite correr com exatamente 50% de chance de chuva', () => {
    const clima = { ...climaBase, probabilidadeChuva: 50 };

    expect(estrategia.avaliar(clima)).toEqual(favoravel);
  });

  it('recomenda evitar corrida com 51% de chance de chuva', () => {
    const clima = { ...climaBase, probabilidadeChuva: 51 };

    expect(estrategia.avaliar(clima)).toEqual(alertaChuva);
  });

  it('permite correr com temperatura de 29°C', () => {
    const clima = { ...climaBase, temperatura: 29 };

    expect(estrategia.avaliar(clima)).toEqual(favoravel);
  });

  it('permite correr com exatamente 30°C', () => {
    const clima = { ...climaBase, temperatura: 30 };

    expect(estrategia.avaliar(clima)).toEqual(favoravel);
  });

  it('emite alerta de calor com temperatura de 31°C', () => {
    const clima = { ...climaBase, temperatura: 31 };

    expect(estrategia.avaliar(clima)).toEqual(alertaCalor);
  });

  it('prioriza o alerta de chuva sobre o alerta de calor', () => {
    const clima = { ...climaBase, probabilidadeChuva: 51, temperatura: 31 };

    expect(estrategia.avaliar(clima)).toEqual(alertaChuva);
  });
});
