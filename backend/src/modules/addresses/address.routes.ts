import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/errorHandler';
import * as addressController from './address.controller';
import { addressSchema } from './address.validation';

const router = Router();

router.use(authenticate);

router.get('/', addressController.listAddresses);
router.get('/default', addressController.getDefaultAddress);
router.post('/', validate(addressSchema), addressController.createAddress);
router.put('/:id', validate(addressSchema.partial()), addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);

export default router;
