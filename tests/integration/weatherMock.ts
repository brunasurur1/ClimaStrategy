import nock from 'nock';

interface ClimaMock {
  temperatura: number;
  umidade: number;
  vento: number;
  chuva: number;
}

// ======================================================
// SIMULAÇÃO DE CONSULTA CLIMÁTICA
// ======================================================

export function simularClima(
  cidade: string,
  clima: ClimaMock = {
    temperatura: 25,
    umidade: 60,
    vento: 5,
    chuva: 0.1,
  },
  nomeCidade: string = cidade,
) {
  return nock('https://api.openweathermap.org')
    .get('/data/2.5/forecast')
    .query({
      q: cidade,
      appid: 'chave-ficticia-de-teste',
      units: 'metric',
      lang: 'pt_br',
    })
    .reply(200, {
      city: {
        name: nomeCidade,
      },
      list: [
        {
          main: {
            temp: clima.temperatura,
            humidity: clima.umidade,
          },
          wind: {
            speed: clima.vento,
          },
          pop: clima.chuva,
          dt_txt: '2026-12-01 12:00:00',
        },
      ],
    });
}

// ======================================================
// SIMULAÇÃO DE CIDADE INEXISTENTE
// ======================================================

export function simularCidadeInexistente(cidade: string) {
  return nock('https://api.openweathermap.org')
    .get('/data/2.5/forecast')
    .query({
      q: cidade,
      appid: 'chave-ficticia-de-teste',
      units: 'metric',
      lang: 'pt_br',
    })
    .reply(404, {
      cod: '404',
      message: 'city not found',
    });
}

// ======================================================
// SIMULAÇÃO DE PREVISÃO CLIMÁTICA
// ======================================================

export function simularPrevisao(cidade: string) {
  return nock('https://api.openweathermap.org')
    .get('/data/2.5/forecast')
    .query({
      q: cidade,
      appid: 'chave-ficticia-de-teste',
      units: 'metric',
      lang: 'pt_br',
    })
    .reply(200, {
      city: {
        name: cidade,
      },
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
          main: { temp: 32, humidity: 80 },
          wind: { speed: 10 },
          pop: 0.7,
          dt_txt: '2026-12-02 12:00:00',
        },
        {
          main: { temp: 35, humidity: 50 },
          wind: { speed: 5 },
          pop: 0.1,
          dt_txt: '2026-12-03 12:00:00',
        },
      ],
    });
}
