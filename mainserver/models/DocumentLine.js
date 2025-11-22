import mongoose from 'mongoose';

const documentLineSchema = new mongoose.Schema({
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: [true, 'Please provide a document reference']
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Please select a product']
  },
  uom: {
    type: String,
    required: [true, 'Please provide a unit of measure'],
    enum: ['PIECE', 'KG', 'LTR', 'MTR', 'BOX', 'PACK', 'CASE', 'BUNDLE', 'UNIT', 'OTHER'],
    default: 'PIECE'
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide a quantity'],
    min: [0, 'Quantity cannot be negative']
  },
  unitCost: {
    type: Number,
    min: [0, 'Unit cost cannot be negative'],
    set: v => Math.round(v * 100) / 100
  },
  status: {
    type: String,
    enum: ['PENDING', 'PARTIAL', 'FULFILLED'],
    default: 'PENDING'
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

documentLineSchema.index({ document: 1 });
documentLineSchema.index({ product: 1 });
documentLineSchema.index({ status: 1 });

const DocumentLine = mongoose.model('DocumentLine', documentLineSchema);

export default DocumentLine;
