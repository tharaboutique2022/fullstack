import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/errorHandler';
import * as cartController from './cart.controller';
import { addCartItemSchema, updateCartItemSchema, mergeCartSchema } from './cart.validation';

const router = Router();

router.use(authenticate);

router.post('/merge', validate(mergeCartSchema), cartController.mergeCart);
router.get('/', cartController.getCart);
router.post('/items', validate(addCartItemSchema), cartController.addCartItem);
router.patch('/items/:id', validate(updateCartItemSchema), cartController.updateCartItem);
router.delete('/items/:id', cartController.removeCartItem);
router.delete('/', cartController.clearCart);

export default router;
