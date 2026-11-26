import type { IEstrategia } from './IEstrategia';
import type { CondicoesClimaticas } from '../interfaces/clima.interfaces';

import {
  EstrategiaCorrer,
  EstrategiaPraia,
  EstrategiaPiquenique,
} from './EstrategiasConcretas';

export class TradutorClima {
  public processar(atividade: string, clima: CondicoesClimaticas): string {
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
        return 'Atividade não reconhecida no sistema.';
    }

    return estrategia.avaliar(clima);
  }
}
