import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { validate, validateQuery } from '../../middleware/errorHandler';
import * as orderController from './order.controller';
import {
  createOrderSchema,
  cancelOrderSchema,
  listAdminOrdersQuerySchema,
  updateOrderStatusSchema,
} from './order.validation';

const router = Router();

router.use(authenticate);

router.get('/checkout-quote', orderController.getCheckoutQuote);
router.get('/', orderController.listOrders);
router.get('/:id', orderController.getOrder);
router.post('/:id/cancel', validate(cancelOrderSchema), orderController.cancelOrder);
router.post('/', validate(createOrderSchema), orderController.createOrder);

export const adminRouter = Router();

adminRouter.get(
  '/',
  validateQuery(listAdminOrdersQuerySchema),
  orderController.listAdminOrders
);
adminRouter.get('/:id', orderController.getAdminOrder);
adminRouter.patch(
  '/:id/status',
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

export default router;
