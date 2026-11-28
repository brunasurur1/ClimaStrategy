import type {
  EntradaHistorico,
  HistoricoRepository,
} from '../../src/domain/interfaces/HistoricoRepository';

export class InMemoryHistoricoRepository implements HistoricoRepository {
  entradas: EntradaHistorico[] = [];

  async registrar(entrada: EntradaHistorico): Promise<void> {
    this.entradas.push(entrada);
  }
}
