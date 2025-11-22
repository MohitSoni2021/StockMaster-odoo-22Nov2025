import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: [true, 'Please provide a product SKU'],
    unique: true,
    trim: true,
    uppercase: true,
    minlength: [5, 'SKU must be at least 5 characters long'],
    maxlength: [50, 'SKU cannot exceed 50 characters']
  },
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Please provide a product category'],
    trim: true,
    maxlength: [100, 'Category cannot exceed 100 characters']
  },
  defaultUom: {
    type: String,
    required: [true, 'Please provide a unit of measurement'],
    trim: true,
    maxlength: [20, 'UOM cannot exceed 20 characters'],
    enum: ['PIECE', 'KG', 'LTR', 'MTR', 'BOX', 'PACK', 'CASE', 'BUNDLE', 'UNIT', 'OTHER'],
    default: 'PIECE'
  },
  perUnitCost: {
    type: Number,
    required: [true, 'Please provide per unit cost'],
    min: [0, 'Per unit cost cannot be negative'],
    set: v => Math.round(v * 100) / 100
  },
  reorderPoint: {
    type: Number,
    required: [true, 'Please provide reorder point'],
    min: [0, 'Reorder point cannot be negative'],
    default: 10
  },
  reorderQty: {
    type: Number,
    required: [true, 'Please provide reorder quantity'],
    min: [1, 'Reorder quantity must be at least 1'],
    default: 50
  },
  isActive: {
    type: Boolean,
    default: true
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

productSchema.index({ sku: 1 });
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
