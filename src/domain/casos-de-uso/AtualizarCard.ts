import type { CardRepository } from '../interfaces/CardRepository';
import type { ProvedorClima } from '../interfaces/ProvedorClima';
import type { UnidadeDeTrabalho } from '../interfaces/UnidadeDeTrabalho';
import { SeletorDeEstrategia } from '../logica/SeletorDeEstrategia';

/** Atualiza um card existente com novos dados do clima. */
export class AtualizarCard {
  constructor(
    private readonly clima: ProvedorClima,
    private readonly cards: CardRepository,
    private readonly unidadeDeTrabalho: UnidadeDeTrabalho,
    private readonly seletorDeEstrategia: SeletorDeEstrategia = new SeletorDeEstrategia(),
  ) {}

  async executar(id: string) {
    // 1. Encontra o card e a atividade
    const cardAtual = await this.cards.buscarPorId(id);

    if (!cardAtual) {
      throw new Error('Card não encontrado.');
    }

    // 2. Busca o clima atualizado
    const { dados: dadosClima, nomeCidade } = await this.clima.buscarClima(
      cardAtual.cidade,
    );

    // 3. Faz a avaliação utilizando a interface climática unificada
    const resultado = this.seletorDeEstrategia.processar(
      cardAtual.atividade.chave,
      dadosClima,
    );

    // 4. Atualiza o Card e loga no Histórico em uma única transação
    return this.unidadeDeTrabalho.executar(async ({ cards, historico }) => {
      const cardAtualizado = await cards.atualizar(id, {
        cidade: nomeCidade,
        temperatura: dadosClima.temperatura,
        umidade: dadosClima.umidade,
        velocidadeVento: dadosClima.velocidadeVento,
        precipitacaoProbabilidade: dadosClima.probabilidadeChuva,
        condicaoAtual: resultado.motivo,
      });

      await historico.registrar({
        operacao: 'UPDATE',
        entidade: 'CARD',
        entidadeId: id,
      });

      return cardAtualizado;
    });
  }
}
