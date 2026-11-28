import type { Atividade } from './AtividadeRepository';

export interface Card {
  id: string;
  cidade: string;
  atividadeId: string;
  temperatura: number;
  umidade: number;
  velocidadeVento: number;
  precipitacaoProbabilidade: number;
  condicaoAtual: string;
  createdAt: Date;
}

export type CardComAtividade = Card & { atividade: Atividade };
export type DadosDoCard = Omit<Card, 'id' | 'createdAt'>;

export interface CardRepository {
  criar(dados: DadosDoCard): Promise<Card>;
  atualizar(id: string, dados: Omit<DadosDoCard, 'atividadeId'>): Promise<Card>;
  remover(id: string): Promise<void>;
  buscarPorId(id: string): Promise<CardComAtividade | null>;
  buscarPorCidadeEAtividade(
    cidade: string,
    atividadeId: string,
  ): Promise<Card | null>;
  listar(): Promise<CardComAtividade[]>; // mais recentes primeiro
}
