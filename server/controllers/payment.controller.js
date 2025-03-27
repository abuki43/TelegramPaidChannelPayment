import User from '../models/user.model.js';
import { verifyTonTransaction } from '../utils/ton.js';
import bot from '../bot.js';
import logger from '../utils/logger.js';
import { ApiError } from '../middleware/error.js';
import config from '../config/index.js';


export const verifyPayment = async (req, res, next) => {
  try {
    const { userId, transactionId, amount } = req.body;

  
    if (!userId || !transactionId || !amount) {
      logger.warn('Missing required fields in payment verification', {
        provided: req.body,
        required: ['userId', 'transactionId', 'amount']
      });
      
      throw new ApiError(400, 'Missing required fields');
    }

   
    logger.info('Verifying TON transaction', { transactionId, amount });
    const verificationResult = await verifyTonTransaction(transactionId, amount);
    
    if (!verificationResult || !verificationResult.isValid) {
      logger.warn('Transaction verification failed', { transactionId, amount });
      throw new ApiError(400, 'Transaction verification failed');
    }

    // Prevent duplicate processing of same transaction
    const existingTx = await User.findOne({
      'subscription.paymentHistory.transactionId': transactionId
    });

    if (existingTx) {
      logger.warn('Transaction already processed', { transactionId, userId });
      throw new ApiError(409, 'Transaction already processed');
    }

   
    const currentDate = new Date();
    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + 1);

    const user = await User.findOne({ userId });
   
    const updateData = user?.subscription?.isActive ? 
      {
        $set: {
          'subscription.expirationDate': new Date(user.subscription.expirationDate).setMonth(
            new Date(user.subscription.expirationDate).getMonth() + 1
          ),
          'subscription.lastPaymentAmount': amount,
          'subscription.lastPaymentDate': currentDate
        },
        $inc: { totalMonths: 1 },
        $push: {
          'subscription.paymentHistory': {
            amount,
            date: currentDate,
            transactionId,
            verifiedAt: verificationResult.transactionTime
          }
        }
      } : {
        $set: {
          subscription: {
            startDate: currentDate,
            expirationDate,
            isActive: true,
            lastPaymentAmount: amount,
            lastPaymentDate: currentDate,
            paymentHistory: [{
              amount,
              date: currentDate,
              transactionId,
              verifiedAt: verificationResult.transactionTime
            }]
          },
          totalMonths: 1
        }
      };

  
    logger.info('Updating user subscription', { userId });
    const updatedUser = await User.findOneAndUpdate(
      { userId },
      updateData,
      { upsert: true, new: true }
    );

    // Add user to Telegram channel
    try {
      logger.info('Adding user to Telegram channel', { userId });
      await bot.addUserToChannel(userId);
    } catch (botError) {
      logger.error('Failed to add user to channel', { 
        userId, 
        error: botError.message,
        stack: botError.stack
      });
      
    }

    res.status(200).json({
      success: true,
      user: {
        userId: updatedUser.userId,
        subscription: {
          isActive: updatedUser.subscription.isActive,
          expirationDate: updatedUser.subscription.expirationDate,
          lastPaymentAmount: updatedUser.subscription.lastPaymentAmount
        }
      }
    });
  } catch (error) {
    next(error);
  }
};


export const getSubscriptionStatus = async (req, res, next) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      throw new ApiError(400, 'Missing user ID');
    }
    
    logger.debug('Checking subscription status', { userId });
    const user = await User.findOne({ userId });
    
    if (!user) {
      return res.json({ 
        exists: false,
        subscription: {
          isActive: false
        }
      });
    }
    
    res.json({
      exists: true,
      subscription: user.subscription,
      totalMonths: user.totalMonths
    });
  } catch (error) {
    next(error);
  }
}; 