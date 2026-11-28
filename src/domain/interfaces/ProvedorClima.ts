import type { CondicoesClimaticas } from './CondicoesClimaticas';

/** Resultado de uma busca de clima: os dados e o nome oficial da cidade. */
export interface ClimaDaCidade {
  dados: CondicoesClimaticas;
  nomeCidade: string;
}

/** Contrato para qualquer fonte de dados climáticos. */
export interface ProvedorClima {
  buscarClima(cidade: string): Promise<ClimaDaCidade>;
  buscarPrevisaoFutura(cidade: string): Promise<CondicoesClimaticas[]>;
}
