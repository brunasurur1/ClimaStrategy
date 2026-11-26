import type { IEstrategia } from './IEstrategia';
import type { CondicoesClimaticas } from '../interfaces/clima.interfaces';

export class EstrategiaCorrer implements IEstrategia {
  avaliar(clima: CondicoesClimaticas): string {
    if (clima.probabilidadeChuva > 50) {
      return '🌧️ Melhor evitar: Alta chance de chuva e pista escorregadia.';
    }

    if (clima.temperatura > 30) {
      return '🥵 Atenção: Calor excessivo! Hidrate-se muito ou corra na esteira.';
    }

    return '🏃‍♂️ Clima perfeito para sua corrida! Aproveite.';
  }
}

export class EstrategiaPraia implements IEstrategia {
  avaliar(clima: CondicoesClimaticas): string {
    if (clima.temperatura < 23) {
      return '🥶 Está um pouco frio para pegar sol/mar hoje.';
    }

    if (clima.probabilidadeChuva > 30) {
      return '☁️ O tempo está fechando. Risco de perder a viagem.';
    }

    return '🏖️ Dia lindo! Não esqueça o protetor solar.';
  }
}

export class EstrategiaPiquenique implements IEstrategia {
  avaliar(clima: CondicoesClimaticas): string {
    if (clima.velocidadeVento > 20) {
      return '🌬️ Vento muito forte! Vai ser difícil segurar as toalhas.';
    }

    if (clima.probabilidadeChuva > 40) {
      return '☔ Risco de chuva. Piquenique em local coberto seria melhor.';
    }

    return '🧺 O parque espera por você! Ótimo clima.';
  }
}
