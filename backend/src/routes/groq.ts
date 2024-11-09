import { response, Router } from 'express';
import { chatWithGroq } from '../services/groq';
import { storeUserGuess, findRecentGuesses } from '../services/groq';

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

      await storeUserGuess(response);
  
      res.json(response);
    } catch (error) {
      console.error('Storage error:', error);
      res.status(500).json({ error: 'Failed to process request' + error });
    }
  });

router.post('/getRecentAnswers', async (req, res) => {
    try {
        const request = req.body;

        if (!request) {
            return res.status(400).json({ error: 'Query not provided' });
        }        
        const response = await findRecentGuesses(request);
        res.json(response);
    } catch (error) {
        console.error('Storage error:', error);
        res.status(500).json({ error: 'Failed to process request' + error });
    }
});

export const groqRouter = router; 