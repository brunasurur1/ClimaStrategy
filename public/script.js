// Configuração da API
const API_URL = 'http://localhost:3000';

// ======================================================
// CAMADA DE APRESENTAÇÃO (issue #7)
// O backend envia apenas dados: { apropriado, motivo }.
// A frase e o emoji são decididos aqui, no front.
// ======================================================

// Limites usados pelo visual do clima (mesmos valores das estratégias no backend).
const LIMITE_CHUVA_ALTA = 50; // % de chance de chuva
const LIMITE_CHUVA_MEDIA = 25; // % de chance de chuva
const LIMITE_TEMP_QUENTE = 23; // °C

// Mapa (atividade normalizada -> motivo -> frase). Preserva as frases originais.
const FRASES_POR_ATIVIDADE = {
  correr: {
    FAVORAVEL: '🏃‍♂️ Clima perfeito para sua corrida! Aproveite.',
    CHUVA_FORTE: '🌧️ Melhor evitar: Alta chance de chuva e pista escorregadia.',
    CALOR_EXCESSIVO:
      '🥵 Atenção: Calor excessivo! Hidrate-se muito ou corra na esteira.',
  },
  praia: {
    FAVORAVEL: '🏖️ Dia lindo! Não esqueça o protetor solar.',
    FRIO: '🥶 Está um pouco frio para pegar sol/mar hoje.',
    CHUVA_FORTE: '☁️ O tempo está fechando. Risco de perder a viagem.',
  },
  piquenique: {
    FAVORAVEL: '🧺 O parque espera por você! Ótimo clima.',
    VENTO_FORTE: '🌬️ Vento muito forte! Vai ser difícil segurar as toalhas.',
    CHUVA_FORTE: '☔ Risco de chuva. Piquenique em local coberto seria melhor.',
  },
};

const MOTIVOS_CONHECIDOS = [
  'FAVORAVEL',
  'CHUVA_FORTE',
  'CALOR_EXCESSIVO',
  'FRIO',
  'VENTO_FORTE',
  'ATIVIDADE_DESCONHECIDA',
];

// Normaliza o nome da atividade para a chave do mapa (ex.: "Praia/Piscina" -> "praia").
function normalizarAtividade(nome) {
  const chave = (nome || '').toLowerCase();
  if (chave === 'praia/piscina') return 'praia';
  return chave;
}

// Deriva "apropriado" do motivo (espelha ehApropriado no backend).
function motivoEhApropriado(motivo) {
  return motivo === 'FAVORAVEL';
}

// Traduz um motivo na frase da atividade. Faz fallback para cards antigos,
// cujo condicaoAtual ainda guarda a frase inteira em vez do motivo.
function traduzirMotivo(atividadeNome, motivo) {
  const frasesAtividade = FRASES_POR_ATIVIDADE[normalizarAtividade(atividadeNome)];
  const frase = frasesAtividade && frasesAtividade[motivo];
  if (frase) return frase;
  // Fallback: valor desconhecido (card antigo com a frase crua) -> mostra como veio.
  return motivo;
}

function motivoConhecido(valor) {
  return MOTIVOS_CONHECIDOS.includes(valor);
}

// Elementos do DOM
let formBusca, selectAtividade, inputCidade, dashboardContainer, loadingMessage;
let modalOverlay, modalContent, modalCloseBtn, modalTitulo, modalBody;
let modalErro, modalContentErro, modalTituloErro, modalErroMensagem, modalErroFecharBtn;
let modalConfirm, modalConfirmTitulo, modalConfirmMensagem, btnConfirmCancelar, btnConfirmOk;

document.addEventListener('DOMContentLoaded', () => {
  formBusca = document.getElementById('form-busca');
  selectAtividade = document.getElementById('select-atividade');
  inputCidade = document.getElementById('input-cidade');
  dashboardContainer = document.getElementById('dashboard-container');
  loadingMessage = document.getElementById('loading-message');
  modalOverlay = document.getElementById('modal-overlay');
  modalContent = document.getElementById('modal-content');
  modalCloseBtn = document.getElementById('modal-close');
  modalTitulo = document.getElementById('modal-titulo');
  modalBody = document.getElementById('modal-body');
  modalErro = document.getElementById("modal-erro");
  modalContentErro = document.getElementById('modal-content-erro');
  modalTituloErro = document.getElementById('modal-erro-titulo');
  modalErroMensagem = document.getElementById("modal-erro-mensagem");
  modalErroFecharBtn = document.getElementById("modal-erro-close");
  modalConfirm = document.getElementById("modalConfirm");
  modalConfirmTitulo = document.getElementById("modalConfirmTitulo");
  modalConfirmMensagem = document.getElementById("modalConfirmMensagem");
  btnConfirmCancelar = document.getElementById("bntConfirmCancelar");
  btnConfirmOk = document.getElementById("bntConfirmOk");

  carregarAtividades();
  carregarCards();

  if (formBusca) formBusca.addEventListener('submit', handleCriarCard);
  
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', fecharModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) fecharModal();
    });
  }

  // Fechar Modal Erro
  if (modalErroFecharBtn) modalErroFecharBtn.addEventListener('click', fecharErroModal);
  if (modalErro) {
    modalErro.addEventListener("click", (e) => {
      if (e.target === modalErro) fecharErroModal();
    });
  }
});

// Carrega as opções do dropdown
async function carregarAtividades() {
  try {
    const res = await fetch(`${API_URL}/atividades`);
    const atividades = await res.json();
    
    selectAtividade.innerHTML = ''; 
    atividades.forEach(ativ => {
      const option = document.createElement('option');
      option.value = ativ.id;
      option.textContent = ativ.nome;
      selectAtividade.appendChild(option);
    });
  } catch (error) {
    console.error(error);
    selectAtividade.innerHTML = '<option value="">Erro ao carregar</option>';
  }
}

// Carrega os cards na tela
async function carregarCards() {
  try {
    loadingMessage.style.display = 'block';
    dashboardContainer.innerHTML = '';
    const res = await fetch(`${API_URL}/cards`);
    const cards = await res.json();
    
    loadingMessage.style.display = 'none';

    if (cards.length === 0) {
      dashboardContainer.innerHTML = '<p style="color: #fff; grid-column: 1/-1; text-align: center;">Nenhum card salvo ainda.</p>';
      return;
    }
    cards.forEach(card => {
      const cardElement = criarElementoCard(card);
      dashboardContainer.appendChild(cardElement);
    });
  } catch (error) {
    loadingMessage.textContent = 'Erro de conexão.';
  }
}

// Cria um novo card
async function handleCriarCard(e) {
  e.preventDefault();
  const atividadeId = selectAtividade.value;
  const cidade = inputCidade.value.trim();

  if (!atividadeId || !cidade) return alert('Preencha todos os campos.');

  const btn = e.target.querySelector('button');
  const textoOriginal = btn.textContent;
  btn.textContent = 'Consultando...';
  btn.disabled = true;

  try {
    const res = await fetch(`${API_URL}/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cidade, atividadeId }),
    });

    if (!res.ok) throw new Error('Erro ao criar.');
    
    inputCidade.value = '';
    carregarCards();
  } catch (error) {
    mostrarErroModal(inputCidade.value);
  } finally {
    btn.textContent = textoOriginal;
    btn.disabled = false;
  }
}

// Deletar Card
async function handleExcluirCard(id) {
  const confirmar = await abrirConfimacao("Excluir card", "Tem certeza que deseja excluir este card?");
  if (!confirmar) return;
  try {
    await fetch(`${API_URL}/cards/${id}`, { method: 'DELETE' });
    carregarCards();
  } catch (error) { alert('Erro ao excluir.'); }
}

// Atualizar Card
async function handleAtualizarCard(id, btnElement) {
  const textoOriginal = btnElement.textContent;
  btnElement.textContent = '...';
  try {
    const res = await fetch(`${API_URL}/cards/${id}`, { method: 'PUT' });
    if (res.ok) carregarCards();
  } catch (error) { console.error(error); } 
  finally { btnElement.textContent = textoOriginal; }
}

// Define cor e ícone baseado no clima
function obterVisualClima(card) {
    const chanceChuva = card.precipitacaoProbabilidade || 0;
    const temp = card.temperatura || 0;

    if (chanceChuva >= LIMITE_CHUVA_ALTA) {
      return { 
          classe: 'clima-chuva', 
          imagem: 'https://cdn-icons-png.flaticon.com/512/4088/4088981.png' 
      };
    }

    if (chanceChuva >= LIMITE_CHUVA_MEDIA) {
       return {
          classe: 'clima-frio', 
          imagem: 'https://cdn-icons-png.flaticon.com/512/414/414927.png' 
       };
    }

    if (temp >= LIMITE_TEMP_QUENTE) {
      return { 
          classe: 'clima-sol', 
          imagem: 'https://cdn-icons-png.flaticon.com/512/869/869869.png' 
      };
    }

    return { 
        classe: 'clima-frio', 
        imagem: 'https://cdn-icons-png.flaticon.com/512/414/414927.png' 
    };
}

// Monta o HTML do card
function criarElementoCard(card) {
  const cardDiv = document.createElement('div');
  const visual = obterVisualClima(card);
  
  cardDiv.className = `card ${visual.classe}`;
  cardDiv.id = `card-${card.id}`;

 // O backend envia o motivo em condicaoAtual; a cor e a frase saem dele.
const motivo = card.condicaoAtual;
const ehCardAntigo = !motivoConhecido(motivo);

// Card antigo (frase crua, pré issue #7): visual neutro e texto como veio.
const condicaoClasse = ehCardAntigo
  ? 'neutro'
  : motivoEhApropriado(motivo)
    ? 'apropriado'
    : 'inapropriado';

const fraseCondicao = traduzirMotivo(card.atividade.nome, motivo);

  cardDiv.innerHTML = `
    <img src="${visual.imagem}" alt="Ícone Clima" class="icone-clima-img">

    <div class="card-body"> 
      <div class="card-header">
        <div>
          <h3>${card.cidade}</h3>
          <span class="atividade">${card.atividade.nome}</span>
        </div>
      </div>
      <div class="card-condicao ${condicaoClasse}">
        ${fraseCondicao}
      </div>
      <ul class="card-info">
        <li><strong>🌡️ Temperatura:</strong> ${card.temperatura.toFixed(1)}°C</li>
        <li><strong>💧 Umidade:</strong> ${card.umidade.toFixed(0)}%</li>
        <li><strong>💨 Vento:</strong> ${card.velocidadeVento.toFixed(1)} km/h</li>
        <li><strong>☔ Chuva:</strong> ${card.precipitacaoProbabilidade.toFixed(0)}%</li>
      </ul>
    </div>
    <div class="card-actions">
      <button class="btn-atualizar">Atualizar</button>
      <button class="btn-excluir">Excluir</button>
    </div>
  `;
  
  // Eventos dos botões
  const btnAtualizar = cardDiv.querySelector('.btn-atualizar');
  btnAtualizar.addEventListener('click', (e) => {
    e.stopPropagation();
    handleAtualizarCard(card.id, btnAtualizar);
  });

  const btnExcluir = cardDiv.querySelector('.btn-excluir');
  btnExcluir.addEventListener('click', (e) => {
    e.stopPropagation();
    handleExcluirCard(card.id);
  });

  // Clique no card abre o modal
  const cardBody = cardDiv.querySelector('.card-body');
  cardBody.style.cursor = 'pointer';
  cardBody.addEventListener('click', () => {
    handleAbrirModal(card.id, card.cidade, card.atividade.nome);
  });

  return cardDiv;
}

// Abre modal com previsão detalhada
async function handleAbrirModal(id, cidade, atividadeNome) {
  modalOverlay.style.display = 'flex';
  modalTitulo.textContent = `Previsão: ${atividadeNome} em ${cidade}`;
  modalBody.innerHTML = '<p style="text-align:center">Carregando previsão...</p>';

  try {
    const res = await fetch(`${API_URL}/cards/${id}/forecast`);
    const previsoes = await res.json();

    if (!previsoes || previsoes.length === 0) {
      modalBody.innerHTML = '<p>Sem dados de previsão futura.</p>';
      return;
    }

    modalBody.innerHTML = ''; 

    previsoes.forEach(item => {
      const { dadosClima, resultado, data } = item;
      const div = document.createElement('div');
      div.className = 'previsao-dia';
      
      // Formata data: "Domingo, 1 de dezembro"
      let dataTexto = new Date(data).toLocaleDateString('pt-BR', { 
          weekday: 'long', day: 'numeric', month: 'long' 
      });
      dataTexto = dataTexto.charAt(0).toUpperCase() + dataTexto.slice(1);

      const condicaoClasse = resultado.apropriado ? 'apropriado' : 'inapropriado';
      const fraseDia = traduzirMotivo(atividadeNome, resultado.motivo);

      div.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h4 style="margin:0; font-size: 1.1em; color: #80D0C7;">📅 ${dataTexto}</h4>
        </div>

        <div class="card-condicao ${condicaoClasse}" style="margin-bottom: 10px;">
          ${fraseDia}
        </div>

        <ul class="card-info" style="border:none; padding: 0;">
          <li><span>🌡️ Temperatura:</span> <strong>${dadosClima.temperatura.toFixed(1)}°C</strong></li>
          <li><span>☔ Chance de Chuva:</span> <strong>${dadosClima.probabilidadeChuva.toFixed(0)}%</strong></li>
          <li><span>💨 Vento:</span> <strong>${dadosClima.velocidadeVento.toFixed(1)} km/h</strong></li>
        </ul>
      `;
      modalBody.appendChild(div);
    });

  } catch (error) {
    modalBody.innerHTML = `<p style="color: #ff6b6b; text-align:center;">Erro ao carregar.</p>`;
  }
}

function fecharModal() {
  modalOverlay.style.display = 'none';
}

function mostrarErroModal(cidadeBuscada) {
  modalErro.style.display = "flex";
  modalTituloErro.textContent = "Cidade Não Localizada";
  modalErroMensagem.textContent = `Não encontramos resultados para “${cidadeBuscada}”. Verifique se o nome está correto e tente novamente.`;
}

function fecharErroModal() {
  modalErro.style.display = "none";
}

function abrirConfimacao(titulo, mensagem) {
  return new Promise((resolve) => {
    modalConfirmTitulo.textContent = titulo;
    modalConfirmMensagem.textContent = mensagem;

    modalConfirm.style.display = "flex";

    btnConfirmCancelar.onclick = () => {
      modalConfirm.style.display = "none";
      resolve(false);
    };

    btnConfirmOk.onclick = () => {
      modalConfirm.style.display = "none";
      resolve(true);
    };
  });
}