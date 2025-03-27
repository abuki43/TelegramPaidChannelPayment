import { verifyTelegramInitData } from '../utils/ton.js';
import logger from '../utils/logger.js';
import config from '../config/index.js';
import { ApiError } from './error.js';


export const verifyTelegramAuth = (req, res, next) => {
  try {
    // Skip in development if configured
    if (config.server.env === 'development' && config.server.skipAuth) {
      logger.debug('Skipping Telegram auth in development mode');
      return next();
    }
    
    const initData = req.headers['x-telegram-init-data'];
    
    if (!initData) {
      logger.warn('Authentication failed: Missing init data', { 
        path: req.path, 
        ip: req.ip 
      });
      
     
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const isValid = verifyTelegramInitData(initData);
    
    if (!isValid) {
      logger.warn('Authentication failed: Invalid init data', { 
        path: req.path, 
        ip: req.ip 
      });
      
     
      return res.status(403).json({ error: 'Invalid authentication' });
    }
    
  
    logger.debug('Authentication successful', { 
      path: req.path 
    });
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
}; 