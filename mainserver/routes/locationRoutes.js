import express from 'express';
import {
  getLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
  getLocationsByWarehouse,
  getLocationStats
} from '../controllers/locationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Routes
router.route('/')
  .get(getLocations)
  .post(createLocation);

router.route('/:id')
  .get(getLocation)
  .put(updateLocation)
  .delete(deleteLocation);

// Get locations by warehouse
router.get('/warehouse/:warehouseId', getLocationsByWarehouse);

// Statistics route
router.get('/stats/overview', getLocationStats);

export default router;