import type {
  Atividade,
  AtividadeRepository,
} from '../../src/domain/interfaces/AtividadeRepository';

export class InMemoryAtividadeRepository implements AtividadeRepository {
  constructor(private readonly atividades: Atividade[] = []) {}

  async buscarPorId(id: string): Promise<Atividade | null> {
    return this.atividades.find((a) => a.id === id) ?? null;
  }

  async listar(): Promise<Atividade[]> {
    return [...this.atividades];
  }
}
