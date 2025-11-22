import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: [true, 'Please provide a warehouse reference']
  },
  name: {
    type: String,
    required: [true, 'Please provide a location name'],
    trim: true,
    maxlength: [100, 'Location name cannot exceed 100 characters']
  },
  shortCode: {
    type: String,
    required: [true, 'Please provide a location short code'],
    trim: true,
    maxlength: [20, 'Short code cannot exceed 20 characters']
  },
  type: {
    type: String,
    required: [true, 'Please provide location type'],
    enum: {
      values: ['rack', 'room', 'bin', 'floor', 'zone'],
      message: 'Location type must be one of: rack, room, bin, floor, zone'
    }
  },
  capacity: {
    type: Number,
    min: [0, 'Capacity cannot be negative'],
    default: 0
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

// Compound index to ensure shortCode uniqueness per warehouse
locationSchema.index({ warehouse: 1, shortCode: 1 }, { unique: true });
locationSchema.index({ warehouse: 1, isActive: 1 });
locationSchema.index({ type: 1 });

// Pre-save middleware to validate warehouse exists and is active
locationSchema.pre('save', async function() {
  const Warehouse = mongoose.model('Warehouse');
  const warehouse = await Warehouse.findById(this.warehouse);

  if (!warehouse) {
    throw new Error('Referenced warehouse does not exist');
  }

  if (!warehouse.isActive) {
    throw new Error('Cannot create location for inactive warehouse');
  }
});

const Location = mongoose.model('Location', locationSchema);

export default Location;