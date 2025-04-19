# Telegram Paid Channel Subscription Service

A simple solution for managing paid subscriptions to a Telegram channel using TON payments and Telegram Mini App.
you can test the bot using this bot. (https://t.me/privateChannelOwner_bot)
it is hosted on render(free tier) it may take upto 20 second for the first response.

## Overview

This project enables you to create a paid membership system for your Telegram channel. Users can subscribe via TON cryptocurrency payments through a Telegram Mini App interface.

## Technologies

- **Frontend**: React.js for the Telegram Mini App
- **Backend**: Node.js with Express
- **Database**: MongoDB with Mongoose ORM
- **Blockchain**: TON (The Open Network)
- **Bot**: Telegram Bot API with Telegraf

## Features

- Telegram Bot for user interactions
- Telegram Mini App for payments
- TON blockchain payment verification
- Automatic membership management
- Expiration notifications


## How It Works

1. Users interact with the bot to access the subscription service
2. Users make payments through the Mini App using TON
3. The server verifies payments on the TON blockchain
4. Valid payments activate channel access for the user
5. Automated system handles membership expirations and renewals

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```
# Server Configuration
PORT=3000
NODE_ENV=development  # or production

# Telegram Bot
BOT_TOKEN=your_telegram_bot_token
CHANNEL_ID=your_telegram_channel_id
MINIAPP_URL=your_mini_app_url

# Database
MONGODB_URI=your_mongodb_connection_string

# TON Configuration
TON_API_KEY=your_ton_api_key  # Get free API key from https://toncenter.com
TON_NETWORK=mainnet  # or testnet
TON_WALLET_ADDRESS=your_wallet_address  # Wallet to receive payments

# Auth (Development Only)
SKIP_TELEGRAM_AUTH=true
```

> **Note**: You can get a free TON API key by registering at [TONCenter.com](https://toncenter.com). This API key is required for blockchain interactions.

## Testnet Support

You can run the system on TON testnet for development and testing:

1. Set `TON_NETWORK=testnet` in your `.env` file
2. Use testnet wallet addresses for all transactions (including your `TON_WALLET_ADDRESS`)
3. Get testnet TON tokens from [@testgiver_ton_bot](https://t.me/testgiver_ton_bot) on Telegram

⚠️ **Important**: When using testnet, ensure all wallet addresses are testnet addresses.

## Setup & Installation

1. Clone the repository
2. Install dependencies:
   ```
   cd server && npm install
   cd ../miniapp && npm install
   ```
3. Set up environment variables as described above
4. Run the server:
   ```
   cd server && npm run dev
   ```

## Project Structure

- `/server` - Backend API and Telegram bot
- `/miniapp` - Telegram Mini App for payments

