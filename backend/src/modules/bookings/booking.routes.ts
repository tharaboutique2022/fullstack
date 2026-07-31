import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { validate, validateQuery } from '../../middleware/errorHandler';
import * as bookingController from './booking.controller';
import {
  createBookingSchema,
  cancelBookingSchema,
  listAdminBookingsQuerySchema,
  updateBookingStatusSchema,
  rescheduleBookingSchema,
  updateBookingPaymentSchema,
} from './booking.validation';

const router = Router();

router.use(authenticate);

router.get('/', bookingController.listBookings);
router.get('/:id', bookingController.getBooking);
router.post('/:id/reschedule', validate(rescheduleBookingSchema), bookingController.rescheduleBooking);
router.post('/:id/cancel', validate(cancelBookingSchema), bookingController.cancelBooking);
router.post('/', validate(createBookingSchema), bookingController.createBooking);

export const adminRouter = Router();

adminRouter.get(
  '/',
  validateQuery(listAdminBookingsQuerySchema),
  bookingController.listAdminBookings
);
adminRouter.get('/:id', bookingController.getAdminBooking);
adminRouter.patch(
  '/:id/payment',
  validate(updateBookingPaymentSchema),
  bookingController.updateBookingPayment
);
adminRouter.patch(
  '/:id/status',
  validate(updateBookingStatusSchema),
  bookingController.updateBookingStatus
);

export default router;
