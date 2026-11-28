import { criarResultado } from './IEstrategia';
import type { IEstrategia, ResultadoAvaliacao } from './IEstrategia';
import type { CondicoesClimaticas } from '../interfaces/CondicoesClimaticas';

/**
 * Limites de cada atividade (antes eram números mágicos).
 * Unidades: temperatura em °C, vento em km/h, chuva em % (0-100).
 */
const CORRER_CHUVA_MAX = 50;
const CORRER_TEMP_MAX = 30;

const PRAIA_TEMP_MIN = 23;
const PRAIA_CHUVA_MAX = 30;

const PIQUENIQUE_VENTO_MAX = 20;
const PIQUENIQUE_CHUVA_MAX = 40;

export class EstrategiaCorrer implements IEstrategia {
  avaliar(clima: CondicoesClimaticas): ResultadoAvaliacao {
    if (clima.probabilidadeChuva > CORRER_CHUVA_MAX) {
      return criarResultado('CHUVA_FORTE');
    }

    if (clima.temperatura > CORRER_TEMP_MAX) {
      return criarResultado('CALOR_EXCESSIVO');
    }

    return criarResultado('FAVORAVEL');
  }
}

export class EstrategiaPraia implements IEstrategia {
  avaliar(clima: CondicoesClimaticas): ResultadoAvaliacao {
    if (clima.temperatura < PRAIA_TEMP_MIN) {
      return criarResultado('FRIO');
    }

    if (clima.probabilidadeChuva > PRAIA_CHUVA_MAX) {
      return criarResultado('CHUVA_FORTE');
    }

    return criarResultado('FAVORAVEL');
  }
}

export class EstrategiaPiquenique implements IEstrategia {
  avaliar(clima: CondicoesClimaticas): ResultadoAvaliacao {
    if (clima.velocidadeVento > PIQUENIQUE_VENTO_MAX) {
      return criarResultado('VENTO_FORTE');
    }

    if (clima.probabilidadeChuva > PIQUENIQUE_CHUVA_MAX) {
      return criarResultado('CHUVA_FORTE');
    }

    return criarResultado('FAVORAVEL');
  }
}
