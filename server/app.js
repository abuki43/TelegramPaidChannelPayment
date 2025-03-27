import express from "express";
import path from "path";
import cors from "cors";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";

import config from "./config/index.js";
import logger from "./utils/logger.js";
import paymentRoute from "./routes/payment.route.js";
import { errorHandler } from "./middleware/error.js";


const app = express();
const __dirname = path.resolve();

// // Security middleware with Telegram compatibility
// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'"],
//       connectSrc: ["'self'", "telegram.org", "*.telegram.org", "ton.org", "*.ton.org"],
//       scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "telegram.org", "*.telegram.org"],
//       frameSrc: ["'self'", "telegram.org", "*.telegram.org"],
//       imgSrc: ["'self'", "data:", "telegram.org", "*.telegram.org"],
//       styleSrc: ["'self'", "'unsafe-inline'"],
//     },
//   },
//   crossOriginEmbedderPolicy: false,
//   crossOriginOpenerPolicy: false,
//   crossOriginResourcePolicy: false,
// }));


// app.use(cors({
//   origin: ["https://web.telegram.org", "https://*.web.telegram.org"],
//   credentials: true
// }));


// app.use(compression());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, "../miniapp/dist")));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests, please try again later",
  skip: () => config.server.env === "development",
});
app.use("/api", apiLimiter);

// HTTP request logging
app.use(
  morgan(config.server.env === "development" ? "dev" : "combined", {
    stream: logger.stream,
    skip: (req) => req.url === "/api/health",
  })
);

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    const dbStatus = req.app.locals.dbStatus || false;
    const botStatus = req.app.locals.botStatus || false;
    
    const health = {
      status: "ok",
      timestamp: new Date(),
      uptime: process.uptime(),
      mongodb: dbStatus ? "connected" : "disconnected",
      bot: botStatus ? "running" : "stopped",
      environment: config.server.env,
    };
    
    if (!dbStatus || !botStatus) {
      return res.status(503).json({ ...health, status: "error" });
    }
    
    res.json(health);
  } catch (error) {
    logger.error("Health check error:", error);
    res.status(503).json({
      status: "error",
      timestamp: new Date(),
      error: config.server.env === "development" ? error.message : "Service unavailable",
    });
  }
});

// API routes
app.use("/api/membership", paymentRoute);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: "The requested resource was not found on this server.",
  });
});

// Error handling middleware
app.use(errorHandler);

export default app; 