import type { CondicoesClimaticas } from '../interfaces/clima.interfaces';

/**
 * Contrato utilizado pelas estratégias de avaliação climática.
 */
export interface IEstrategia {
  avaliar(clima: CondicoesClimaticas): string;
}
