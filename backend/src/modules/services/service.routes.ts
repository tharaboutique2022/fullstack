import { Router } from 'express';
import { z } from 'zod';
import * as serviceController from './service.controller';
import { paginationSchema, categorySchema } from '../catalog/catalog.validation';
import { serviceProviderSchema } from './provider.validation';
import { validate, validateQuery } from '../../middleware/errorHandler';

const listProvidersQuerySchema = paginationSchema.extend({
  categoryId: z.string().uuid().optional(),
  search: z.string().trim().min(1).optional(),
});

export const publicRouter = Router();
export const adminRouter = Router();

publicRouter.get(
  '/categories/services',
  validateQuery(paginationSchema),
  serviceController.listCategories
);
publicRouter.get(
  '/service-providers',
  validateQuery(listProvidersQuerySchema),
  serviceController.listProviders
);
publicRouter.get('/service-providers/:id', serviceController.getProvider);
publicRouter.get('/service-providers/:id/time-slots', serviceController.listProviderTimeSlots);

// Backward-compatible aliases
publicRouter.get('/services', validateQuery(listProvidersQuerySchema), serviceController.listProviders);
publicRouter.get('/services/:id', serviceController.getProvider);

adminRouter.get('/service-categories', serviceController.listCategories);
adminRouter.post('/service-categories', validate(categorySchema), serviceController.createCategory);
adminRouter.put(
  '/service-categories/:id',
  validate(categorySchema.partial()),
  serviceController.updateCategory
);
adminRouter.delete('/service-categories/:id', serviceController.deleteCategory);

adminRouter.get(
  '/service-providers',
  validateQuery(listProvidersQuerySchema),
  serviceController.listProviders
);
adminRouter.post('/service-providers', validate(serviceProviderSchema), serviceController.createProvider);
adminRouter.put(
  '/service-providers/:id',
  validate(serviceProviderSchema.partial()),
  serviceController.updateProvider
);
adminRouter.delete('/service-providers/:id', serviceController.deleteProvider);
adminRouter.get('/service-providers/:id/time-slots', serviceController.listProviderTimeSlots);

// Backward-compatible aliases
adminRouter.get('/services', validateQuery(listProvidersQuerySchema), serviceController.listProviders);
adminRouter.post('/services', validate(serviceProviderSchema), serviceController.createProvider);
adminRouter.put('/services/:id', validate(serviceProviderSchema.partial()), serviceController.updateProvider);
adminRouter.delete('/services/:id', serviceController.deleteProvider);
