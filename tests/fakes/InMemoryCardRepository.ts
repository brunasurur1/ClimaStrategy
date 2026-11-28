import type {
  Card,
  CardComAtividade,
  CardRepository,
  DadosDoCard,
} from '../../src/domain/interfaces/CardRepository';
import type { InMemoryAtividadeRepository } from './InMemoryAtividadeRepository';

export class InMemoryCardRepository implements CardRepository {
  private cards = new Map<string, Card>();
  private sequencia = 0;

  constructor(private readonly atividades: InMemoryAtividadeRepository) {}

  /** Captura o estado atual para permitir rollback nos testes. */
  snapshot(): Map<string, Card> {
    return new Map(this.cards);
  }

  /** Restaura o estado capturado por {@link snapshot}. */
  restaurar(estado: Map<string, Card>): void {
    this.cards = new Map(estado);
  }

  async criar(dados: DadosDoCard): Promise<Card> {
    this.sequencia += 1;
    const card: Card = {
      ...dados,
      id: `card-${this.sequencia}`,
      createdAt: new Date(),
    };
    this.cards.set(card.id, card);
    return card;
  }

  async atualizar(
    id: string,
    dados: Omit<DadosDoCard, 'atividadeId'>,
  ): Promise<Card> {
    const atual = this.cards.get(id);
    if (!atual) throw new Error('Card não encontrado.');
    const atualizado: Card = { ...atual, ...dados };
    this.cards.set(id, atualizado);
    return atualizado;
  }

  async remover(id: string): Promise<void> {
    if (!this.cards.delete(id)) throw new Error('Card não encontrado.');
  }

  async buscarPorId(id: string): Promise<CardComAtividade | null> {
    const card = this.cards.get(id);
    return card ? this.comAtividade(card) : null;
  }

  async buscarPorCidadeEAtividade(
    cidade: string,
    atividadeId: string,
  ): Promise<Card | null> {
    return (
      [...this.cards.values()].find(
        (c) => c.cidade === cidade && c.atividadeId === atividadeId,
      ) ?? null
    );
  }

  async listar(): Promise<CardComAtividade[]> {
    // Mais recentes primeiro (ordem inversa de inserção)
    const todos = [...this.cards.values()].reverse();
    return Promise.all(todos.map((card) => this.comAtividade(card)));
  }

  private async comAtividade(card: Card): Promise<CardComAtividade> {
    const atividade = await this.atividades.buscarPorId(card.atividadeId);
    if (!atividade) throw new Error('Atividade do card não encontrada.');
    return { ...card, atividade };
  }
}
