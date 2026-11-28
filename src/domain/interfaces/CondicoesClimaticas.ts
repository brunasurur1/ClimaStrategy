/**
 * Representa as condições climáticas utilizadas
 * pelos serviços e pelas estratégias de avaliação.
 */
export interface CondicoesClimaticas {
  /** Temperatura em graus Celsius (°C). */
  temperatura: number;

  /** Umidade relativa do ar em porcentagem (0-100). */
  umidade: number;

  /** Velocidade do vento em quilômetros por hora (km/h). */
  velocidadeVento: number;

  /** Probabilidade de precipitação em porcentagem (0-100). */
  probabilidadeChuva: number;

  /** Data da previsão, quando disponível. */
  data?: string;
}

export interface ClimaDaCidade {
  dados: CondicoesClimaticas;
  nomeCidade: string;
}

export interface ProvedorClima {
  buscarClima(cidade: string): Promise<ClimaDaCidade>;
  buscarPrevisaoFutura(cidade: string): Promise<CondicoesClimaticas[]>;
}
