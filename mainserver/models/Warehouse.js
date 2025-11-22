import mongoose from 'mongoose';

const warehouseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a warehouse name'],
    trim: true,
    maxlength: [100, 'Warehouse name cannot exceed 100 characters']
  },
  shortCode: {
    type: String,
    required: [true, 'Please provide a warehouse short code'],
    unique: true,
    trim: true,
    uppercase: true,
    minlength: [2, 'Short code must be at least 2 characters long'],
    maxlength: [10, 'Short code cannot exceed 10 characters'],
    match: [
      /^[A-Z0-9]+$/,
      'Short code can only contain uppercase letters and numbers'
    ]
  },
  address: {
    line1: {
      type: String,
      required: [true, 'Please provide address line 1'],
      trim: true,
      maxlength: [200, 'Address line 1 cannot exceed 200 characters']
    },
    line2: {
      type: String,
      trim: true,
      maxlength: [200, 'Address line 2 cannot exceed 200 characters']
    },
    city: {
      type: String,
      required: [true, 'Please provide city'],
      trim: true,
      maxlength: [100, 'City cannot exceed 100 characters']
    },
    state: {
      type: String,
      required: [true, 'Please provide state'],
      trim: true,
      maxlength: [100, 'State cannot exceed 100 characters']
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
      maxlength: [100, 'Country cannot exceed 100 characters']
    }
  },
  contact: {
    name: {
      type: String,
      required: [true, 'Please provide contact name'],
      trim: true,
      maxlength: [100, 'Contact name cannot exceed 100 characters']
    },
    phone: {
      type: String,
      required: [true, 'Please provide contact phone'],
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide contact email'],
      trim: true,
      lowercase: true,
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        'Please provide a valid email'
      ]
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

// Index for better query performance
warehouseSchema.index({ isActive: 1 });
warehouseSchema.index({ 'address.city': 1, 'address.state': 1 });

const Warehouse = mongoose.model('Warehouse', warehouseSchema);

export default Warehouse;