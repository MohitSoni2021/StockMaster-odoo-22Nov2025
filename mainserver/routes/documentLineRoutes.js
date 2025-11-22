import express from 'express';
import {
  getDocumentLines,
  getDocumentLine,
  createDocumentLine,
  updateDocumentLine,
  deleteDocumentLine,
  updateLineStatus,
  getDocumentLinesByDocument
} from '../controllers/documentLineController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getDocumentLines)
  .post(createDocumentLine);

router.get('/document/:documentId', getDocumentLinesByDocument);

router.put('/:id/status', updateLineStatus);

router.route('/:id')
  .get(getDocumentLine)
  .put(updateDocumentLine)
  .delete(deleteDocumentLine);

export default router;
