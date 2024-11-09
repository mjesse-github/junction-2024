import { Router } from 'express';
import { chatWithGroq } from '../services/groq';
import { storeUserGuess } from '../services/groq';

const router = Router();

router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const response = await chatWithGroq(messages);
    res.json(response);
  } catch (error) {
    console.error('Groq API error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

router.post('/storeAnswer', async (req, res) => {
    try {
      const response = req.body;
  
      if (!response) {
        return res.status(400).json({ error: 'Response not provided' });
      }

      //todo store to DB
      //lol I can just use local FS.
      await storeUserGuess(response);
  
      res.json(response);
    } catch (error) {
      console.error('Storage error:', error);
      res.status(500).json({ error: 'Failed to process request' + error });
    }
  });

export const groqRouter = router; 