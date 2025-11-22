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
  address: {
    line1: {
      type: String,
      required: [true, 'Please provide address line 1'],
      trim: true,
      maxlength: [150, 'Address line 1 cannot exceed 150 characters']
    },
    line2: {
      type: String,
      trim: true,
      maxlength: [150, 'Address line 2 cannot exceed 150 characters'],
      default: ''
    },
    city: {
      type: String,
      required: [true, 'Please provide city'],
      trim: true,
      maxlength: [50, 'City cannot exceed 50 characters']
    },
    state: {
      type: String,
      required: [true, 'Please provide state'],
      trim: true,
      maxlength: [50, 'State cannot exceed 50 characters']
    },
    postalCode: {
      type: String,
      required: [true, 'Please provide postal code'],
      trim: true,
      maxlength: [20, 'Postal code cannot exceed 20 characters']
    },
    country: {
      type: String,
      required: [true, 'Please provide country'],
      trim: true,
      maxlength: [50, 'Country cannot exceed 50 characters']
    }
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