import type { CondicoesClimaticas } from '../../src/domain/interfaces/CondicoesClimaticas';
import type {
  ClimaDaCidade,
  ProvedorClima,
} from '../../src/domain/interfaces/ProvedorClima';

export class FakeProvedorClima implements ProvedorClima {
  clima: ClimaDaCidade = {
    dados: {
      temperatura: 22,
      umidade: 50,
      velocidadeVento: 10,
      probabilidadeChuva: 0,
    },
    nomeCidade: 'São Paulo',
  };
  previsao: CondicoesClimaticas[] = [];
  erro?: Error;
  cidadesConsultadas: string[] = [];

  async buscarClima(cidade: string): Promise<ClimaDaCidade> {
    this.cidadesConsultadas.push(cidade);
    if (this.erro) throw this.erro;
    return this.clima;
  }

  async buscarPrevisaoFutura(cidade: string): Promise<CondicoesClimaticas[]> {
    this.cidadesConsultadas.push(cidade);
    if (this.erro) throw this.erro;
    return this.previsao;
  }
}
