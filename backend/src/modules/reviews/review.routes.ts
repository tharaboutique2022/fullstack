import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/errorHandler';
import * as reviewController from './review.controller';
import { createProductReviewSchema, createServiceReviewSchema } from './review.validation';

const router = Router();

router.get('/products/:productId', reviewController.listProductReviews);
router.get('/providers/:providerId', reviewController.listProviderReviews);

router.use(authenticate);
router.post('/products', validate(createProductReviewSchema), reviewController.createProductReview);
router.post('/services', validate(createServiceReviewSchema), reviewController.createServiceReview);

export default router;
