import type { IEstrategia, ResultadoAvaliacao } from './IEstrategia';
import type { CondicoesClimaticas } from '../interfaces/clima.interfaces';
import { EstrategiaNaoRegistradaError } from './EstrategiaNaoRegistradaError';

import {
  EstrategiaCorrer,
  EstrategiaPraia,
  EstrategiaPiquenique,
} from './EstrategiasConcretas';

export class TradutorClima {
  public processar(
    atividade: string,
    clima: CondicoesClimaticas,
  ): ResultadoAvaliacao {
    let estrategia: IEstrategia;

    switch (atividade.toLowerCase()) {
      case 'correr':
        estrategia = new EstrategiaCorrer();
        break;

      case 'praia':
      case 'praia/piscina':
        estrategia = new EstrategiaPraia();
        break;

      case 'piquenique':
        estrategia = new EstrategiaPiquenique();
        break;

      default:
        throw new EstrategiaNaoRegistradaError(atividade);
    }

    return estrategia.avaliar(clima);
  }
}
