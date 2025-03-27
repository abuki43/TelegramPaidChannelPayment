import "dotenv/config";
import { Telegraf, Markup } from "telegraf";

import User from "./models/user.model.js";

const bot = new Telegraf(process.env.BOT_TOKEN);
const CHANNEL_ID = process.env.CHANNEL_ID; 

// Set bot commands
bot.telegram.setMyCommands([
  { command: 'start', description: 'Start the bot' },
  { command: 'status', description: 'Check subscription status' },
  { command: 'help', description: 'Get help' }
]);


// Helper function to create invite link
async function createInviteLink(userId) {
  try {
    // Create a unique invite link that expires in 1 hour
    const invite = await bot.telegram.createChatInviteLink(CHANNEL_ID, {
      expire_date: Math.floor(Date.now() / 1000) + 3600, 
      member_limit: 1, 
      name: `User_${userId}` // For tracking purposes
    });
    return invite.invite_link;
  } catch (error) {
    console.error('Error creating invite link:', error);
    throw error;
  }
}

// Create keyboard with mini app button
const getMiniAppKeyboard = () => {
  return Markup.keyboard([
    [Markup.button.webApp('💎 Open Premium Access', process.env.MINIAPP_URL)],
    [Markup.button.text('📊 Check Status')]
  ]).resize();
};

// Add user to channel
bot.addUserToChannel = async (userId) => {
  try {
    // Create temporary invite link
    const inviteLink = await createInviteLink(userId);
    
    // Send invite link to user
    await bot.telegram.sendMessage(userId, 
      `Welcome to our premium channel! 🎉\n\n` +
      `Please use this link to join: ${inviteLink}\n\n` +
      `⚠️ This link will expire in 1 hour. Click it now to join!`
    );

    // Update user record with invite link
    await User.findOneAndUpdate(
      { userId },
      { 
        $set: {
          'subscription.inviteLink': inviteLink,
          'subscription.inviteSentAt': new Date()
        }
      }
    );

    return true;
  } catch (error) {
    console.error('Error adding user to channel:', error);
    throw error;
  }
};

// Remove user from channel
bot.removeUserFromChannel = async (userId) => {
  try {
    // Ban user from channel (this removes them)
    await bot.telegram.banChatMember(CHANNEL_ID, userId);
    
    // Immediately unban so they can rejoin later
    await bot.telegram.unbanChatMember(CHANNEL_ID, userId);
    
    return true;
  } catch (error) {
    console.error('Error removing user from channel:', error);
    throw error;
  }
};

// Send message to user
bot.sendMessage = async (userId, message) => {
  try {
    await bot.telegram.sendMessage(userId, message);
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Handle /start command
bot.command('start', async (ctx) => {
  try {
    const userId = ctx.from.id;
    let user = await User.findOne({ userId });
    
    // If user doesn't exist, create new user
    if (!user) {
      user = await User.create({
        userId: userId,
        username: ctx.from.username || null,
        subscription: {
          isActive: false,
          startDate: null,
          expirationDate: null
        }
      });
      console.log('New user created:', userId);
      
      await ctx.reply(
        'Welcome to our Premium Channel Bot! 🎉\n\n' +
        'To access our exclusive content, please click the button below to open our mini app and complete the payment.\n\n' +
        'Need help? Just type /help',
        getMiniAppKeyboard()
      );
      return;
    }

    // Existing user logic
    if (user.subscription?.isActive) {
      const expiryDate = new Date(user.subscription.expirationDate);
      await ctx.reply(
        `Welcome back! 🎉\n\n` +
        `Your membership is active until: ${expiryDate.toLocaleDateString()}\n` +
        `Enjoy the premium content!`,
        getMiniAppKeyboard()
      );
    } else {
      await ctx.reply(
        'Welcome back!\n\n' +
        'To access our premium channel, please click the button below to open our mini app and complete the payment.\n\n' +
        'Need help? Just type /help',
        getMiniAppKeyboard()
      );
    }
  } catch (error) {
    console.error('Error handling start command:', error);
    ctx.reply('Sorry, something went wrong. Please try again later.');
  }
});

// Shared function for checking status
async function checkStatus(ctx) {
  try {
    const userId = ctx.from.id;
    const user = await User.findOne({ userId });
    
    if (!user) {
      return ctx.reply(
        'You don\'t have an active subscription yet.\n\n' +
        'Click the button below to get started!',
        getMiniAppKeyboard()
      );
    }
    if(!user.paymentHistory){
      await ctx.reply(
        `Your are not subcscriber of our Premium channel.\n\n`+
        'Click the below button to be get access.',
        getMiniAppKeyboard()
      );
    }
    else if (user.subscription?.isActive) {
      const expiryDate = new Date(user.subscription.expirationDate);
      await ctx.reply(
        `Your subscription is active! 🎉\n\n` +
        `Expires: ${expiryDate.toLocaleDateString()}\n` +
        `Total months subscribed: ${user.totalMonths}\n\n` +
        `Want to extend? Click the button below!`,
        getMiniAppKeyboard()
      );
    } else {
      await ctx.reply(
        'Your subscription has expired.\n\n' +
        'Click the button below to renew!',
        getMiniAppKeyboard()
      );
    }
  } catch (error) {
    console.error('Error checking status:', error);
    ctx.reply('Sorry, something went wrong. Please try again later.');
  }
}

// Handle status command
bot.command('status', checkStatus);

// Handle status button click
bot.hears('📊 Check Status', checkStatus);

// Handle /help command
bot.command('help', async (ctx) => {
  try {
    await ctx.reply(
      '🤖 Bot Commands:\n\n' +
      '/start - Start the bot\n' +
      '/status - Check your subscription status\n' +
      '/help - Show this help message\n\n' +
      '💡 How to get premium access:\n' +
      '1. Open our mini app\n' +
      '2. Connect your TON wallet\n' +
      '3. Complete the payment\n' +
      '4. Get instant access to premium content!\n\n' +
      '❓ Need more help? Contact @YourSupportUsername',
      getMiniAppKeyboard()
    );
  } catch (error) {
    console.error('Error handling help command:', error);
    ctx.reply('Sorry, something went wrong. Please try again later.');
  }
});

export default bot;
