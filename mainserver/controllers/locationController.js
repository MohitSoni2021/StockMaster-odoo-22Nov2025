import Location from '../models/Location.js';
import Warehouse from '../models/Warehouse.js';

// @desc    Get all locations
// @route   GET /api/v1/locations
// @access  Private
export const getLocations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = {};

    // Filter by warehouse
    if (req.query.warehouse) {
      query.warehouse = req.query.warehouse;
    }

    // Filter by active status if specified
    if (req.query.active !== undefined) {
      query.isActive = req.query.active === 'true';
    }

    // Filter by type
    if (req.query.type) {
      query.type = req.query.type;
    }

    // Search by name or shortCode
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { shortCode: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Execute query with population
    const locations = await Location.find(query)
      .populate('warehouse', 'name shortCode')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    // Get total count for pagination
    const total = await Location.countDocuments(query);

    // Pagination info
    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalLocations: total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    };

    res.status(200).json({
      success: true,
      count: locations.length,
      pagination,
      data: locations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single location
// @route   GET /api/v1/locations/:id
// @access  Private
export const getLocation = async (req, res, next) => {
  try {
    const location = await Location.findById(req.params.id)
      .populate('warehouse', 'name shortCode');

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    res.status(200).json({
      success: true,
      data: location
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new location
// @route   POST /api/v1/locations
// @access  Private
export const createLocation = async (req, res, next) => {
  try {
    const location = await Location.create(req.body);

    // Add location ID to warehouse's addresses array
    await Warehouse.findByIdAndUpdate(
      location.warehouse,
      { $push: { addresses: location._id } },
      { new: true }
    );

    // Populate warehouse info in response
    await location.populate('warehouse', 'name shortCode');

    res.status(201).json({
      success: true,
      data: location
    });
  } catch (error) {
    // Handle duplicate key error for warehouse + shortCode
    if (error.code === 11000 && error.keyPattern?.warehouse && error.keyPattern?.shortCode) {
      return res.status(400).json({
        success: false,
        message: 'Location short code already exists for this warehouse'
      });
    }
    next(error);
  }
};

// @desc    Update location
// @route   PUT /api/v1/locations/:id
// @access  Private
export const updateLocation = async (req, res, next) => {
  try {
    const oldLocation = await Location.findById(req.params.id);

    if (!oldLocation) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    // Check if warehouse is being changed
    if (req.body.warehouse && oldLocation.warehouse.toString() !== req.body.warehouse) {
      // Remove location from old warehouse
      await Warehouse.findByIdAndUpdate(
        oldLocation.warehouse,
        { $pull: { addresses: oldLocation._id } },
        { new: true }
      );

      // Add location to new warehouse
      await Warehouse.findByIdAndUpdate(
        req.body.warehouse,
        { $push: { addresses: oldLocation._id } },
        { new: true }
      );
    }

    const location = await Location.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('warehouse', 'name shortCode');

    res.status(200).json({
      success: true,
      data: location
    });
  } catch (error) {
    // Handle duplicate key error for warehouse + shortCode
    if (error.code === 11000 && error.keyPattern?.warehouse && error.keyPattern?.shortCode) {
      return res.status(400).json({
        success: false,
        message: 'Location short code already exists for this warehouse'
      });
    }
    next(error);
  }
};

// @desc    Delete location
// @route   DELETE /api/v1/locations/:id
// @access  Private
export const deleteLocation = async (req, res, next) => {
  try {
    const location = await Location.findById(req.params.id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    // Remove location ID from warehouse's addresses array
    await Warehouse.findByIdAndUpdate(
      location.warehouse,
      { $pull: { addresses: location._id } },
      { new: true }
    );

    await Location.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Location deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get locations by warehouse
// @route   GET /api/v1/locations/warehouse/:warehouseId
// @access  Private
export const getLocationsByWarehouse = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Verify warehouse exists
    const warehouse = await Warehouse.findById(req.params.warehouseId);
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }

    // Build query
    let query = { warehouse: req.params.warehouseId };

    // Filter by active status if specified
    if (req.query.active !== undefined) {
      query.isActive = req.query.active === 'true';
    }

    // Filter by type
    if (req.query.type) {
      query.type = req.query.type;
    }

    // Search by name or shortCode
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { shortCode: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Execute query
    const locations = await Location.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    // Get total count for pagination
    const total = await Location.countDocuments(query);

    // Pagination info
    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalLocations: total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    };

    res.status(200).json({
      success: true,
      count: locations.length,
      pagination,
      warehouse: {
        id: warehouse._id,
        name: warehouse.name,
        shortCode: warehouse.shortCode
      },
      data: locations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get location statistics
// @route   GET /api/v1/locations/stats
// @access  Private
export const getLocationStats = async (req, res, next) => {
  try {
    const totalLocations = await Location.countDocuments();
    const activeLocations = await Location.countDocuments({ isActive: true });
    const inactiveLocations = totalLocations - activeLocations;

    // Get locations by type
    const locationsByType = await Location.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get locations by warehouse
    const locationsByWarehouse = await Location.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'warehouses',
          localField: 'warehouse',
          foreignField: '_id',
          as: 'warehouseInfo'
        }
      },
      { $unwind: '$warehouseInfo' },
      {
        $group: {
          _id: '$warehouse',
          warehouseName: { $first: '$warehouseInfo.name' },
          warehouseShortCode: { $first: '$warehouseInfo.shortCode' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalLocations,
        active: activeLocations,
        inactive: inactiveLocations,
        byType: locationsByType,
        byWarehouse: locationsByWarehouse
      }
    });
  } catch (error) {
    next(error);
  }
};