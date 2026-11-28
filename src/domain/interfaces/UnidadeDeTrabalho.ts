import type { CardRepository } from './CardRepository';
import type { HistoricoRepository } from './HistoricoRepository';

export interface Repositorios {
  cards: CardRepository;
  historico: HistoricoRepository;
}

/** Executa um bloco de operações em uma única transação. */
export interface UnidadeDeTrabalho {
  executar<T>(operacao: (repos: Repositorios) => Promise<T>): Promise<T>;
}
