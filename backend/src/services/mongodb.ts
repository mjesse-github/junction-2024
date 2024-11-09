import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.MONGODB_URI || !process.env.MONGODB_USERNAME || !process.env.MONGODB_PASSWORD) {
  throw new Error('MongoDB configuration is incomplete');
}

const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@junction2024-environmen.oghgp.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

export const connectDB = async () => {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db('junction2024');
    
    // Test the connection with a simple operation
    await db.command({ ping: 1 });
    console.log("Database connection test successful");
    
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Add a cleanup function
export const closeDB = async () => {
  try {
    await client.close();
    console.log("MongoDB connection closed");
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
}; 