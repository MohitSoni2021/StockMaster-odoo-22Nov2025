import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sendEmail } from '../utils/sendEmail.js';

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const register = async (req, res, next) => {
  try {
    const { loginid, email, password } = req.body;
    const role = "user";

    // Validate required fields
    if (!loginid || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide loginid, email, and password',
      });
    }

    // Check if user already exists with this email
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Check if user already exists with this loginid
    const existingUserByLoginid = await User.findOne({ loginidLower: loginid.toLowerCase() });
    if (existingUserByLoginid) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this loginid',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = await User.create({
      loginid,
      email,
      password: hashedPassword,
      role: role || 'user',
    });

    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // Remove password from output
    user.password = undefined;

    res.status(201).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Add more authentication methods (login, getMe, etc.) as needed
export const login = async (req, res, next) => {
  try {
    const { loginid, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ loginidLower: loginid.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // Remove password from output
    user.password = undefined;

    res.status(200).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Get current logged in user
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Forgot Password - Generate OTP and send email
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address',
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email address',
      });
    }

    // Generate OTP (6 digits)
    const otp = generateOTP();

    // OTP expires in 10 minutes
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP and expiry to user
    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    user.isPasswordResetRequested = true;
    await user.save();

    // Send email using the email utility
    try {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password. Your OTP (One Time Password) is:</p>
          <p style="font-size: 24px; font-weight: bold; color: #4F46E5; text-align: center; padding: 20px; background-color: #f0f0f0; border-radius: 4px;">
            ${otp}
          </p>
          <p>This OTP will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 12px;">If you didn't request a password reset, please ignore this email.</p>
          <p style="color: #666; font-size: 12px;">Do not share this OTP with anyone.</p>
        </div>
      `;

      const textContent = `Your password reset OTP is: ${otp}\n\nThis OTP will expire in 10 minutes.\n\nIf you didn't request a password reset, please ignore this email.`;

      const emailResult = await sendEmail(
        email,
        htmlContent,
        textContent,
        'Password Reset OTP - Odoo Spit',
        'Odoo Spit'
      );

      if (!emailResult.success) {
        throw new Error(emailResult.error || 'Failed to send OTP email');
      }

      res.status(200).json({
        success: true,
        message: 'OTP has been sent to your email address',
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Reset OTP and password reset flag if email fails
      user.otp = undefined;
      user.otpExpiresAt = undefined;
      user.isPasswordResetRequested = false;
      await user.save();

      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.',
      });
    }
  } catch (error) {
    next(error);
  }
};

// Reset Password - Verify OTP and update password
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Find user
    const user = await User.findOne({ email }).select('+otp +otpExpiresAt');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if OTP exists and has not expired
    if (!user.otp) {
      return res.status(400).json({
        success: false,
        message: 'No password reset request found. Please request a new OTP.',
      });
    }

    if (user.otpExpiresAt < new Date()) {
      user.otp = undefined;
      user.otpExpiresAt = undefined;
      user.isPasswordResetRequested = false;
      await user.save();

      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.',
      });
    }

    // Verify OTP
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear OTP
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    user.isPasswordResetRequested = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    next(error);
  }
};
