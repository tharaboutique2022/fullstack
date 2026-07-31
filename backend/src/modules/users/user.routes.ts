import { Router } from 'express';
import * as userController from './user.controller';

const router = Router();

router.get('/', userController.listCustomers);

export default router;
