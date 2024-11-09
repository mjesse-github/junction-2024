import { Router } from 'express';
import { chatWithGroq } from '../services/groq';

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

export const groqRouter = router; 