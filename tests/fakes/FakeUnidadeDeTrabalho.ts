import type {
  Repositorios,
  UnidadeDeTrabalho,
} from '../../src/domain/interfaces/UnidadeDeTrabalho';
import type { InMemoryCardRepository } from './InMemoryCardRepository';
import type { InMemoryHistoricoRepository } from './InMemoryHistoricoRepository';

interface RepositoriosTransacionais extends Repositorios {
  cards: InMemoryCardRepository;
  historico: InMemoryHistoricoRepository;
}

/**
 * Simula a semântica transacional "tudo ou nada": captura o estado dos
 * repositórios in-memory antes de executar o bloco e, se ele lançar erro,
 * restaura o estado (rollback) antes de relançar.
 */
export class FakeUnidadeDeTrabalho implements UnidadeDeTrabalho {
  constructor(private readonly repositorios: RepositoriosTransacionais) {}

  async executar<T>(
    operacao: (repos: Repositorios) => Promise<T>,
  ): Promise<T> {
    const cardsSnapshot = this.repositorios.cards.snapshot();
    const historicoSnapshot = this.repositorios.historico.snapshot();

    try {
      return await operacao(this.repositorios);
    } catch (erro) {
      this.repositorios.cards.restaurar(cardsSnapshot);
      this.repositorios.historico.restaurar(historicoSnapshot);
      throw erro;
    }
  }
}
