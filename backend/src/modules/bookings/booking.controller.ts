import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import { getRouteParam } from '../../utils/routeParams';
import { getValidatedBody, getValidatedQuery } from '../../utils/validatedRequest';
import type {
  CancelBookingInput,
  CreateBookingInput,
  ListAdminBookingsQuery,
  UpdateBookingStatusInput,
  RescheduleBookingInput,
  UpdateBookingPaymentInput,
} from './booking.validation';
import * as bookingService from './booking.service';

export const listBookings = asyncHandler(async (req: Request, res: Response) => {
  const bookings = await bookingService.listBookings(req.user!.id);
  sendSuccess(res, bookings, 'Bookings fetched successfully');
});

export const createBooking = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingService.createBooking(
    req.user!.id,
    getValidatedBody<CreateBookingInput>(req)
  );
  sendSuccess(res, booking, 'Booking created successfully', 201);
});

export const getBooking = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingService.getBookingById(req.user!.id, getRouteParam(req.params.id));
  sendSuccess(res, booking, 'Booking fetched successfully');
});

export const cancelBooking = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingService.cancelBookingByUser(
    req.user!.id,
    getRouteParam(req.params.id),
    getValidatedBody<CancelBookingInput>(req)
  );
  sendSuccess(res, booking, 'Booking cancelled successfully');
});

export const listAdminBookings = asyncHandler(async (req: Request, res: Response) => {
  const result = await bookingService.listAdminBookings(
    getValidatedQuery<ListAdminBookingsQuery>(req)
  );
  sendSuccess(res, result, 'Bookings fetched successfully');
});

export const getAdminBooking = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingService.getAdminBookingById(getRouteParam(req.params.id));
  sendSuccess(res, booking, 'Booking fetched successfully');
});

export const rescheduleBooking = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingService.rescheduleBookingByUser(
    req.user!.id,
    getRouteParam(req.params.id),
    getValidatedBody<RescheduleBookingInput>(req)
  );
  sendSuccess(res, booking, 'Booking rescheduled successfully');
});

export const updateBookingPayment = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingService.updateBookingPayment(
    getRouteParam(req.params.id),
    getValidatedBody(req)
  );
  sendSuccess(res, booking, 'Booking payment updated successfully');
});

export const updateBookingStatus = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingService.updateBookingStatus(
    getRouteParam(req.params.id),
    getValidatedBody<UpdateBookingStatusInput>(req)
  );
  sendSuccess(res, booking, 'Booking status updated successfully');
});
