import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import { getRouteParam } from '../../utils/routeParams';
import { getValidatedBody, getValidatedQuery } from '../../utils/validatedRequest';
import type { CreateOrderInput, CancelOrderInput, ListAdminOrdersQuery, UpdateOrderStatusInput } from './order.validation';
import * as orderService from './order.service';
import * as paymentService from '../payments/payment.service';

export const getCheckoutQuote = asyncHandler(async (req: Request, res: Response) => {
  const couponCode = typeof req.query.couponCode === 'string' ? req.query.couponCode : undefined;
  const quote = await orderService.getCheckoutQuote(req.user!.id, couponCode);
  sendSuccess(res, quote, 'Checkout quote fetched successfully');
});

export const listOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await orderService.listOrders(req.user!.id);
  sendSuccess(res, orders, 'Orders fetched successfully');
});

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getOrderById(req.user!.id, getRouteParam(req.params.id));
  sendSuccess(res, order, 'Order fetched successfully');
});

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.createOrderFromCart(
    req.user!.id,
    getValidatedBody<CreateOrderInput>(req)
  );

  try {
    const payment = await paymentService.initiateOrderPayment(req.user!.id, order.id);
    sendSuccess(res, { order, payment }, 'Order placed successfully', 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Payment could not be started';
    sendSuccess(
      res,
      { order, payment: null, paymentError: message },
      'Order placed. Payment could not be started — retry from order details.',
      201
    );
  }
});

export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.cancelOrderByUser(
    req.user!.id,
    getRouteParam(req.params.id),
    getValidatedBody<CancelOrderInput>(req)
  );
  sendSuccess(res, order, 'Order cancelled successfully');
});

export const listAdminOrders = asyncHandler(async (req: Request, res: Response) => {
  const result = await orderService.listAdminOrders(getValidatedQuery<ListAdminOrdersQuery>(req));
  sendSuccess(res, result, 'Orders fetched successfully');
});

export const getAdminOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getAdminOrderById(getRouteParam(req.params.id));
  sendSuccess(res, order, 'Order fetched successfully');
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.updateOrderStatus(
    getRouteParam(req.params.id),
    getValidatedBody<UpdateOrderStatusInput>(req)
  );
  sendSuccess(res, order, 'Order status updated successfully');
});
