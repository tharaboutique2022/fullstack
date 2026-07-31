import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/errorHandler';
import * as wishlistController from './wishlist.controller';
import { wishlistProductSchema } from './wishlist.validation';

const router = Router();

router.use(authenticate);

router.get('/', wishlistController.listWishlist);
router.post('/', validate(wishlistProductSchema), wishlistController.addToWishlist);
router.get('/:productId/status', wishlistController.getWishlistStatus);
router.delete('/:productId', wishlistController.removeFromWishlist);

export default router;
