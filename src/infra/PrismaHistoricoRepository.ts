import type { Prisma } from '@prisma/client';
import type {
  EntradaHistorico,
  HistoricoRepository,
} from '../domain/interfaces/HistoricoRepository';

export class PrismaHistoricoRepository implements HistoricoRepository {
  constructor(private readonly db: Prisma.TransactionClient) {}

  async registrar(entrada: EntradaHistorico): Promise<void> {
    await this.db.historico.create({ data: entrada });
  }
}
