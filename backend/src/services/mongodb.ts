import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is required');
}

const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // SSL/TLS options
  tls: true,                   // Use TLS for connection
  ssl: true,                   // Required for some MongoDB Atlas clusters
  retryWrites: true,
  w: 'majority',
  maxPoolSize: 10,
  minPoolSize: 1,
});

let dbConnection: any = null;

export const connectDB = async () => {
  try {
    if (dbConnection) {
      return dbConnection;
    }

    console.log('Connecting to MongoDB...');
    await client.connect();
    dbConnection = client.db('junction2024');
    console.log('Successfully connected to MongoDB.');
    
    return dbConnection;
  } catch (error) {
    console.error('MongoDB connection error:', {
      error,
      uri: process.env.MONGODB_URI?.substring(0, 20) + '...',
      env: process.env.NODE_ENV
    });
    throw error;
  }
};

// Cleanup on application shutdown
process.on('SIGINT', async () => {
  try {
    await client.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
    process.exit(1);
  }
}); 