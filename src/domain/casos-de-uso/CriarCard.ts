import type { AtividadeRepository } from '../interfaces/AtividadeRepository';
import type { CardRepository } from '../interfaces/CardRepository';
import type { ProvedorClima } from '../interfaces/ProvedorClima';
import type { UnidadeDeTrabalho } from '../interfaces/UnidadeDeTrabalho';
import { SeletorDeEstrategia } from '../logica/SeletorDeEstrategia';

/**
 * Cria um novo card, buscando o clima e aplicando a estratégia.
 * Substitui um card existente da mesma cidade e atividade.
 */
export class CriarCard {
  constructor(
    private readonly clima: ProvedorClima,
    private readonly atividades: AtividadeRepository,
    private readonly cards: CardRepository,
    private readonly unidadeDeTrabalho: UnidadeDeTrabalho,
    private readonly seletorDeEstrategia: SeletorDeEstrategia = new SeletorDeEstrategia(),
  ) {}

  async executar(cidade: string, atividadeId: string) {
    // 1. Buscar a atividade
    const atividade = await this.atividades.buscarPorId(atividadeId);

    if (!atividade) {
      throw new Error('Atividade não encontrada.');
    }

    // 2. Buscar dados do clima (API Externa)
    const { dados: dadosClima, nomeCidade } =
      await this.clima.buscarClima(cidade);

    // Verificamos se já existe um card igual (mesma cidade e atividade)
    const cardExistente = await this.cards.buscarPorCidadeEAtividade(
      nomeCidade,
      atividadeId,
    );

    // 3. Aplicar a estratégia utilizando a interface climática unificada
    const resultado = this.seletorDeEstrategia.processar(
      atividade.chave,
      dadosClima,
    );

    // 4. Substituir, salvar o Card e o Histórico em uma única Transação.
    //    O remover do card antigo roda DENTRO da transação: se o criar
    //    falhar, o rollback preserva o card antigo.
    return this.unidadeDeTrabalho.executar(async ({ cards, historico }) => {
      if (cardExistente) {
        // Remove o card antigo para que o novo fique no topo da lista
        await cards.remover(cardExistente.id);
      }

      const cardSalvo = await cards.criar({
        cidade: nomeCidade,
        atividadeId: atividadeId,
        temperatura: dadosClima.temperatura,
        umidade: dadosClima.umidade,
        velocidadeVento: dadosClima.velocidadeVento,
        precipitacaoProbabilidade: dadosClima.probabilidadeChuva,
        condicaoAtual: resultado.motivo,
      });

      await historico.registrar({
        operacao: 'CREATE',
        entidade: 'CARD',
        entidadeId: cardSalvo.id,
      });

      return cardSalvo;
    });
  }
}
