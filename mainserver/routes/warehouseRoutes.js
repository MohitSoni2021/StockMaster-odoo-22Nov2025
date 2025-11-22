import express from 'express';
import {
  getWarehouses,
  getWarehouse,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getWarehouseStats,
  getWarehouseDetails
} from '../controllers/warehouseController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Routes
router.route('/')
  .get(getWarehouses)
  .post(createWarehouse);

// Statistics route
router.get('/stats/overview', getWarehouseStats);

// Warehouse details with locations
router.get('/:id/details', getWarehouseDetails);

router.route('/:id')
  .get(getWarehouse)
  .put(updateWarehouse)
  .delete(deleteWarehouse);

export default router;