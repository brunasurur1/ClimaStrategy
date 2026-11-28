import axios from 'axios';
import type { CondicoesClimaticas } from '../domain/interfaces/CondicoesClimaticas';
import type { ProvedorClima } from '../domain/interfaces/ProvedorClima';

const MS_PARA_KMH = 3.6;
const TIMEOUT_MS = 5000;

interface ItemForecast {
  dt_txt: string;
  main: { temp: number; humidity: number };
  wind: { speed: number };
  pop: number;
}

interface RespostaForecast {
  list: ItemForecast[];
  city: { name: string };
}

export class OpenWeatherClient implements ProvedorClima {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.openweathermap.org/data/2.5/forecast';

  constructor() {
    if (!process.env.OPENWEATHER_API_KEY) {
      throw new Error('API Key do OpenWeather não configurada no .env');
    }
    this.apiKey = process.env.OPENWEATHER_API_KEY;
  }

  /**
   * Busca o clima atual da cidade (primeiro registro do /forecast, que
   * é o endpoint que fornece 'pop', a probabilidade de precipitação).
   */
  async buscarClima(
    cidade: string,
  ): Promise<{ dados: CondicoesClimaticas; nomeCidade: string }> {
    try {
      const resposta = await this.buscarForecast(cidade);

      return {
        dados: this.paraCondicoes(resposta.list[0]),
        nomeCidade: resposta.city.name,
      };
    } catch (error) {
      console.error('Erro ao buscar clima:', this.mensagemDeErro(error));
      throw new Error(
        'Não foi possível obter o clima para a cidade informada.',
      );
    }
  }

  /** Busca a previsão dos próximos dias (um registro por dia, às 12:00). */
  async buscarPrevisaoFutura(cidade: string): Promise<CondicoesClimaticas[]> {
    try {
      const resposta = await this.buscarForecast(cidade);

      const previsoesDiarias: CondicoesClimaticas[] = [];
      const diasProcessados = new Set<string>();

      // O 'list' contém previsões a cada 3h, em UTC, no formato "YYYY-MM-DD HH:MM:SS".
      // Lemos o texto direto, sem Date, para o resultado não depender do fuso do computador.
      for (const previsao of resposta.list) {
        const [dia, hora] = previsao.dt_txt.split(' ');

        // Só o registro do meio-dia (12:00 UTC) de um dia ainda não adicionado
        if (hora.startsWith('12:') && !diasProcessados.has(dia)) {
          diasProcessados.add(dia);

          previsoesDiarias.push({
            ...this.paraCondicoes(previsao),
            // Data para o frontend saber o dia
            data: previsao.dt_txt,
          });
        }
      }

      return previsoesDiarias;
    } catch (error) {
      console.error(
        'Erro ao buscar previsão futura:',
        this.mensagemDeErro(error),
      );
      throw new Error('Não foi possível obter a previsão futura.');
    }
  }

  /** Única chamada HTTP à OpenWeather, usada pelos dois métodos públicos. */
  private async buscarForecast(cidade: string): Promise<RespostaForecast> {
    const resposta = await axios.get<RespostaForecast>(this.baseUrl, {
      params: {
        q: cidade,
        appid: this.apiKey,
        units: 'metric', // Para temperatura em Celsius
        lang: 'pt_br',
      },
      timeout: TIMEOUT_MS,
    });

    return resposta.data;
  }

  /** Único mapeamento da resposta da OpenWeather para o nosso domínio. */
  private paraCondicoes(item: ItemForecast): CondicoesClimaticas {
    return {
      temperatura: item.main.temp,
      umidade: item.main.humidity,
      velocidadeVento: item.wind.speed * MS_PARA_KMH,
      probabilidadeChuva: item.pop * 100,
    };
  }

  private mensagemDeErro(error: unknown): string {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.message || error.message;
    }
    return error instanceof Error ? error.message : String(error);
  }
}
