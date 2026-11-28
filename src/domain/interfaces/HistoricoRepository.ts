export interface EntradaHistorico {
  operacao: 'CREATE' | 'UPDATE' | 'DELETE';
  entidade: 'CARD';
  entidadeId: string;
}

export interface HistoricoRepository {
  registrar(entrada: EntradaHistorico): Promise<void>;
}
