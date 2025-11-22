import express from 'express';
import {
  getStockLedgers,
  getStockLedger,
  createStockLedger,
  updateStockLedger,
  deleteStockLedger,
  getStockLedgerStats,
  getStockMovementHistory
} from '../controllers/stockLedgerController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getStockLedgers)
  .post(createStockLedger);

router.get('/stats/overview', getStockLedgerStats);
router.get('/history/movements', getStockMovementHistory);

router.route('/:id')
  .get(getStockLedger)
  .put(updateStockLedger)
  .delete(deleteStockLedger);

export default router;
