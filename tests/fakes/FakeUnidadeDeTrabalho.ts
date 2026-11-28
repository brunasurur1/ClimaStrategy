import type {
  Repositorios,
  UnidadeDeTrabalho,
} from '../../src/domain/interfaces/UnidadeDeTrabalho';

export class FakeUnidadeDeTrabalho implements UnidadeDeTrabalho {
  constructor(private readonly repositorios: Repositorios) {}

  executar<T>(operacao: (repos: Repositorios) => Promise<T>): Promise<T> {
    return operacao(this.repositorios);
  }
}
