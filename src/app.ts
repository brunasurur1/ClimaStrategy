import express from 'express';
import cors from 'cors';
import { CardService } from './domain/CardService';

// Função principal para iniciar o servidor
export function createApp() {
  const app = express();

  // Middlewares
  app.use(cors()); // Permite acesso do frontend (Fase 4)
  app.use(express.json()); // Habilita o parsing de JSON no body

  // Instancia nosso serviço principal
  const cardService = new CardService();

  // --- DEFINIÇÃO DAS ROTAS (CONTROLLERS) ---

  // [GET] /atividades - Lista atividades para o <select> do frontend
  app.get('/atividades', async (req, res) => {
    try {
      const atividades = await cardService.listarAtividades();
      res.json(atividades);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // [GET] /cards - (READ) Lista todos os cards
  app.get('/cards', async (req, res) => {
    try {
      const cards = await cardService.listarCards();
      res.json(cards);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // [POST] /cards - (CREATE) Cria um novo card
  app.post('/cards', async (req, res) => {
    try {
      const { cidade, atividadeId } = req.body;
      if (!cidade || !atividadeId) {
        return res
          .status(400)
          .json({ message: 'Cidade e atividadeId são obrigatórios.' });
      }
      const novoCard = await cardService.criarCard(cidade, atividadeId);
      res.status(201).json(novoCard);
    } catch (error: any) {
      // Captura erros específicos, como cidade não encontrada pela API
      res.status(500).json({ message: error.message });
    }
  });

  // [PUT] /cards/:id - (UPDATE) Atualiza um card
  app.put('/cards/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const cardAtualizado = await cardService.atualizarCard(id);
      res.json(cardAtualizado);
    } catch (error: any) {
      if (error.message === 'Card não encontrado.') {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // [DELETE] /cards/:id - (DELETE) Remove um card
  app.delete('/cards/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await cardService.deletarCard(id);
      res.status(204).send(); // 204 No Content
    } catch (error: any) {
      if (error.message.includes('Record to delete does not exist')) {
        return res.status(404).json({ message: 'Card não encontrado.' });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // [GET] /cards/:id/forecast - (ROTA ATUALIZADA E CORRIGIDA)
  app.get('/cards/:id/forecast', async (req, res) => {
    try {
      const { id } = req.params;

      // Delega TODA a lógica para o serviço
      const previsaoComEstrategia = await cardService.obterPrevisaoParaCard(id);

      res.json(previsaoComEstrategia);
    } catch (error: any) {
      // Se o service der 'throw', nós o capturamos aqui
      if (error.message === 'Card não encontrado.') {
        res.status(404).json({ message: error.message });
      } else {
        // Outros erros (ex: falha na API OpenWeather)
        res.status(500).json({ message: error.message });
      }
    }
  });

  return app;
}
