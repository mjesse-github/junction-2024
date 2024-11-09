"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDB = exports.connectDB = void 0;
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
if (!process.env.MONGODB_URI || !process.env.MONGODB_USERNAME || !process.env.MONGODB_PASSWORD) {
    throw new Error('MongoDB configuration is incomplete');
}
const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@junction2024-environmen.oghgp.mongodb.net/?retryWrites=true&w=majority`;
const client = new mongodb_1.MongoClient(uri, {
    serverApi: {
        version: mongodb_1.ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
const connectDB = async () => {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        const db = client.db('junction2024');
        // Test the connection with a simple operation
        await db.command({ ping: 1 });
        console.log("Database connection test successful");
        return db;
    }
    catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
};
exports.connectDB = connectDB;
// Add a cleanup function
const closeDB = async () => {
    try {
        await client.close();
        console.log("MongoDB connection closed");
    }
    catch (error) {
        console.error('Error closing MongoDB connection:', error);
    }
};
exports.closeDB = closeDB;
