import { describe, it, expect } from 'vitest';
import { EstrategiaNaoRegistradaError } from '../../src/logica/EstrategiaNaoRegistradaError';

describe('EstrategiaNaoRegistradaError', () => {
  it('é uma instância de Error', () => {
    const erro = new EstrategiaNaoRegistradaError('futebol');
    expect(erro).toBeInstanceOf(Error);
    expect(erro).toBeInstanceOf(EstrategiaNaoRegistradaError);
  });

  it('expõe o name do erro de domínio', () => {
    const erro = new EstrategiaNaoRegistradaError('futebol');
    expect(erro.name).toBe('EstrategiaNaoRegistradaError');
  });

  it('guarda a chave e a inclui na mensagem', () => {
    const erro = new EstrategiaNaoRegistradaError('futebol');
    expect(erro.chave).toBe('futebol');
    expect(erro.message).toContain('futebol');
  });
});
