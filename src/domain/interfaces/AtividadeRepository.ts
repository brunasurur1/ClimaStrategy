export interface Atividade {
  id: string;
  nome: string;
  chave: string;
}

export interface AtividadeRepository {
  buscarPorId(id: string): Promise<Atividade | null>;
  listar(): Promise<Atividade[]>;
}
