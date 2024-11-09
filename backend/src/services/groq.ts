import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Debug: Print environment variables
console.log('Environment variables at startup:', {
    GROQ_API_KEY: process.env.GROQ_API_KEY ? 'exists' : 'missing',
    NODE_ENV: process.env.NODE_ENV,
  });
if (!process.env.GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY is required');
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function chatWithGroq(messages: ChatMessage[]) {
  try {
    const completion = await groq.chat.completions.create({
      messages,
      model: "llama3-8b-8192",
      temperature: 0.7,
      stream: false,
      response_format: { type: "json_object" },
    });

    return completion.choices[0].message;
  } catch (error) {
    console.error('Groq API error:', error);
    throw error;
  }
} 