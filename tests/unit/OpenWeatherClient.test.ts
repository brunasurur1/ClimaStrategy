import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import nock from 'nock';
import { OpenWeatherClient } from '../../src/infra/OpenWeatherClient';

const URL_OPENWEATHER = 'https://api.openweathermap.org';

describe('OpenWeatherClient', () => {
  beforeAll(() => {
    process.env.OPENWEATHER_API_KEY = 'chave-ficticia-de-teste';
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  afterAll(() => {
    nock.enableNetConnect();
  });

  it('lança erro claro quando a API falha no buscarClima', async () => {
    nock(URL_OPENWEATHER)
      .get('/data/2.5/forecast')
      .query(true)
      .reply(500, { message: 'erro interno' });

    const cliente = new OpenWeatherClient();

    await expect(cliente.buscarClima('Campinas')).rejects.toThrow(
      'Não foi possível obter o clima para a cidade informada.',
    );
  });

  it('devolve o registro das 12:00 UTC de cada dia, nos mesmos horários em qualquer fuso', async () => {
    nock(URL_OPENWEATHER)
      .get('/data/2.5/forecast')
      .query(true)
      .reply(200, {
        city: { name: 'Campinas' },
        list: [
          {
            main: { temp: 24, humidity: 60 },
            wind: { speed: 5 },
            pop: 0.1,
            dt_txt: '2026-12-01 09:00:00',
          },
          {
            main: { temp: 25, humidity: 60 },
            wind: { speed: 5 },
            pop: 0.1,
            dt_txt: '2026-12-01 12:00:00',
          },
          {
            main: { temp: 30, humidity: 70 },
            wind: { speed: 5 },
            pop: 0.2,
            dt_txt: '2026-12-01 15:00:00',
          },
          {
            main: { temp: 32, humidity: 80 },
            wind: { speed: 10 },
            pop: 0.7,
            dt_txt: '2026-12-02 12:00:00',
          },
        ],
      });

    const cliente = new OpenWeatherClient();
    const previsoes = await cliente.buscarPrevisaoFutura('Campinas');

    expect(previsoes.map((p) => p.data)).toEqual([
      '2026-12-01 12:00:00',
      '2026-12-02 12:00:00',
    ]);
    expect(previsoes[0].temperatura).toBe(25);
  });
});
