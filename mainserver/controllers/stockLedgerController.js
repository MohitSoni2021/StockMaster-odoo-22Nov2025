import StockLedger from '../models/StockLedger.js';
import StockBalance from '../models/StockBalance.js';

const generateReference = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `SL-${timestamp}-${random}`;
};

export const getStockLedgers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    let query = {};

    if (req.query.product) {
      query.product = req.query.product;
    }

    if (req.query.fromWarehouse) {
      query.fromWarehouse = req.query.fromWarehouse;
    }

    if (req.query.toWarehouse) {
      query.toWarehouse = req.query.toWarehouse;
    }

    if (req.query.movementType) {
      query.movementType = req.query.movementType;
    }

    if (req.query.search) {
      query.reference = { $regex: req.query.search, $options: 'i' };
    }

    const ledgers = await StockLedger.find(query)
      .populate('product', 'sku name category')
      .populate('fromWarehouse', 'name shortCode')
      .populate('toWarehouse', 'name shortCode')
      .populate('fromLocation', 'name code')
      .populate('toLocation', 'name code')
      .populate('performedBy', 'name email')
      .populate('document', 'reference type')
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(startIndex);

    const total = await StockLedger.countDocuments(query);

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalDocuments: total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    };

    res.status(200).json({
      success: true,
      count: ledgers.length,
      pagination,
      data: ledgers
    });
  } catch (error) {
    next(error);
  }
};

export const getStockLedger = async (req, res, next) => {
  try {
    const ledger = await StockLedger.findById(req.params.id)
      .populate('product', 'sku name category defaultUom')
      .populate('fromWarehouse', 'name shortCode address')
      .populate('toWarehouse', 'name shortCode address')
      .populate('fromLocation', 'name code')
      .populate('toLocation', 'name code')
      .populate('performedBy', 'name email')
      .populate('document', 'reference type status')
      .populate('documentLine');

    if (!ledger) {
      return res.status(404).json({
        success: false,
        message: 'Stock ledger not found'
      });
    }

    res.status(200).json({
      success: true,
      data: ledger
    });
  } catch (error) {
    next(error);
  }
};

export const createStockLedger = async (req, res, next) => {
  try {
    const {
      document,
      documentLine,
      product,
      fromWarehouse,
      fromLocation,
      toWarehouse,
      toLocation,
      quantity,
      movementType,
      performedBy,
      meta
    } = req.body;

    if (!product || !quantity || !movementType || !performedBy) {
      return res.status(400).json({
        success: false,
        message: 'Product, quantity, movement type, and performedBy are required'
      });
    }

    if (!['IN', 'OUT', 'TRANSFER', 'ADJUSTMENT'].includes(movementType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid movement type'
      });
    }

    let beforeQty = 0;
    let warehouse = null;

    if (movementType === 'OUT' && fromWarehouse && fromLocation) {
      const stockBalance = await StockBalance.findOne({
        product,
        warehouse: fromWarehouse,
        location: fromLocation
      });
      beforeQty = stockBalance ? stockBalance.quantity : 0;
      warehouse = fromWarehouse;
    } else if (movementType === 'IN' && toWarehouse && toLocation) {
      const stockBalance = await StockBalance.findOne({
        product,
        warehouse: toWarehouse,
        location: toLocation
      });
      beforeQty = stockBalance ? stockBalance.quantity : 0;
      warehouse = toWarehouse;
    } else if (movementType === 'TRANSFER' && fromWarehouse && fromLocation) {
      const stockBalance = await StockBalance.findOne({
        product,
        warehouse: fromWarehouse,
        location: fromLocation
      });
      beforeQty = stockBalance ? stockBalance.quantity : 0;
      warehouse = fromWarehouse;
    } else if (movementType === 'ADJUSTMENT' && toWarehouse && toLocation) {
      const stockBalance = await StockBalance.findOne({
        product,
        warehouse: toWarehouse,
        location: toLocation
      });
      beforeQty = stockBalance ? stockBalance.quantity : 0;
      warehouse = toWarehouse;
    }

    const afterQty = beforeQty + quantity;
    const reference = generateReference();

    const ledger = await StockLedger.create({
      reference,
      document,
      documentLine,
      product,
      fromWarehouse,
      fromLocation,
      toWarehouse,
      toLocation,
      quantity,
      movementType,
      beforeQty,
      afterQty,
      performedBy,
      meta: meta || {}
    });

    const populatedLedger = await StockLedger.findById(ledger._id)
      .populate('product', 'sku name category')
      .populate('fromWarehouse', 'name shortCode')
      .populate('toWarehouse', 'name shortCode')
      .populate('fromLocation', 'name code')
      .populate('toLocation', 'name code')
      .populate('performedBy', 'name email')
      .populate('document', 'reference type');

    res.status(201).json({
      success: true,
      data: populatedLedger
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.reference) {
      return res.status(400).json({
        success: false,
        message: 'Stock ledger reference already exists'
      });
    }
    next(error);
  }
};

export const updateStockLedger = async (req, res, next) => {
  try {
    const ledger = await StockLedger.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )
      .populate('product', 'sku name category')
      .populate('fromWarehouse', 'name shortCode')
      .populate('toWarehouse', 'name shortCode')
      .populate('fromLocation', 'name code')
      .populate('toLocation', 'name code')
      .populate('performedBy', 'name email')
      .populate('document', 'reference type');

    if (!ledger) {
      return res.status(404).json({
        success: false,
        message: 'Stock ledger not found'
      });
    }

    res.status(200).json({
      success: true,
      data: ledger
    });
  } catch (error) {
    next(error);
  }
};

export const deleteStockLedger = async (req, res, next) => {
  try {
    const ledger = await StockLedger.findById(req.params.id);

    if (!ledger) {
      return res.status(404).json({
        success: false,
        message: 'Stock ledger not found'
      });
    }

    await StockLedger.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Stock ledger deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getStockLedgerStats = async (req, res, next) => {
  try {
    const totalLedgers = await StockLedger.countDocuments();
    
    const byMovementType = await StockLedger.aggregate([
      { $group: { _id: '$movementType', count: { $sum: 1 }, totalQty: { $sum: '$quantity' } } }
    ]);

    const recentLedgers = await StockLedger.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('product', 'name sku')
      .populate('performedBy', 'name email');

    res.status(200).json({
      success: true,
      data: {
        total: totalLedgers,
        byMovementType,
        recent: recentLedgers
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getStockMovementHistory = async (req, res, next) => {
  try {
    const { product, warehouse } = req.query;

    if (!product) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    let query = { product };

    if (warehouse) {
      query.$or = [
        { fromWarehouse: warehouse },
        { toWarehouse: warehouse }
      ];
    }

    const history = await StockLedger.find(query)
      .populate('product', 'sku name')
      .populate('fromWarehouse', 'name shortCode')
      .populate('toWarehouse', 'name shortCode')
      .populate('performedBy', 'name email')
      .sort({ timestamp: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
};
