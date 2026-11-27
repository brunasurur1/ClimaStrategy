import { describe, it, expect } from 'vitest';
import {
  ehApropriado,
  criarResultado,
  type MotivoAvaliacao,
} from '../../src/logica/IEstrategia';

describe('ehApropriado', () => {
  it('considera FAVORAVEL como apropriado', () => {
    expect(ehApropriado('FAVORAVEL')).toBe(true);
  });

  const motivosInapropriados: MotivoAvaliacao[] = [
    'CHUVA_FORTE',
    'CALOR_EXCESSIVO',
    'FRIO',
    'VENTO_FORTE',
    'ATIVIDADE_DESCONHECIDA',
  ];

  it.each(motivosInapropriados)(
    'considera %s como não apropriado',
    (motivo) => {
      expect(ehApropriado(motivo)).toBe(false);
    },
  );
});

describe('criarResultado', () => {
  it('deriva apropriado=true para FAVORAVEL', () => {
    expect(criarResultado('FAVORAVEL')).toEqual({
      apropriado: true,
      motivo: 'FAVORAVEL',
    });
  });

  it('deriva apropriado=false para um motivo de alerta', () => {
    expect(criarResultado('CHUVA_FORTE')).toEqual({
      apropriado: false,
      motivo: 'CHUVA_FORTE',
    });
  });
});
