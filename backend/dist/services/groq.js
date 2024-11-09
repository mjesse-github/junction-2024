"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeUserGuess = storeUserGuess;
exports.chatWithGroq = chatWithGroq;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongodb_1 = require("./mongodb");
dotenv_1.default.config();
// Debug: Print environment variables
console.log('Environment variables at startup:', {
    GROQ_API_KEY: process.env.GROQ_API_KEY ? 'exists' : 'missing',
    NODE_ENV: process.env.NODE_ENV,
});
if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is required');
}
const groq = new groq_sdk_1.default({
    apiKey: process.env.GROQ_API_KEY,
});
async function storeUserGuess(guess) {
    try {
        const db = await (0, mongodb_1.connectDB)();
        const collection = db.collection('guesses');
        const result = await collection.insertOne({
            ...guess,
            timestamp: new Date(),
        });
        console.log(`Stored guess with ID: ${result.insertedId}`);
        return result;
    }
    catch (error) {
        console.error('Error storing guess:', error);
        throw error;
    }
}
async function chatWithGroq(messages) {
    try {
        const completion = await groq.chat.completions.create({
            messages,
            model: "llama3-8b-8192",
            temperature: 0.7,
            stream: false,
            response_format: { type: "json_object" },
        });
        return completion.choices[0].message;
    }
    catch (error) {
        console.error('Groq API error:', error);
        throw error;
    }
}
