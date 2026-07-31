import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/errorHandler';
import * as paymentController from './payment.controller';
import { verifyPaymentSchema } from './payment.validation';

const router = Router();

router.post('/razorpay/callback', paymentController.razorpayCallback);
router.get('/razorpay/callback', paymentController.razorpayCallback);
router.get('/razorpay/complete', paymentController.razorpayComplete);

router.use(authenticate);

router.post('/bookings/:id/initiate', paymentController.initiateBookingPayment);
router.post('/bookings/:id/sync', paymentController.syncBookingPayment);
router.post('/orders/:id/initiate', paymentController.initiateOrderPayment);
router.post('/orders/:id/sync', paymentController.syncOrderPayment);
router.get('/orders/:id/status', paymentController.getOrderPaymentStatus);
router.post('/razorpay/verify', validate(verifyPaymentSchema), paymentController.verifyPayment);

export default router;
