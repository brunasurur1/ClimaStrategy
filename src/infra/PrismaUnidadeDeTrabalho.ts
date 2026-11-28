import type { PrismaClient } from '@prisma/client';
import type {
  Repositorios,
  UnidadeDeTrabalho,
} from '../domain/interfaces/UnidadeDeTrabalho';
import { PrismaCardRepository } from './PrismaCardRepository';
import { PrismaHistoricoRepository } from './PrismaHistoricoRepository';

export class PrismaUnidadeDeTrabalho implements UnidadeDeTrabalho {
  constructor(private readonly prisma: PrismaClient) {}

  executar<T>(operacao: (repos: Repositorios) => Promise<T>): Promise<T> {
    return this.prisma.$transaction((tx) =>
      operacao({
        cards: new PrismaCardRepository(tx),
        historico: new PrismaHistoricoRepository(tx),
      }),
    );
  }
}
