"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groqRouter = void 0;
const express_1 = require("express");
const groq_1 = require("../services/groq");
const groq_2 = require("../services/groq");
const router = (0, express_1.Router)();
router.post('/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages array is required' });
        }
        const response = await (0, groq_1.chatWithGroq)(messages);
        res.json(response);
    }
    catch (error) {
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
        await (0, groq_2.storeUserGuess)(response);
        res.json(response);
    }
    catch (error) {
        console.error('Storage error:', error);
        res.status(500).json({ error: 'Failed to process request' + error });
    }
});
exports.groqRouter = router;
