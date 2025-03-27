import mongoose from "mongoose";
import cron from "node-cron";
import config from "./config/index.js";
import app from "./app.js";
import bot from "./bot.js";
import logger from "./utils/logger.js";
import { checkMembershipsExpiry } from "./utils/membership.js";
import { handleUncaughtErrors } from "./middleware/error.js";

// Set up global error handlers
handleUncaughtErrors();


async function startServer() {
  try {
    logger.info("Starting server...");

    
    logger.info("Connecting to MongoDB...");
    await mongoose.connect(config.db.uri, config.db.options);
    logger.info("Connected to MongoDB");
    
   

    // Schedule cron jobs
    logger.info("Setting up cron jobs...");
    
   
    cron.schedule(config.cron.membershipCheck, async () => {
      logger.info("Running daily membership check");
      try {
        await checkMembershipsExpiry();
      } catch (error) {
        logger.error("Membership check error:", { error });
      }
    });
    logger.info("Daily membership check scheduled");

    // Membership expiry notifications
    cron.schedule(config.cron.expiryNotifications, async () => {
      logger.info("Sending expiry notifications");
      try {
        await checkMembershipsExpiry(true);
      } catch (error) {
        logger.error("Expiry notification error:", { error });
      }
    });
    logger.info("Expiry notifications scheduled");

    
    logger.info(`Starting Express server on port ${config.server.port}...`);
    const server = app.listen(config.server.port, () => {
      logger.info(`Server running on port ${config.server.port}`);
    });

    
    logger.info("Launching Telegram bot...");
    await bot.launch();
    logger.info("Telegram bot started successfully");

    logger.info("Server startup complete");
    
    // Graceful shutdown handler
    const shutdown = async (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);

      try {
     
        await new Promise((resolve, reject) => {
          server.close((err) => {
            if (err) {
              logger.error("Error closing HTTP server:", { error: err });
              reject(err);
            } else {
              logger.info("HTTP server closed");
              resolve();
            }
          });
        });

       
        if (bot && bot.isRunning) {
          await bot.stop(signal);
          logger.info("Telegram bot stopped");
        }

       
        if (mongoose.connection.readyState) {
          await mongoose.connection.close();
          logger.info("MongoDB connection closed");
        }

        logger.info("Shutdown complete");
        process.exit(0);
      } catch (error) {
        logger.error("Shutdown error:", { error });
        process.exit(1);
      }
    };

    
    ["SIGINT", "SIGTERM"].forEach((signal) => {
      process.on(signal, () => shutdown(signal));
    });
    
  } catch (error) {
    logger.error("Failed to start server:", { error });
    process.exit(1);
  }
}


startServer();