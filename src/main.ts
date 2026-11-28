import { prisma } from './prismaClient';
import { AtualizarCard } from './domain/casos-de-uso/AtualizarCard';
import { CriarCard } from './domain/casos-de-uso/CriarCard';
import { ExcluirCard } from './domain/casos-de-uso/ExcluirCard';
import { ListarAtividades } from './domain/casos-de-uso/ListarAtividades';
import { ListarCards } from './domain/casos-de-uso/ListarCards';
import { ObterPrevisaoDoCard } from './domain/casos-de-uso/ObterPrevisaoDoCard';
import { OpenWeatherClient } from './infra/OpenWeatherClient';
import { PrismaAtividadeRepository } from './infra/PrismaAtividadeRepository';
import { PrismaCardRepository } from './infra/PrismaCardRepository';
import { PrismaUnidadeDeTrabalho } from './infra/PrismaUnidadeDeTrabalho';

/** Conjunto de casos de uso expostos à camada HTTP. */
export interface CasosDeUso {
  criarCard: CriarCard;
  atualizarCard: AtualizarCard;
  excluirCard: ExcluirCard;
  listarCards: ListarCards;
  listarAtividades: ListarAtividades;
  obterPrevisaoDoCard: ObterPrevisaoDoCard;
}

/**
 * Composition root: único lugar onde as dependências concretas
 * são criadas e ligadas aos casos de uso.
 */
export function montarCasosDeUso(): CasosDeUso {
  const clima = new OpenWeatherClient();
  const atividades = new PrismaAtividadeRepository(prisma);
  const cards = new PrismaCardRepository(prisma);
  const unidadeDeTrabalho = new PrismaUnidadeDeTrabalho(prisma);

  return {
    criarCard: new CriarCard(clima, atividades, cards, unidadeDeTrabalho),
    atualizarCard: new AtualizarCard(clima, cards, unidadeDeTrabalho),
    excluirCard: new ExcluirCard(unidadeDeTrabalho),
    listarCards: new ListarCards(cards),
    listarAtividades: new ListarAtividades(atividades),
    obterPrevisaoDoCard: new ObterPrevisaoDoCard(clima, cards),
  };
}
