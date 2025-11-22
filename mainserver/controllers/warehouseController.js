import Warehouse from '../models/Warehouse.js';

// @desc    Get all warehouses
// @route   GET /api/v1/warehouses
// @access  Private
export const getWarehouses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = {};

    // Filter by active status if specified
    if (req.query.active !== undefined) {
      query.isActive = req.query.active === 'true';
    }

    // Search by name or shortCode
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { shortCode: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Filter by city or state
    if (req.query.city) {
      query['address.city'] = { $regex: req.query.city, $options: 'i' };
    }
    if (req.query.state) {
      query['address.state'] = { $regex: req.query.state, $options: 'i' };
    }

    // Execute query
    const warehouses = await Warehouse.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    // Get total count for pagination
    const total = await Warehouse.countDocuments(query);

    // Pagination info
    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalWarehouses: total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    };

    res.status(200).json({
      success: true,
      count: warehouses.length,
      pagination,
      data: warehouses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single warehouse
// @route   GET /api/v1/warehouses/:id
// @access  Private
export const getWarehouse = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }

    res.status(200).json({
      success: true,
      data: warehouse
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new warehouse
// @route   POST /api/v1/warehouses
// @access  Private
export const createWarehouse = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.create(req.body);

    res.status(201).json({
      success: true,
      data: warehouse
    });
  } catch (error) {
    // Handle duplicate key error for shortCode
    if (error.code === 11000 && error.keyPattern?.shortCode) {
      return res.status(400).json({
        success: false,
        message: 'Warehouse short code already exists'
      });
    }
    next(error);
  }
};

// @desc    Update warehouse
// @route   PUT /api/v1/warehouses/:id
// @access  Private
export const updateWarehouse = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }

    res.status(200).json({
      success: true,
      data: warehouse
    });
  } catch (error) {
    // Handle duplicate key error for shortCode
    if (error.code === 11000 && error.keyPattern?.shortCode) {
      return res.status(400).json({
        success: false,
        message: 'Warehouse short code already exists'
      });
    }
    next(error);
  }
};

// @desc    Delete warehouse
// @route   DELETE /api/v1/warehouses/:id
// @access  Private
export const deleteWarehouse = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }

    // Check if warehouse has active locations before deletion
    const Location = (await import('../models/Location.js')).default;
    const activeLocations = await Location.countDocuments({
      warehouse: req.params.id,
      isActive: true
    });

    if (activeLocations > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete warehouse with ${activeLocations} active location(s). Please deactivate or move locations first.`
      });
    }

    await Warehouse.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Warehouse deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get warehouse statistics
// @route   GET /api/v1/warehouses/stats
// @access  Private
export const getWarehouseStats = async (req, res, next) => {
  try {
    const totalWarehouses = await Warehouse.countDocuments();
    const activeWarehouses = await Warehouse.countDocuments({ isActive: true });
    const inactiveWarehouses = totalWarehouses - activeWarehouses;

    // Get warehouses by state
    const warehousesByState = await Warehouse.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$address.state', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalWarehouses,
        active: activeWarehouses,
        inactive: inactiveWarehouses,
        byState: warehousesByState
      }
    });
  } catch (error) {
    next(error);
  }
};