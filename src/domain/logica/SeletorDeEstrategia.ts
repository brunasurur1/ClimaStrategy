import type { IEstrategia, ResultadoAvaliacao } from './IEstrategia';
import type { CondicoesClimaticas } from '../interfaces/CondicoesClimaticas';
import { EstrategiaNaoRegistradaError } from './EstrategiaNaoRegistradaError';

import {
  EstrategiaCorrer,
  EstrategiaPraia,
  EstrategiaPiquenique,
} from './EstrategiasConcretas';

/**
 * Seleciona e aplica a estratégia de avaliação a partir da chave
 * estável da atividade.
 *
 * O roteamento é feito por um registry (Map chave → estratégia),
 * em vez de um switch sobre o nome exibido. Adicionar uma atividade
 * é apenas criar a classe de estratégia e registrá-la aqui — sem
 * tocar em nenhum condicional (Open/Closed).
 */
export class SeletorDeEstrategia {
  private readonly estrategias: Map<string, IEstrategia> = new Map<
    string,
    IEstrategia
  >([
    ['correr', new EstrategiaCorrer()],
    ['praia', new EstrategiaPraia()],
    ['piquenique', new EstrategiaPiquenique()],
  ]);

  /**
   * Avalia o clima aplicando a estratégia registrada para a `chave`.
   * Lança `EstrategiaNaoRegistradaError` se não houver estratégia.
   */
  public processar(
    chave: string,
    clima: CondicoesClimaticas,
  ): ResultadoAvaliacao {
    const estrategia = this.estrategias.get(chave);

    if (!estrategia) {
      throw new EstrategiaNaoRegistradaError(chave);
    }

    return estrategia.avaliar(clima);
  }
}
