import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { groqRouter } from './routes/groq';

dotenv.config();

if (!process.env.GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY is required');
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use('/api/groq', groqRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 