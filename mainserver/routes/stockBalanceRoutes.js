import express from 'express';
import {
  getStockBalances,
  getStockBalance,
  createStockBalance,
  updateStockBalance,
  updateQuantity,
  deleteStockBalance,
  getStockBalanceByProduct,
  getStockBalanceByWarehouse,
  getLowStockProducts
} from '../controllers/stockBalanceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getStockBalances)
  .post(createStockBalance);

router.get('/low-stock', getLowStockProducts);

router.route('/:id')
  .get(getStockBalance)
  .put(updateStockBalance)
  .delete(deleteStockBalance);

router.patch('/:id/quantity', updateQuantity);

router.get('/product/:productId', getStockBalanceByProduct);

router.get('/warehouse/:warehouseId', getStockBalanceByWarehouse);

export default router;
