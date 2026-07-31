import { Router } from 'express';
import * as productController from './product.controller';
import {
  categorySchema,
  productSchema,
  listCategoriesQuerySchema,
  listCatalogQuerySchema,
} from '../catalog/catalog.validation';
import { validate, validateQuery } from '../../middleware/errorHandler';

const listProductsQuerySchema = listCatalogQuerySchema;

export const publicRouter = Router();
export const adminRouter = Router();

publicRouter.get(
  '/categories/products',
  validateQuery(listCategoriesQuerySchema),
  productController.listCategories
);
publicRouter.get('/products', validateQuery(listProductsQuerySchema), productController.listProducts);
publicRouter.get('/products/:id', productController.getProduct);

adminRouter.get(
  '/product-categories',
  validateQuery(listCategoriesQuerySchema),
  productController.listCategories
);
adminRouter.post('/product-categories', validate(categorySchema), productController.createCategory);
adminRouter.put(
  '/product-categories/:id',
  validate(categorySchema.partial()),
  productController.updateCategory
);
adminRouter.delete('/product-categories/:id', productController.deleteCategory);

adminRouter.get('/products', validateQuery(listProductsQuerySchema), productController.listProducts);
adminRouter.post('/products', validate(productSchema), productController.createProduct);
adminRouter.put('/products/:id', validate(productSchema.partial()), productController.updateProduct);
adminRouter.delete('/products/:id', productController.deleteProduct);
