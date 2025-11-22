import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  loginid: {
    type: String,
    required: [true, 'Please provide a loginid'],
    unique: true,
    trim: true,
    minlength: [6, 'Loginid must be at least 6 characters long'],
    maxlength: [12, 'Loginid must be at most 12 characters long'],
    match: [
      /^[a-zA-Z0-9._-]+$/,
      'Loginid can only contain letters, numbers, dots, underscores, and hyphens',
    ],
    validate: {
      validator: function(v) {
        // Check for leading/trailing dots, underscores, or hyphens
        if (/^[._-]|[._-]$/.test(v)) {
          return false;
        }
        // Check for consecutive special characters
        if (/[._-]{2,}/.test(v)) {
          return false;
        }
        return true;
      },
      message: 'Loginid cannot start or end with special characters and cannot contain consecutive special characters'
    }
  },
  loginidLower: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    select: false,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
      'Please provide a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'staff', 'auditor', 'supervisor'],
    required: [true, 'Please provide a role'],
  },
  warehouses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
    }
  ],
  warehouseAssigned: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    default: null
  },
  otp: {
    type: String,
    select: false,
  },
  otpExpiresAt: {
    type: Date,
    select: false,
  },
  resetPasswordToken: {
    type: String,
    select: false,
  },
  resetPasswordExpiresAt: {
    type: Date,
    select: false,
  },
  isPasswordResetRequested: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save middleware to set loginidLower and validate reserved names
userSchema.pre('save', function() {
  // Set loginidLower for case-insensitive uniqueness
  this.loginidLower = this.loginid.toLowerCase();

  // Reserved names list
  const reservedNames = ['admin', 'root', 'support', 'null', 'system', 'api', 'user', 'guest', 'test', 'demo'];

  if (reservedNames.includes(this.loginidLower)) {
    throw new Error('This loginid is reserved and cannot be used');
  }
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;