import mongoose from 'mongoose';

const stockLedgerSchema = new mongoose.Schema({
  reference: {
    type: String,
    unique: true,
    required: [true, 'Please provide a ledger reference']
  },
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  },
  documentLine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DocumentLine'
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Please provide a product']
  },
  fromWarehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse'
  },
  fromLocation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  },
  toWarehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse'
  },
  toLocation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide quantity'],
    set: v => Math.round(v * 100) / 100
  },
  movementType: {
    type: String,
    enum: ['IN', 'OUT', 'TRANSFER', 'ADJUSTMENT'],
    required: [true, 'Please provide a movement type']
  },
  beforeQty: {
    type: Number,
    required: [true, 'Please provide before quantity'],
    set: v => Math.round(v * 100) / 100
  },
  afterQty: {
    type: Number,
    required: [true, 'Please provide after quantity'],
    set: v => Math.round(v * 100) / 100
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide the user who performed this action']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  meta: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

stockLedgerSchema.index({ product: 1, timestamp: -1 });
stockLedgerSchema.index({ fromWarehouse: 1, timestamp: -1 });
stockLedgerSchema.index({ toWarehouse: 1, timestamp: -1 });
stockLedgerSchema.index({ movementType: 1, timestamp: -1 });
stockLedgerSchema.index({ document: 1 });
stockLedgerSchema.index({ performedBy: 1 });

const StockLedger = mongoose.model('StockLedger', stockLedgerSchema);

export default StockLedger;
