import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  name: {
    type: String,
    required: [true, 'Please provide a contact name'],
    trim: true,
    maxlength: [100, 'Contact name cannot exceed 100 characters']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [
      /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
      'Please provide a valid email'
    ]
  },
  mobileNo: {
    type: String,
    trim: true,
    maxlength: [20, 'Mobile number cannot exceed 20 characters']
  },
  address: {
    line1: {
      type: String,
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
      trim: true,
      maxlength: [100, 'City cannot exceed 100 characters']
    },
    state: {
      type: String,
      trim: true,
      maxlength: [100, 'State cannot exceed 100 characters']
    },
    postalCode: {
      type: String,
      trim: true,
      maxlength: [20, 'Postal code cannot exceed 20 characters']
    },
    country: {
      type: String,
      trim: true,
      maxlength: [100, 'Country cannot exceed 100 characters'],
      default: 'IN'
    }
  },
  type: {
    type: String,
    enum: ['vendor', 'customer', 'internal'],
    default: 'vendor'
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

contactSchema.index({ type: 1, isActive: 1 });
contactSchema.index({ email: 1 });
contactSchema.index({ mobileNo: 1 });

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;
