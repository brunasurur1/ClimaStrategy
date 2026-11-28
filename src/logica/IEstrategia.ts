import type { CondicoesClimaticas } from '../interfaces/clima.interfaces';

/**
 * Motivos possíveis para o veredito de uma estratégia.
 *
 * A estratégia devolve apenas o dado (motivo + se é apropriado);
 * a frase e o emoji ficam na camada de apresentação (front).
 */
export type MotivoAvaliacao =
  | 'FAVORAVEL'
  | 'CHUVA_FORTE'
  | 'CALOR_EXCESSIVO'
  | 'FRIO'
  | 'VENTO_FORTE';

/**
 * Resultado estruturado da avaliação de uma estratégia.
 * `apropriado` é sempre derivado do `motivo` (ver `ehApropriado`).
 */
export interface ResultadoAvaliacao {
  apropriado: boolean;
  motivo: MotivoAvaliacao;
}

/**
 * Único ponto que decide se um motivo representa condição apropriada.
 * Apenas `FAVORAVEL` é apropriado; todos os demais motivos não são.
 */
export function ehApropriado(motivo: MotivoAvaliacao): boolean {
  return motivo === 'FAVORAVEL';
}

/**
 * Monta um `ResultadoAvaliacao` derivando `apropriado` do motivo,
 * garantindo que os dois campos nunca fiquem inconsistentes.
 */
export function criarResultado(motivo: MotivoAvaliacao): ResultadoAvaliacao {
  return { apropriado: ehApropriado(motivo), motivo };
}

/**
 * Contrato utilizado pelas estratégias de avaliação climática.
 */
export interface IEstrategia {
  avaliar(clima: CondicoesClimaticas): ResultadoAvaliacao;
}
