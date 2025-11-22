import express from 'express';
import {
  getAssignedTasks,
  getTaskDetail,
  performReceipt,
  performDelivery,
  performTransfer,
  performStockCount,
  searchProduct,
  getLocationStock,
  getStaffDashboard,
  updateTaskStatus
} from '../controllers/staffController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getStaffDashboard);

router.get('/tasks', getAssignedTasks);
router.get('/tasks/:id', getTaskDetail);
router.put('/tasks/:id/status', updateTaskStatus);

router.post('/receipts/:documentId/perform', performReceipt);
router.post('/deliveries/:documentId/perform', performDelivery);
router.post('/transfers/:documentId/perform', performTransfer);
router.post('/stock-counts/:documentId/perform', performStockCount);

router.get('/product/search', searchProduct);
router.get('/locations/:locationId/stock', getLocationStock);

export default router;
