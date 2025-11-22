import express from 'express';
import {
  getDashboardKPIs,
  getReceiptDocuments,
  getDeliveryDocuments,
  getTransferDocuments,
  getAdjustmentDocuments,
  getPendingApprovals,
  approveDocument,
  rejectDocument,
  completeDocument,
  cancelDocument,
  getStockLedger,
  getStockBalance,
  getWarehouseStockSummary,
  assignTaskToStaff,
  getReorderPointItems
} from '../controllers/inventoryManagerController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard/kpis', getDashboardKPIs);

router.get('/receipts', getReceiptDocuments);
router.get('/deliveries', getDeliveryDocuments);
router.get('/transfers', getTransferDocuments);
router.get('/adjustments', getAdjustmentDocuments);

router.get('/pending-approvals', getPendingApprovals);
router.put('/:id/approve', approveDocument);
router.put('/:id/reject', rejectDocument);
router.put('/:id/complete', completeDocument);
router.put('/:id/cancel', cancelDocument);

router.get('/ledger', getStockLedger);
router.get('/stock-balance', getStockBalance);
router.get('/warehouse/:warehouseId/summary', getWarehouseStockSummary);

router.post('/:id/assign-task', assignTaskToStaff);

router.get('/reorder/items', getReorderPointItems);

export default router;
