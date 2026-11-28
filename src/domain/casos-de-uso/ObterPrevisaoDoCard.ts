import type { CardRepository } from '../interfaces/CardRepository';
import type { ProvedorClima } from '../interfaces/ProvedorClima';
import { SeletorDeEstrategia } from '../logica/SeletorDeEstrategia';

/**
 * Busca a previsão futura da cidade de um card e aplica a estratégia da
 * atividade a cada dia.
 */
export class ObterPrevisaoDoCard {
  constructor(
    private readonly clima: ProvedorClima,
    private readonly cards: CardRepository,
    private readonly seletorDeEstrategia: SeletorDeEstrategia = new SeletorDeEstrategia(),
  ) {}

  async executar(id: string) {
    // 1. Achar o card e a atividade
    const card = await this.cards.buscarPorId(id);

    if (!card) {
      throw new Error('Card não encontrado.');
    }

    // 2. Buscar a previsão futura
    const previsoes = await this.clima.buscarPrevisaoFutura(card.cidade);

    // 3. Aplicar a estratégia em cada dia da previsão
    return previsoes.map((dadosDia) => {
      const resultado = this.seletorDeEstrategia.processar(
        card.atividade.chave,
        dadosDia,
      );

      return {
        data: dadosDia.data,
        dadosClima: dadosDia,
        resultado: {
          apropriado: resultado.apropriado,
          motivo: resultado.motivo,
        },
      };
    });
  }
}
