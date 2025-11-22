import express from 'express';
import {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  getContactsByType
} from '../controllers/contactController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getContacts)
  .post(createContact);

router.get('/type/:type', getContactsByType);

router.route('/:id')
  .get(getContact)
  .put(updateContact)
  .delete(deleteContact);

export default router;
