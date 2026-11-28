import type { AtividadeRepository } from './interfaces/AtividadeRepository';
import type { CardRepository } from './interfaces/CardRepository';
import type { ProvedorClima } from './interfaces/ProvedorClima';
import type { UnidadeDeTrabalho } from './interfaces/UnidadeDeTrabalho';
import { SeletorDeEstrategia } from './logica/SeletorDeEstrategia';

export class CardService {
  constructor(
    private readonly clima: ProvedorClima,
    private readonly atividades: AtividadeRepository,
    private readonly cards: CardRepository,
    private readonly unidadeDeTrabalho: UnidadeDeTrabalho,
    private readonly seletorDeEstrategia: SeletorDeEstrategia = new SeletorDeEstrategia(),
  ) {}

  // Cria um novo card, buscando o clima e aplicando a estratégia.

  async criarCard(cidade: string, atividadeId: string) {
    // 1. Buscar a atividade
    const atividade = await this.atividades.buscarPorId(atividadeId);

    if (!atividade) {
      throw new Error('Atividade não encontrada.');
    }

    // 2. Buscar dados do clima (API Externa)
    const { dados: dadosClima, nomeCidade } =
      await this.clima.buscarClima(cidade);

    // Verificamos se já existe um card igual (mesma cidade e atividade)
    const cardExistente = await this.cards.buscarPorCidadeEAtividade(
      nomeCidade,
      atividadeId,
    );

    if (cardExistente) {
      // Remove o card antigo para que o novo fique no topo da lista
      await this.cards.remover(cardExistente.id);
    }

    // 3. Aplicar a estratégia utilizando a interface climática unificada
    const resultado = this.seletorDeEstrategia.processar(
      atividade.chave,
      dadosClima,
    );

    // 4. Salvar o Card e o Histórico em uma Transação
    return this.unidadeDeTrabalho.executar(async ({ cards, historico }) => {
      const cardSalvo = await cards.criar({
        cidade: nomeCidade,
        atividadeId: atividadeId,
        temperatura: dadosClima.temperatura,
        umidade: dadosClima.umidade,
        velocidadeVento: dadosClima.velocidadeVento,
        precipitacaoProbabilidade: dadosClima.probabilidadeChuva,
        condicaoAtual: resultado.motivo,
      });

      await historico.registrar({
        operacao: 'CREATE',
        entidade: 'CARD',
        entidadeId: 'Novo Card',
      });

      return cardSalvo;
    });
  }

  // Lista todos os cards salvos.

  async listarCards() {
    return this.cards.listar();
  }

  // Lista as atividades disponíveis para o frontend.

  async listarAtividades() {
    return this.atividades.listar();
  }

  async obterPrevisaoParaCard(id: string) {
    // 1. Achar o card e a atividade
    const card = await this.cards.buscarPorId(id);

    if (!card) {
      throw new Error('Card não encontrado.');
    }

    // 2. Buscar a previsão futura
    const previsoes = await this.clima.buscarPrevisaoFutura(card.cidade);

    // 3. Aplicar a estratégia em cada dia da previsão
    return previsoes.map((dadosDia) => {
      const resultado = this.seletorDeEstrategia.processar(
        card.atividade.chave,
        dadosDia,
      );

      return {
        data: dadosDia.data,
        dadosClima: dadosDia,
        resultado: {
          apropriado: resultado.apropriado,
          motivo: resultado.motivo,
        },
      };
    });
  }

  // Atualiza um card existente com novos dados do clima.

  async atualizarCard(id: string) {
    // 1. Encontra o card e a atividade
    const cardAtual = await this.cards.buscarPorId(id);

    if (!cardAtual) {
      throw new Error('Card não encontrado.');
    }

    // 2. Busca o clima atualizado
    const { dados: dadosClima, nomeCidade } = await this.clima.buscarClima(
      cardAtual.cidade,
    );

    // 3. Faz a avaliação utilizando a interface climática unificada
    const resultado = this.seletorDeEstrategia.processar(
      cardAtual.atividade.chave,
      dadosClima,
    );

    // 4. Atualiza o Card e loga no Histórico
    return this.unidadeDeTrabalho.executar(async ({ cards, historico }) => {
      const cardAtualizado = await cards.atualizar(id, {
        cidade: nomeCidade,
        temperatura: dadosClima.temperatura,
        umidade: dadosClima.umidade,
        velocidadeVento: dadosClima.velocidadeVento,
        precipitacaoProbabilidade: dadosClima.probabilidadeChuva,
        condicaoAtual: resultado.motivo,
      });

      await historico.registrar({
        operacao: 'UPDATE',
        entidade: 'CARD',
        entidadeId: id,
      });

      return cardAtualizado;
    });
  }

  // Remove um card do banco.

  async deletarCard(id: string) {
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
