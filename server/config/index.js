import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    skipAuth: process.env.SKIP_TELEGRAM_AUTH === 'true',
  },
  
  // MongoDB configuration
  db: {
    uri: process.env.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
    }
  },
  
  // Telegram bot configuration
  telegram: {
    botToken: process.env.BOT_TOKEN,
    channelId: process.env.CHANNEL_ID,
    miniAppUrl: process.env.MINIAPP_URL,
  },
  
  // TON configuration
  ton: {
    apiKey: process.env.TON_API_KEY,
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    dir: path.join(process.cwd(), 'logs'),
  },

  // Cron configuration
  cron: {
    membershipCheck: '0 0 * * *',    // Daily at midnight
    expiryNotifications: '0 12 * * *' // Daily at noon
  }
};

// Validate critical configuration
const validateConfig = () => {
  const requiredVars = [
    { path: 'db.uri', message: 'MONGODB_URI is not set in .env' },
    { path: 'ton.apiKey', message: 'TON_API_KEY is not set in .env' },
    { path: 'telegram.botToken', message: 'BOT_TOKEN is not set in .env' },
    { path: 'telegram.channelId', message: 'CHANNEL_ID is not set in .env' },
  ];
  
  for (const { path, message } of requiredVars) {
    const keys = path.split('.');
    let current = config;
    for (const key of keys) {
      current = current[key];
      if (current === undefined) {
        throw new Error(message);
      }
    }
  }
};

validateConfig();

export default config; 