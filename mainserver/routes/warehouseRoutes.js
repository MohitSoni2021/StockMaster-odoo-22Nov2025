import express from 'express';
import {
  getWarehouses,
  getWarehouse,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getWarehouseStats
} from '../controllers/warehouseController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Routes
router.route('/')
  .get(getWarehouses)
  .post(createWarehouse);

router.route('/:id')
  .get(getWarehouse)
  .put(updateWarehouse)
  .delete(deleteWarehouse);

// Statistics route
router.get('/stats/overview', getWarehouseStats);

export default router;