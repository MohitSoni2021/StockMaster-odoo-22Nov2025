import mongoose from 'mongoose';

const contactSubSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  mobileNo: {
    type: String,
    trim: true
  },
  address: {
    line1: { type: String, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    country: { type: String, trim: true, default: 'IN' }
  },
  type: {
    type: String,
    enum: ['vendor', 'customer', 'internal'],
    default: 'vendor'
  },
  meta: { type: mongoose.Schema.Types.Mixed }
}, { _id: false });

const documentSchema = new mongoose.Schema({
  reference: {
    type: String,
    unique: true,
    required: [true, 'Please provide a document reference']
  },
  type: {
    type: String,
    enum: ['RECEIPT', 'DELIVERY', 'TRANSFER', 'ADJUSTMENT'],
    required: [true, 'Please provide a document type']
  },
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: [true, 'Please select a warehouse']
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  },
  toWarehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse'
  },
  fromLocation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  },
  toLocation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  },
  contact: { type: contactSubSchema, required: false },
  contactRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  },
  responsible: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  scheduleDate: Date,
  status: {
    type: String,
    enum: ['DRAFT', 'WAITING', 'READY', 'DONE', 'CANCELED'],
    default: 'DRAFT'
  },
  notes: String,
  meta: mongoose.Schema.Types.Mixed,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  validatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  validatedAt: Date
}, {
  timestamps: true
});

documentSchema.index({ type: 1, status: 1, scheduleDate: 1 });
documentSchema.index({ warehouse: 1 });
documentSchema.index({ status: 1 });

const Document = mongoose.model('Document', documentSchema);

export default Document;
