// products-service/src/routes/productsRoutes.js
import { Router } from 'express';
import {
  createProduct,
  deleteProduct,
  readProduct,
  readAllProducts,
  updateProduct,
  readAllLeads,
} from '../controllers/productsController.js';

const router = Router();

router.put('/update-product/:id', updateProduct);
router.delete('/delete-product/:id', deleteProduct);
router.get('/read-product/:id', readProduct);
router.get('/read-all-products', readAllProducts);
router.post('/create-product', createProduct);
router.get('/read-all-leads', readAllLeads);

export default router;
