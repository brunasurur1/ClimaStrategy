import { prisma } from './prismaClient';
import { CardService } from './domain/CardService';
import { OpenWeatherClient } from './infra/OpenWeatherClient';
import { PrismaAtividadeRepository } from './infra/PrismaAtividadeRepository';
import { PrismaCardRepository } from './infra/PrismaCardRepository';
import { PrismaUnidadeDeTrabalho } from './infra/PrismaUnidadeDeTrabalho';

/**
 * Composition root: único lugar onde as dependências concretas
 * são criadas e ligadas ao CardService.
 */
export function montarCardService(): CardService {
  return new CardService(
    new OpenWeatherClient(),
    new PrismaAtividadeRepository(prisma),
    new PrismaCardRepository(prisma),
    new PrismaUnidadeDeTrabalho(prisma),
  );
}
