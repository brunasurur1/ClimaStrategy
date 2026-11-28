import type {
  EntradaHistorico,
  HistoricoRepository,
} from '../../src/domain/interfaces/HistoricoRepository';

export class InMemoryHistoricoRepository implements HistoricoRepository {
  entradas: EntradaHistorico[] = [];

  async registrar(entrada: EntradaHistorico): Promise<void> {
    this.entradas.push(entrada);
  }

  /** Captura o estado atual para permitir rollback nos testes. */
  snapshot(): EntradaHistorico[] {
    return [...this.entradas];
  }

  /** Restaura o estado capturado por {@link snapshot}. */
  restaurar(estado: EntradaHistorico[]): void {
    this.entradas = [...estado];
  }
}
