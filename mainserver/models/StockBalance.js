import mongoose from 'mongoose';

const stockBalanceSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Please provide a product']
  },
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: [true, 'Please provide a warehouse']
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    default: null
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide quantity'],
    min: [0, 'Quantity cannot be negative'],
    default: 0,
    set: v => Math.round(v * 100) / 100
  },
  reservedQuantity: {
    type: Number,
    required: [true, 'Please provide reserved quantity'],
    min: [0, 'Reserved quantity cannot be negative'],
    default: 0,
    set: v => Math.round(v * 100) / 100
  },
  lastUpdatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

stockBalanceSchema.index({ product: 1, warehouse: 1, location: 1 }, { unique: true });
stockBalanceSchema.index({ product: 1 });
stockBalanceSchema.index({ warehouse: 1 });
stockBalanceSchema.index({ location: 1 });

stockBalanceSchema.virtual('availableQuantity').get(function() {
  return this.quantity - this.reservedQuantity;
});

stockBalanceSchema.set('toJSON', { virtuals: true });
stockBalanceSchema.set('toObject', { virtuals: true });

const StockBalance = mongoose.model('StockBalance', stockBalanceSchema);

export default StockBalance;
