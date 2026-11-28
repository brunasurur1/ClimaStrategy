import { prisma } from '../prismaClient';
import { WeatherService } from '../infra/WeatherService';
import { SeletorDeEstrategia } from './logica/SeletorDeEstrategia';

export class CardService {
  private weatherService: WeatherService;
  private seletorDeEstrategia: SeletorDeEstrategia;

  constructor() {
    this.weatherService = new WeatherService();
    this.seletorDeEstrategia = new SeletorDeEstrategia();
  }

  // Cria um novo card, buscando o clima e aplicando a estratégia.

  async criarCard(cidade: string, atividadeId: string) {
    // 1. Buscar o nome da atividade no banco
    const atividade = await prisma.atividade.findUnique({
      where: { id: atividadeId },
    });

    if (!atividade) {
      throw new Error('Atividade não encontrada.');
    }

    // 2. Buscar dados do clima (API Externa)
    const { dados: dadosClima, nomeCidade } =
      await this.weatherService.buscarClima(cidade);

    // Verificamos se já existe um card igual (mesma cidade e atividade)
    const cardExistente = await prisma.card.findFirst({
      where: {
        cidade: nomeCidade,
        atividadeId: atividadeId,
      },
    });

    if (cardExistente) {
      // Remove o card antigo para que o novo fique no topo da lista
      await prisma.card.delete({
        where: { id: cardExistente.id },
      });
    }

    // 3. Aplicar a estratégia utilizando a interface climática unificada
    const resultado = this.seletorDeEstrategia.processar(
      atividade.chave,
      dadosClima,
    );

    // 4. Salvar o Card e o Histórico em uma Transação
    const [cardSalvo] = await prisma.$transaction([
      // Criar o Card
      prisma.card.create({
        data: {
          cidade: nomeCidade,
          atividadeId: atividadeId,
          temperatura: dadosClima.temperatura,
          umidade: dadosClima.umidade,
          velocidadeVento: dadosClima.velocidadeVento,
          precipitacaoProbabilidade: dadosClima.probabilidadeChuva,
          condicaoAtual: resultado.motivo,
        },
      }),

      // Criar o log de Histórico
      prisma.historico.create({
        data: {
          operacao: 'CREATE',
          entidade: 'CARD',
          entidadeId: 'Novo Card',
        },
      }),
    ]);

    return cardSalvo;
  }

  // Lista todos os cards salvos.

  async listarCards() {
    return prisma.card.findMany({
      include: {
        atividade: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Lista as atividades disponíveis para o frontend.

  async listarAtividades() {
    return prisma.atividade.findMany();
  }

  async obterPrevisaoParaCard(id: string) {
    // 1. Achar o card e a atividade
    const card = await prisma.card.findUnique({
      where: { id },
      include: { atividade: true },
    });

    if (!card) {
      throw new Error('Card não encontrado.');
    }

    // 2. Buscar a previsão futura
    const previsoes = await this.weatherService.buscarPrevisaoFutura(
      card.cidade,
    );

    // 3. Aplicar a estratégia em cada dia da previsão
    const resultados = previsoes.map((dadosDia) => {
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

    return resultados;
  }

  // Atualiza um card existente com novos dados do clima.

  async atualizarCard(id: string) {
    // 1. Encontra o card e a atividade
    const cardAtual = await prisma.card.findUnique({
      where: { id },
      include: { atividade: true },
    });

    if (!cardAtual) {
      throw new Error('Card não encontrado.');
    }

    // 2. Busca o clima atualizado
    const { dados: dadosClima, nomeCidade } =
      await this.weatherService.buscarClima(cardAtual.cidade);

    // 3. Faz a avaliação utilizando a interface climática unificada
    const resultado = this.seletorDeEstrategia.processar(
      cardAtual.atividade.chave,
      dadosClima,
    );

    // 4. Atualiza o Card e loga no Histórico
    const [cardAtualizado] = await prisma.$transaction([
      prisma.card.update({
        where: { id },
        data: {
          cidade: nomeCidade,
          temperatura: dadosClima.temperatura,
          umidade: dadosClima.umidade,
          velocidadeVento: dadosClima.velocidadeVento,
          precipitacaoProbabilidade: dadosClima.probabilidadeChuva,
          condicaoAtual: resultado.motivo,
        },
      }),

      prisma.historico.create({
        data: {
          operacao: 'UPDATE',
          entidade: 'CARD',
          entidadeId: id,
        },
      }),
    ]);

    return cardAtualizado;
  }

  // Remove um card do banco.

  async deletarCard(id: string) {
    await prisma.$transaction([
      prisma.card.delete({
        where: { id },
      }),

      prisma.historico.create({
        data: {
          operacao: 'DELETE',
          entidade: 'CARD',
          entidadeId: id,
        },
      }),
    ]);
  }
}
