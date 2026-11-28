import type { CardRepository } from '../interfaces/CardRepository';

/** Lista todos os cards salvos, do mais recente para o mais antigo. */
export class ListarCards {
  constructor(private readonly cards: CardRepository) {}

  async executar() {
    return this.cards.listar();
  }
}
