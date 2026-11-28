import type { Prisma } from '@prisma/client';
import type {
  Atividade,
  AtividadeRepository,
} from '../domain/interfaces/AtividadeRepository';

export class PrismaAtividadeRepository implements AtividadeRepository {
  constructor(private readonly db: Prisma.TransactionClient) {}

  async buscarPorId(id: string): Promise<Atividade | null> {
    return this.db.atividade.findUnique({ where: { id } });
  }

  async listar(): Promise<Atividade[]> {
    return this.db.atividade.findMany();
  }
}
