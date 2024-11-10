import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import { connectDB } from './mongodb';

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

type UserGuess = {
    user_id: string;
    image_id: string;
    category: string;
    guess: string
    is_correct: boolean;

}

export async function storeUserGuess(guess: UserGuess) {
  try {
    const db = await connectDB();
    const collection = db.collection('guesses');
    
    const result = await collection.insertOne({
      ...guess,
      timestamp: new Date(),
    });

    console.log(`Stored guess with ID: ${result.insertedId}`);
    return result;
  } catch (error) {
    console.error('Error storing guess:', error);
    throw error;
  }
}

type FindQuery = {
    user_id: string;
    image_id: string;
    is_correct: boolean | null;
    limit: number;
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

type SearchGuessesOptions = {
  image_id?: string;
  is_correct?: boolean;
  limit?: number;
};

export async function findRecentGuesses(request: FindQuery) {
  try {
    const db = await connectDB();
    const collection = db.collection('guesses');
    
    // Build query object dynamically
    const query: Record<string, any> = {};
    
    if (request.image_id) {
      query.image_id = request.image_id;
    }
    
    if (request.is_correct !== undefined) {
      query.is_correct = request.is_correct;
    }

    const result = await collection
      .find(query)
      .sort({ timestamp: -1 })  // Sort by most recent first
      .limit(request.limit)
      .toArray();

    return result;
  } catch (error) {
    console.error('Error searching guesses:', error);
    throw error;
  }
}