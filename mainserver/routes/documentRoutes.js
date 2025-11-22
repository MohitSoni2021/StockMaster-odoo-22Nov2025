import express from 'express';
import {
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  validateDocument,
  updateDocumentStatus,
  getDocumentStats
} from '../controllers/documentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getDocuments)
  .post(createDocument);

router.get('/stats/overview', getDocumentStats);

router.put('/:id/validate', validateDocument);
router.put('/:id/status', updateDocumentStatus);

router.route('/:id')
  .get(getDocument)
  .put(updateDocument)
  .delete(deleteDocument);

export default router;
