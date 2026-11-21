import { IEstrategia, DadosClima } from './IEstrategia';

// Lógica para CORRER
export class EstrategiaCorrer implements IEstrategia {
  avaliar(clima: DadosClima): string {
    if (clima.chuva > 50) {
      return '🌧️ Melhor evitar: Alta chance de chuva e pista escorregadia.';
    }
    if (clima.temp > 30) {
      return '🥵 Atenção: Calor excessivo! Hidrate-se muito ou corra na esteira.';
    }
    return '🏃‍♂️ Clima perfeito para sua corrida! Aproveite.';
  }
}

// Lógica para PRAIA
export class EstrategiaPraia implements IEstrategia {
  avaliar(clima: DadosClima): string {
    if (clima.temp < 23) {
      return '🥶 Está um pouco frio para pegar sol/mar hoje.';
    }
    if (clima.chuva > 30) {
      return '☁️ O tempo está fechando. Risco de perder a viagem.';
    }
    return '🏖️ Dia lindo! Não esqueça o protetor solar.';
  }
}

// Lógica para PIQUENIQUE
export class EstrategiaPiquenique implements IEstrategia {
  avaliar(clima: DadosClima): string {
    if (clima.vento > 20) {
      return '🌬️ Vento muito forte! Vai ser difícil segurar as toalhas.';
    }
    if (clima.chuva > 40) {
      return '☔ Risco de chuva. Piquenique em local coberto seria melhor.';
    }
    return '🧺 O parque espera por você! Ótimo clima.';
  }
}
