import type { UnidadeDeTrabalho } from '../interfaces/UnidadeDeTrabalho';

/** Remove um card do banco e registra a operação no histórico. */
export class ExcluirCard {
  constructor(private readonly unidadeDeTrabalho: UnidadeDeTrabalho) {}

  async executar(id: string) {
    await this.unidadeDeTrabalho.executar(async ({ cards, historico }) => {
      await cards.remover(id);

      await historico.registrar({
        operacao: 'DELETE',
        entidade: 'CARD',
        entidadeId: id,
      });
    });
  }
}
