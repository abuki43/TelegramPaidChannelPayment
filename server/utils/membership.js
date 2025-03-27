import User from '../models/user.model.js';
import bot from '../bot.js';
import logger from './logger.js';


export const checkMembershipsExpiry = async (notifyOnly = false) => {
  try {
    logger.info('Running membership expiry check', { notifyOnly });
    
    if (notifyOnly) {
      // Find users with subscriptions expiring in 3 days
      const expiringUsers = await User.findExpiringSubscriptions(3);
      
      logger.info(`Found ${expiringUsers.length} users with expiring subscriptions`);
      
      // Send expiry notifications
      for (const user of expiringUsers) {
        try {
          const daysLeft = user.getRemainingDays();
          
          logger.debug('Sending expiry notification', {
            userId: user.userId,
            daysLeft,
            expirationDate: user.subscription.expirationDate
          });
          
          await bot.sendMessage(
            user.userId,
            `⚠️ Your subscription will expire in ${daysLeft} days!\n\n` +
            `To continue enjoying premium content, please renew your subscription.`
          );
        } catch (error) {
          logger.error('Error sending expiry notification', {
            userId: user.userId,
            error: error.message
          });
        }
      }
      
      return;
    }
    
    // Find expired subscriptions
    const expiredUsers = await User.findExpiredSubscriptions();
    
    logger.info(`Found ${expiredUsers.length} users with expired subscriptions`);
    
    // Process expired users
    for (const user of expiredUsers) {
      try {
        logger.debug('Processing expired subscription', {
          userId: user.userId,
          expirationDate: user.subscription.expirationDate
        });
        
        // Update user record
        await User.findOneAndUpdate(
          { userId: user.userId },
          { 
            $set: { 'subscription.isActive': false }
          }
        );
        
        // Remove from Telegram channel
        await bot.removeUserFromChannel(user.userId);
        
        // Send notification
        await bot.sendMessage(
          user.userId,
          `Your subscription has expired.\n\n` +
          `You no longer have access to premium content. ` +
          `To renew, please make a new payment.`
        );
        
        logger.info('Successfully processed expired subscription', { userId: user.userId });
      } catch (error) {
        logger.error('Error processing expired user', {
          userId: user.userId,
          error: error.message,
          stack: error.stack
        });
      }
    }
  } catch (error) {
    logger.error('Membership check error', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}; 