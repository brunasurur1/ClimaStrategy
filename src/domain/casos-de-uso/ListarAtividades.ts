import type { AtividadeRepository } from '../interfaces/AtividadeRepository';

/** Lista as atividades disponíveis para o frontend. */
export class ListarAtividades {
  constructor(private readonly atividades: AtividadeRepository) {}

  async executar() {
    return this.atividades.listar();
  }
}
