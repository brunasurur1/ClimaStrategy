import type { Prisma } from '@prisma/client';
import type {
  Card,
  CardComAtividade,
  CardRepository,
  DadosDoCard,
} from '../domain/interfaces/CardRepository';

export class PrismaCardRepository implements CardRepository {
  constructor(private readonly db: Prisma.TransactionClient) {}

  async criar(dados: DadosDoCard): Promise<Card> {
    return this.db.card.create({ data: dados });
  }

  async atualizar(
    id: string,
    dados: Omit<DadosDoCard, 'atividadeId'>,
  ): Promise<Card> {
    return this.db.card.update({ where: { id }, data: dados });
  }

  async remover(id: string): Promise<void> {
    await this.db.card.delete({ where: { id } });
  }

  async buscarPorId(id: string): Promise<CardComAtividade | null> {
    return this.db.card.findUnique({
      where: { id },
      include: { atividade: true },
    });
  }

  async buscarPorCidadeEAtividade(
    cidade: string,
    atividadeId: string,
  ): Promise<Card | null> {
    return this.db.card.findFirst({ where: { cidade, atividadeId } });
  }

  async listar(): Promise<CardComAtividade[]> {
    return this.db.card.findMany({
      include: { atividade: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
