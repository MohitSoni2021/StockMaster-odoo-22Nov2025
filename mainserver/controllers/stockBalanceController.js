import StockBalance from '../models/StockBalance.js';
import Product from '../models/Product.js';
import Warehouse from '../models/Warehouse.js';

export const getStockBalances = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    let query = {};

    if (req.query.product) {
      query.product = req.query.product;
    }

    if (req.query.warehouse) {
      query.warehouse = req.query.warehouse;
    }

    if (req.query.location) {
      query.location = req.query.location;
    }

    const stockBalances = await StockBalance.find(query)
      .populate('product')
      .populate('warehouse')
      .populate('location')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    const total = await StockBalance.countDocuments(query);

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    };

    res.status(200).json({
      success: true,
      count: stockBalances.length,
      pagination,
      data: stockBalances
    });
  } catch (error) {
    next(error);
  }
};

export const getStockBalance = async (req, res, next) => {
  try {
    const stockBalance = await StockBalance.findById(req.params.id)
      .populate('product')
      .populate('warehouse')
      .populate('location');

    if (!stockBalance) {
      return res.status(404).json({
        success: false,
        message: 'Stock balance not found'
      });
    }

    res.status(200).json({
      success: true,
      data: stockBalance
    });
  } catch (error) {
    next(error);
  }
};

export const createStockBalance = async (req, res, next) => {
  try {
    const { product, warehouse, location, quantity, reservedQuantity } = req.body;

    if (!product || !warehouse) {
      return res.status(400).json({
        success: false,
        message: 'Product and warehouse are required'
      });
    }

    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const warehouseExists = await Warehouse.findById(warehouse);
    if (!warehouseExists) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }

    const stockBalance = await StockBalance.create({
      product,
      warehouse,
      location: location || null,
      quantity: quantity || 0,
      reservedQuantity: reservedQuantity || 0,
      lastUpdatedAt: new Date()
    });

    const populatedStockBalance = await StockBalance.findById(stockBalance._id)
      .populate('product')
      .populate('warehouse')
      .populate('location');

    res.status(201).json({
      success: true,
      data: populatedStockBalance
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Stock balance for this product and warehouse already exists'
      });
    }
    next(error);
  }
};

export const updateStockBalance = async (req, res, next) => {
  try {
    const { quantity, reservedQuantity } = req.body;

    const updateData = {
      ...req.body,
      lastUpdatedAt: new Date()
    };

    const stockBalance = await StockBalance.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    )
      .populate('product')
      .populate('warehouse')
      .populate('location');

    if (!stockBalance) {
      return res.status(404).json({
        success: false,
        message: 'Stock balance not found'
      });
    }

    res.status(200).json({
      success: true,
      data: stockBalance
    });
  } catch (error) {
    next(error);
  }
};

export const updateQuantity = async (req, res, next) => {
  try {
    const { quantity, reservedQuantity } = req.body;

    if (quantity === undefined && reservedQuantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide quantity or reservedQuantity to update'
      });
    }

    const stockBalance = await StockBalance.findById(req.params.id);

    if (!stockBalance) {
      return res.status(404).json({
        success: false,
        message: 'Stock balance not found'
      });
    }

    if (quantity !== undefined) {
      stockBalance.quantity = quantity;
    }

    if (reservedQuantity !== undefined) {
      stockBalance.reservedQuantity = reservedQuantity;
    }

    stockBalance.lastUpdatedAt = new Date();
    await stockBalance.save();

    const updatedStockBalance = await StockBalance.findById(stockBalance._id)
      .populate('product')
      .populate('warehouse')
      .populate('location');

    res.status(200).json({
      success: true,
      data: updatedStockBalance
    });
  } catch (error) {
    next(error);
  }
};

export const deleteStockBalance = async (req, res, next) => {
  try {
    const stockBalance = await StockBalance.findById(req.params.id);

    if (!stockBalance) {
      return res.status(404).json({
        success: false,
        message: 'Stock balance not found'
      });
    }

    await StockBalance.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Stock balance deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getStockBalanceByProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const stockBalances = await StockBalance.find({ product: productId })
      .populate('product')
      .populate('warehouse')
      .populate('location');

    if (stockBalances.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No stock balance found for this product'
      });
    }

    const totalQuantity = stockBalances.reduce((sum, sb) => sum + sb.quantity, 0);
    const totalReserved = stockBalances.reduce((sum, sb) => sum + sb.reservedQuantity, 0);
    const totalAvailable = totalQuantity - totalReserved;

    res.status(200).json({
      success: true,
      count: stockBalances.length,
      summary: {
        totalQuantity,
        totalReserved,
        totalAvailable
      },
      data: stockBalances
    });
  } catch (error) {
    next(error);
  }
};

export const getStockBalanceByWarehouse = async (req, res, next) => {
  try {
    const { warehouseId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const stockBalances = await StockBalance.find({ warehouse: warehouseId })
      .populate('product')
      .populate('warehouse')
      .populate('location')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    if (stockBalances.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No stock balance found for this warehouse'
      });
    }

    const total = await StockBalance.countDocuments({ warehouse: warehouseId });

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    };

    res.status(200).json({
      success: true,
      count: stockBalances.length,
      pagination,
      data: stockBalances
    });
  } catch (error) {
    next(error);
  }
};

export const getLowStockProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const lowStockProducts = await StockBalance.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $match: {
          $expr: {
            $lte: ['$quantity', '$productDetails.reorderPoint']
          }
        }
      },
      {
        $lookup: {
          from: 'warehouses',
          localField: 'warehouse',
          foreignField: '_id',
          as: 'warehouseDetails'
        }
      },
      { $unwind: '$warehouseDetails' },
      { $sort: { quantity: 1 } },
      { $skip: startIndex },
      { $limit: limit }
    ]);

    const total = await StockBalance.countDocuments({
      $expr: {
        $lte: [
          '$quantity',
          {
            $literal: 10
          }
        ]
      }
    });

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    };

    res.status(200).json({
      success: true,
      count: lowStockProducts.length,
      pagination,
      data: lowStockProducts
    });
  } catch (error) {
    next(error);
  }
};
