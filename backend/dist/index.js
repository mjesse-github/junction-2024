"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const groq_1 = require("./routes/groq");
dotenv_1.default.config();
if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is required');
}
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
}));
app.use('/api/groq', groq_1.groqRouter);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
