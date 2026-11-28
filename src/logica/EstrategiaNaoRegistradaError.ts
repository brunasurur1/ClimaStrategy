/**
 * Erro de domínio lançado quando uma atividade não possui
 * estratégia registrada no seletor.
 *
 * Diferente de um veredito climático (ex.: CHUVA_FORTE), isto
 * representa uma condição inválida: a chave recebida não está
 * mapeada para nenhuma estratégia.
 */
export class EstrategiaNaoRegistradaError extends Error {
  public readonly chave: string;

  constructor(chave: string) {
    super(`Nenhuma estratégia registrada para a atividade "${chave}".`);
    this.name = 'EstrategiaNaoRegistradaError';
    this.chave = chave;
  }
}
