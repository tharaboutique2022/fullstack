import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { corsOptions } from './config/cors';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { authenticate, authorize } from './middleware/auth';
import authRoutes from './modules/auth/auth.routes';
import cartRoutes from './modules/cart/cart.routes';
import orderRoutes, { adminRouter as orderAdminRouter } from './modules/orders/order.routes';
import bookingRoutes, { adminRouter as bookingAdminRouter } from './modules/bookings/booking.routes';
import addressRoutes from './modules/addresses/address.routes';
import * as productRoutes from './modules/products/product.routes';
import * as serviceRoutes from './modules/services/service.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import reviewRoutes from './modules/reviews/review.routes';
import wishlistRoutes from './modules/wishlist/wishlist.routes';
import { couponRouter, couponAdminRouter } from './modules/coupons/coupon.routes';
import userAdminRoutes from './modules/users/user.routes';
import paymentRoutes from './modules/payments/payment.routes';
import { sendSuccess } from './utils/apiResponse';

const app = express();

app.use(requestLogger);
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  sendSuccess(res, { status: 'ok' as const }, 'API is healthy');
});

app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/coupons', couponRouter);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api', productRoutes.publicRouter);
app.use('/api', serviceRoutes.publicRouter);

app.use('/api/admin', authenticate, authorize('admin'), productRoutes.adminRouter);
app.use('/api/admin', authenticate, authorize('admin'), serviceRoutes.adminRouter);
app.use('/api/admin/users', authenticate, authorize('admin'), userAdminRoutes);
app.use('/api/admin/coupons', authenticate, authorize('admin'), couponAdminRouter);
app.use('/api/admin/orders', authenticate, authorize('admin'), orderAdminRouter);
app.use('/api/admin/bookings', authenticate, authorize('admin'), bookingAdminRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
