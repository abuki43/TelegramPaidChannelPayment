
import axios from 'axios';
// import crypto from 'crypto';
import { validate } from '@telegram-apps/init-data-node';

const TON_API_KEY = process.env.TON_API_KEY || '';
const RECIPIENT_ADDRESS = process.env.TON_WALLET_ADDRESS
const isTestnet = process.env.TON_NETWORK === 'testnet';
const TON_API_URL = isTestnet 
  ? 'https://testnet.toncenter.com/api/v2' 
  : 'https://toncenter.com/api/v2';


export async function verifyTonTransaction(transactionId, amount) {
  try {
    const response = await axios.get(
      `${TON_API_URL}/getTransactions?address=${RECIPIENT_ADDRESS}&limit=10`,
      {
        headers: { 'X-API-Key': TON_API_KEY },
        timeout: 5000 
      }
    );

    const transactions = response.data.result;
    // console.log("tx",transactions)
    const tx = transactions.find(t => 
      // t.in_msg?.message === `subscription:${transactionId}` &&
      BigInt(t.in_msg.value) >= BigInt(Math.floor(amount * 1e9))
    );

    if (!tx) {
      return false;
    }

    return {
      isValid: true,
      transactionTime: tx.utime,
      value: Number(tx.in_msg.value) / 1e9
    };
  } catch (error) {
    if (error.response?.status === 429) {
      console.error('TON API rate limit exceeded');
    } else {
      console.error('TON verification error:', error.message);
    }
    return false;
  }
}




export function verifyTelegramInitData(initData) {
  try {
    if (process.env.NODE_ENV === 'development' && process.env.SKIP_TELEGRAM_AUTH === 'true') {
      console.log('[verifyTelegramInitData] Skipping verification');
      return true;
    }

    console.log('[verifyTelegramInitData] Raw initData:', initData);

    if (!initData || typeof initData !== 'string') {
      console.log('[verifyTelegramInitData] Invalid initData:', initData);
      return false;
    }

    const BOT_TOKEN = process.env.BOT_TOKEN || '8050932071:AAGv8Su7JzzgWb-25GCkpRWMfCGkuT_xqjk';
    console.log('[verifyTelegramInitData] Using BOT_TOKEN:', BOT_TOKEN);

    // Validate using the package
    validate(initData, BOT_TOKEN);

    console.log('[verifyTelegramInitData] Validation succeeded');
    return true;
  } catch (error) {
    console.error('[verifyTelegramInitData] Validation failed:', error.message);
    return false;
  }
}

