import express from 'express';
import { verifyTelegramAuth } from '../middleware/auth.js';
import * as paymentController from '../controllers/payment.controller.js';

const router = express.Router();


router.use(verifyTelegramAuth);


router.post('/verify-payment', paymentController.verifyPayment);
router.get('/status', paymentController.getSubscriptionStatus);

export default router; 