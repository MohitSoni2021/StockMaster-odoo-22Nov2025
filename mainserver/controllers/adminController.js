import User from '../models/User.js';
import bcrypt from 'bcryptjs';

export const createUser = async (req, res, next) => {
  try {
    const { loginid, email, password, role, warehouseAssigned } = req.body;

    if (!loginid || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide loginid, email, password, and role',
      });
    }

    const validRoles = ['admin', 'manager', 'staff', 'auditor', 'supervisor'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
      });
    }

    // If warehouseAssigned is provided, verify it exists and belongs to the current admin
    if (warehouseAssigned) {
      const Warehouse = (await import('../models/Warehouse.js')).default;
      const warehouse = await Warehouse.findById(warehouseAssigned);
      
      if (!warehouse) {
        return res.status(404).json({
          success: false,
          message: 'Warehouse not found',
        });
      }

      // Check if the warehouse belongs to the current admin
      if (!warehouse.owner || warehouse.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only assign warehouses that you created',
        });
      }
    }

    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    const existingUserByLoginid = await User.findOne({ loginidLower: loginid.toLowerCase() });
    if (existingUserByLoginid) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this loginid',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      loginid,
      email,
      password: hashedPassword,
      role,
    };

    if (warehouseAssigned) {
      userData.warehouseAssigned = warehouseAssigned;
    }

    const user = await User.create(userData);
    await user.populate('warehouseAssigned');

    user.password = undefined;

    res.status(201).json({
      success: true,
      message: `User created successfully with role: ${role}`,
      user,
    });
  } catch (error) {
    console.error('Create user error:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(e => e.message).join(', ')
      });
    }
    next(error);
  }
};

export const assignWarehouse = async (req, res, next) => {
  try {
    const { warehouseId } = req.body;
    const userId = req.params.id;

    if (!userId || !warehouseId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId and warehouseId',
      });
    }

    const Warehouse = (await import('../models/Warehouse.js')).default;
    
    // Verify warehouse exists
    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found',
      });
    }

    // If user is admin, check if the warehouse belongs to them
    if (req.user.role === 'admin' && (!warehouse.owner || warehouse.owner.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You can only assign warehouses that you created',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // If user is admin, check if they can update this user
    if (req.user.role === 'admin') {
      if (user.warehouseAssigned) {
        const userWarehouse = await Warehouse.findById(user.warehouseAssigned);
        if (!userWarehouse || !userWarehouse.owner || userWarehouse.owner.toString() !== req.user._id.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Not authorized to update this user',
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this user',
        });
      }
    }

    user.warehouseAssigned = warehouseId;
    await user.save();
    await user.populate('warehouseAssigned');

    res.status(200).json({
      success: true,
      message: 'Warehouse assigned to user',
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const Warehouse = (await import('../models/Warehouse.js')).default;
    
    let query = {};
    
    // If user is admin, only show users assigned to warehouses created by this admin
    if (req.user.role === 'admin') {
      // Get all warehouses created by this admin
      const adminWarehouses = await Warehouse.find({ owner: req.user._id });
      const warehouseIds = adminWarehouses.map(w => w._id);
      
      // Get users assigned to those warehouses
      query.warehouseAssigned = { $in: warehouseIds };
    }
    
    const users = await User.find(query).populate('warehouseAssigned');

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('warehouseAssigned');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // If user is admin, check if they can access this user
    if (req.user.role === 'admin') {
      const Warehouse = (await import('../models/Warehouse.js')).default;
      
      if (user.warehouseAssigned) {
        const warehouse = await Warehouse.findById(user.warehouseAssigned._id);
        if (!warehouse || !warehouse.owner || warehouse.owner.toString() !== req.user._id.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Not authorized to access this user',
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this user',
        });
      }
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { email, role, warehouseAssigned } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // If user is admin, check if they can update this user
    if (req.user.role === 'admin') {
      const Warehouse = (await import('../models/Warehouse.js')).default;
      
      if (user.warehouseAssigned) {
        const warehouse = await Warehouse.findById(user.warehouseAssigned);
        if (!warehouse || !warehouse.owner || warehouse.owner.toString() !== req.user._id.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Not authorized to update this user',
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this user',
        });
      }
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use',
        });
      }
      user.email = email;
    }

    if (role) {
      const validRoles = ['admin', 'manager', 'staff', 'auditor', 'supervisor'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
        });
      }
      user.role = role;
    }

    // If warehouseAssigned is provided, verify it belongs to the current admin
    if (warehouseAssigned) {
      const Warehouse = (await import('../models/Warehouse.js')).default;
      const warehouse = await Warehouse.findById(warehouseAssigned);
      
      if (!warehouse) {
        return res.status(404).json({
          success: false,
          message: 'Warehouse not found',
        });
      }

      if (req.user.role === 'admin' && (!warehouse.owner || warehouse.owner.toString() !== req.user._id.toString())) {
        return res.status(403).json({
          success: false,
          message: 'You can only assign warehouses that you created',
        });
      }

      user.warehouseAssigned = warehouseAssigned;
    }

    await user.save();
    await user.populate('warehouseAssigned');

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // If user is admin, check if they can delete this user
    if (req.user.role === 'admin') {
      const Warehouse = (await import('../models/Warehouse.js')).default;
      
      if (user.warehouseAssigned) {
        const warehouse = await Warehouse.findById(user.warehouseAssigned);
        if (!warehouse || !warehouse.owner || warehouse.owner.toString() !== req.user._id.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Not authorized to delete this user',
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this user',
        });
      }
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
