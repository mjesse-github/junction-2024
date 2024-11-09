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
  ssl: true,
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
  retryWrites: true,
  w: 'majority',
  minPoolSize: 1,
  maxPoolSize: 10,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 30000,
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

// Add connection cleanup
process.on('SIGINT', async () => {
  try {
    await client.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error during MongoDB connection closure:', err);
    process.exit(1);
  }
}); 