import express from 'express';
import {
  createUser,
  assignWarehouse,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.post('/users', createUser);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/warehouse', assignWarehouse);

export default router;
