import express from 'express';
import {
  createUser,
  assignWarehouse,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getDashboardStats,
  getAllDocuments,
  getDocumentById,
  updateDocumentStatus,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('admin'));

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// User management
router.post('/users', createUser);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/warehouse', assignWarehouse);

// Document management
router.get('/documents', getAllDocuments);
router.get('/documents/:id', getDocumentById);
router.put('/documents/:id/status', updateDocumentStatus);

export default router;
