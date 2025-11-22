import Document from '../models/Document.js';
import DocumentLine from '../models/DocumentLine.js';
import StockBalance from '../models/StockBalance.js';
import StockLedger from '../models/StockLedger.js';
import Product from '../models/Product.js';
import Warehouse from '../models/Warehouse.js';
import User from '../models/User.js';

export const getDashboardKPIs = async (req, res, next) => {
  try {
    const warehouseId = req.query.warehouse;

    let warehouseFilter = {};
    if (warehouseId) {
      warehouseFilter = { warehouse: warehouseId };
    }

    const totalDocuments = await Document.countDocuments(warehouseFilter);
    
    const documentsByStatus = await Document.aggregate([
      { $match: warehouseFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const documentsByType = await Document.aggregate([
      { $match: warehouseFilter },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const pendingValidations = await Document.countDocuments({
      ...warehouseFilter,
      status: 'DRAFT'
    });

    const completedDocuments = await Document.countDocuments({
      ...warehouseFilter,
      status: 'DONE'
    });

    const totalProducts = await Product.countDocuments();

    const stockBalances = await StockBalance.aggregate([
      { $match: warehouseId ? { warehouse: require('mongoose').Types.ObjectId(warehouseId) } : {} },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$quantity' },
          totalReserved: { $sum: '$reservedQuantity' },
          totalProducts: { $sum: 1 }
        }
      }
    ]);

    const recentMovements = await StockLedger.find(warehouseId ? { $or: [{ fromWarehouse: warehouseId }, { toWarehouse: warehouseId }] } : {})
      .populate('product', 'sku name')
      .populate('fromWarehouse', 'name')
      .populate('toWarehouse', 'name')
      .sort({ timestamp: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalDocuments,
          pendingValidations,
          completedDocuments,
          totalProducts
        },
        documentsByStatus: documentsByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        documentsByType: documentsByType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        inventory: stockBalances[0] || { totalQuantity: 0, totalReserved: 0, totalProducts: 0 },
        recentMovements
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getReceiptDocuments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const status = req.query.status || '';
    const search = req.query.search || '';

    // Get manager's assigned warehouse
    const userId = req.user?._id || req.user?.id;
    const user = await User.findById(userId).populate('warehouseAssigned');

    if (!user || !user.warehouseAssigned) {
      return res.status(403).json({
        success: false,
        message: 'Manager must be assigned to a warehouse'
      });
    }

    let query = {
      type: 'RECEIPT',
      warehouse: user.warehouseAssigned._id
    };

    if (status) query.status = status;
    if (search) query.reference = { $regex: search, $options: 'i' };

    const receipts = await Document.find(query)
      .populate('warehouse', 'name shortCode')
      .populate('from', 'name email mobileNo type')
      .populate('contact')
      .populate('createdBy', 'name email')
      .populate('validatedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    const total = await Document.countDocuments(query);

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalDocuments: total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    };

    res.status(200).json({
      success: true,
      count: receipts.length,
      pagination,
      data: receipts
    });
  } catch (error) {
    next(error);
  }
};

export const getDeliveryDocuments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const status = req.query.status || '';
    const search = req.query.search || '';

    // Get manager's assigned warehouse
    const userId = req.user?._id || req.user?.id;
    const user = await User.findById(userId).populate('warehouseAssigned');

    if (!user || !user.warehouseAssigned) {
      return res.status(403).json({
        success: false,
        message: 'Manager must be assigned to a warehouse'
      });
    }

    let query = {
      type: 'DELIVERY',
      warehouse: user.warehouseAssigned._id
    };

    if (status) query.status = status;
    if (search) query.reference = { $regex: search, $options: 'i' };

    const deliveries = await Document.find(query)
      .populate('warehouse', 'name shortCode')
      .populate('to', 'name email mobileNo type')
      .populate('contact')
      .populate('createdBy', 'name email')
      .populate('validatedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    const total = await Document.countDocuments(query);

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalDocuments: total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    };

    res.status(200).json({
      success: true,
      count: deliveries.length,
      pagination,
      data: deliveries
    });
  } catch (error) {
    next(error);
  }
};

export const getTransferDocuments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const status = req.query.status || '';
    const search = req.query.search || '';

    // Get manager's assigned warehouse
    const userId = req.user?._id || req.user?.id;
    const user = await User.findById(userId).populate('warehouseAssigned');

    if (!user || !user.warehouseAssigned) {
      return res.status(403).json({
        success: false,
        message: 'Manager must be assigned to a warehouse'
      });
    }

    let query = {
      type: 'TRANSFER',
      warehouse: user.warehouseAssigned._id
    };

    if (status) query.status = status;
    if (search) query.reference = { $regex: search, $options: 'i' };

    const transfers = await Document.find(query)
      .populate('warehouse', 'name shortCode')
      .populate('toWarehouse', 'name shortCode')
      .populate('fromLocation', 'name code')
      .populate('toLocation', 'name code')
      .populate('createdBy', 'name email')
      .populate('validatedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    const total = await Document.countDocuments(query);

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalDocuments: total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    };

    res.status(200).json({
      success: true,
      count: transfers.length,
      pagination,
      data: transfers
    });
  } catch (error) {
    next(error);
  }
};

export const getAdjustmentDocuments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const status = req.query.status || '';
    const search = req.query.search || '';

    // Get manager's assigned warehouse
    const userId = req.user?._id || req.user?.id;
    const user = await User.findById(userId).populate('warehouseAssigned');

    if (!user || !user.warehouseAssigned) {
      return res.status(403).json({
        success: false,
        message: 'Manager must be assigned to a warehouse'
      });
    }

    let query = {
      type: 'ADJUSTMENT',
      warehouse: user.warehouseAssigned._id
    };

    if (status) query.status = status;
    if (search) query.reference = { $regex: search, $options: 'i' };

    const adjustments = await Document.find(query)
      .populate('warehouse', 'name shortCode')
      .populate('fromLocation', 'name code')
      .populate('toLocation', 'name code')
      .populate('createdBy', 'name email')
      .populate('validatedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    const total = await Document.countDocuments(query);

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalDocuments: total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    };

    res.status(200).json({
      success: true,
      count: adjustments.length,
      pagination,
      data: adjustments
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingApprovals = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const type = req.query.type || '';
    const warehouseId = req.query.warehouse || '';

    let query = { status: 'DRAFT' };

    if (type) query.type = type;
    if (warehouseId) query.warehouse = warehouseId;

    const pendingDocs = await Document.find(query)
      .populate('warehouse', 'name shortCode')
      .populate('from', 'name email')
      .populate('to', 'name email')
      .populate('toWarehouse', 'name shortCode')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    const total = await Document.countDocuments(query);

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalDocuments: total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    };

    res.status(200).json({
      success: true,
      count: pendingDocs.length,
      pagination,
      data: pendingDocs
    });
  } catch (error) {
    next(error);
  }
};

export const approveDocument = async (req, res, next) => {
  try {
    const { validatedBy, notes } = req.body;
    const documentId = req.params.id;

    if (!validatedBy) {
      return res.status(400).json({
        success: false,
        message: 'Approver information is required'
      });
    }

    const document = await Document.findByIdAndUpdate(
      documentId,
      {
        status: 'READY',
        validatedBy,
        validatedAt: new Date(),
        notes: notes || document.notes
      },
      { new: true, runValidators: true }
    )
      .populate('warehouse', 'name shortCode')
      .populate('from', 'name email')
      .populate('to', 'name email')
      .populate('toWarehouse', 'name shortCode')
      .populate('createdBy', 'name email')
      .populate('validatedBy', 'name email');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Document approved successfully',
      data: document
    });
  } catch (error) {
    next(error);
  }
};

export const rejectDocument = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const documentId = req.params.id;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const document = await Document.findByIdAndUpdate(
      documentId,
      {
        status: 'DRAFT',
        notes: `Rejected: ${reason}`
      },
      { new: true, runValidators: true }
    )
      .populate('warehouse', 'name shortCode')
      .populate('createdBy', 'name email');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Document rejected successfully',
      data: document
    });
  } catch (error) {
    next(error);
  }
};

export const completeDocument = async (req, res, next) => {
  try {
    const documentId = req.params.id;

    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    if (document.status !== 'READY') {
      return res.status(400).json({
        success: false,
        message: 'Only READY documents can be marked as DONE'
      });
    }

    const updatedDoc = await Document.findByIdAndUpdate(
      documentId,
      {
        status: 'DONE'
      },
      { new: true, runValidators: true }
    )
      .populate('warehouse', 'name shortCode')
      .populate('createdBy', 'name email')
      .populate('validatedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Document completed successfully',
      data: updatedDoc
    });
  } catch (error) {
    next(error);
  }
};

export const cancelDocument = async (req, res, next) => {
  try {
    const documentId = req.params.id;
    const { reason } = req.body;

    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    if (document.status === 'DONE') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed documents'
      });
    }

    const updatedDoc = await Document.findByIdAndUpdate(
      documentId,
      {
        status: 'CANCELED',
        notes: reason ? `Canceled: ${reason}` : 'Canceled'
      },
      { new: true, runValidators: true }
    )
      .populate('warehouse', 'name shortCode')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Document canceled successfully',
      data: updatedDoc
    });
  } catch (error) {
    next(error);
  }
};

export const getStockLedger = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const movementType = req.query.movementType || '';
    const productId = req.query.product || '';
    const warehouseId = req.query.warehouse || '';

    let query = {};

    if (movementType) query.movementType = movementType;
    if (productId) query.product = productId;
    if (warehouseId) {
      query.$or = [
        { fromWarehouse: warehouseId },
        { toWarehouse: warehouseId }
      ];
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

export const getStockBalance = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const warehouseId = req.query.warehouse;
    const productId = req.query.product || '';
    const lowStockOnly = req.query.lowStock === 'true';

    let query = {};

    if (warehouseId) query.warehouse = warehouseId;
    if (productId) query.product = productId;

    let balances = StockBalance.find(query)
      .populate('product', 'sku name category reorderPoint')
      .populate('warehouse', 'name shortCode')
      .populate('location', 'name code');

    const allBalances = await balances.exec();

    if (lowStockOnly) {
      const filtered = allBalances.filter(balance => {
        const reorderPoint = balance.product?.reorderPoint || 0;
        return balance.quantity <= reorderPoint;
      });
      return res.status(200).json({
        success: true,
        data: filtered
      });
    }

    const paginatedBalances = allBalances.slice(startIndex, startIndex + limit);
    const total = allBalances.length;

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalDocuments: total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    };

    res.status(200).json({
      success: true,
      count: paginatedBalances.length,
      pagination,
      data: paginatedBalances
    });
  } catch (error) {
    next(error);
  }
};

export const getWarehouseStockSummary = async (req, res, next) => {
  try {
    const warehouseId = req.params.warehouseId;

    const warehouse = await Warehouse.findById(warehouseId);

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }

    const stockData = await StockBalance.aggregate([
      { $match: { warehouse: require('mongoose').Types.ObjectId(warehouseId) } },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$quantity' },
          totalReserved: { $sum: '$reservedQuantity' },
          totalAvailable: { $sum: { $subtract: ['$quantity', '$reservedQuantity'] } },
          uniqueProducts: { $sum: 1 }
        }
      }
    ]);

    const lowStockProducts = await StockBalance.find({ warehouse: warehouseId })
      .populate('product', 'sku name category reorderPoint')
      .exec();

    const lowStockCount = lowStockProducts.filter(
      balance => balance.quantity <= (balance.product?.reorderPoint || 0)
    ).length;

    res.status(200).json({
      success: true,
      data: {
        warehouse: {
          id: warehouse._id,
          name: warehouse.name,
          shortCode: warehouse.shortCode
        },
        summary: stockData[0] || {
          totalQuantity: 0,
          totalReserved: 0,
          totalAvailable: 0,
          uniqueProducts: 0
        },
        lowStockAlerts: lowStockCount
      }
    });
  } catch (error) {
    next(error);
  }
};

export const assignTaskToStaff = async (req, res, next) => {
  try {
    const { documentId, staffId, taskDescription } = req.body;

    if (!documentId || !staffId) {
      return res.status(400).json({
        success: false,
        message: 'Document ID and Staff ID are required'
      });
    }

    const document = await Document.findByIdAndUpdate(
      documentId,
      {
        responsible: staffId,
        $push: {
          meta: {
            taskDescription: taskDescription || '',
            assignedAt: new Date()
          }
        }
      },
      { new: true, runValidators: true }
    )
      .populate('responsible', 'name email mobileNo')
      .populate('warehouse', 'name shortCode')
      .populate('createdBy', 'name email');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task assigned successfully',
      data: document
    });
  } catch (error) {
    next(error);
  }
};

export const getReorderPointItems = async (req, res, next) => {
  try {
    const warehouseId = req.query.warehouse;

    let query = {};
    if (warehouseId) {
      query.warehouse = warehouseId;
    }

    const balances = await StockBalance.find(query)
      .populate('product', 'sku name category reorderPoint minimumStock')
      .populate('warehouse', 'name shortCode')
      .exec();

    const needsReplenishment = balances.filter(balance => {
      const reorderPoint = balance.product?.reorderPoint || 0;
      return balance.quantity <= reorderPoint && balance.quantity > 0;
    });

    const outOfStock = balances.filter(balance => balance.quantity === 0);

    res.status(200).json({
      success: true,
      data: {
        needsReplenishment,
        outOfStock,
        totalItemsNeedingReplenishment: needsReplenishment.length,
        totalOutOfStock: outOfStock.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// Manager-specific receipt CRUD operations
export const createReceipt = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const user = await User.findById(userId).populate('warehouseAssigned');

    if (!user || !user.warehouseAssigned) {
      return res.status(403).json({
        success: false,
        message: 'Manager must be assigned to a warehouse'
      });
    }

    const { from, contact, contactRef, scheduleDate, notes, meta, lines } = req.body;

    if (!from) {
      return res.status(400).json({
        success: false,
        message: 'From contact is required for receipts'
      });
    }

    if (!lines || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one document line is required'
      });
    }

    const reference = `RECEIPT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const document = await Document.create({
      reference,
      type: 'RECEIPT',
      warehouse: user.warehouseAssigned._id,
      from,
      contact,
      contactRef,
      scheduleDate,
      notes,
      status: 'DRAFT',
      meta: meta || {},
      createdBy: userId,
      owner: userId
    });

    // Create document lines
    const documentLines = lines.map(line => ({
      document: document._id,
      product: line.product,
      uom: line.uom,
      quantity: line.quantity,
      unitCost: line.unitCost || 0,
      status: 'PENDING',
      meta: line.meta || {}
    }));

    await DocumentLine.insertMany(documentLines);

    const populatedDocument = await Document.findById(document._id)
      .populate('warehouse', 'name shortCode')
      .populate('from', 'name email')
      .populate('contact')
      .populate('createdBy', 'name email');

    const populatedLines = await DocumentLine.find({ document: document._id })
      .populate('product', 'sku name category defaultUom');

    res.status(201).json({
      success: true,
      data: {
        ...populatedDocument.toObject(),
        lines: populatedLines
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateReceipt = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const user = await User.findById(userId).populate('warehouseAssigned');

    if (!user || !user.warehouseAssigned) {
      return res.status(403).json({
        success: false,
        message: 'Manager must be assigned to a warehouse'
      });
    }

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    if (document.type !== 'RECEIPT') {
      return res.status(400).json({
        success: false,
        message: 'Document is not a receipt'
      });
    }

    if (document.warehouse.toString() !== user.warehouseAssigned._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage receipts from your assigned warehouse'
      });
    }

    if (document.status !== 'DRAFT') {
      return res.status(403).json({
        success: false,
        message: 'Can only update receipts in DRAFT status'
      });
    }

    const { from, contact, contactRef, scheduleDate, notes, meta, lines } = req.body;

    const updatedDocument = await Document.findByIdAndUpdate(
      req.params.id,
      {
        from,
        contact,
        contactRef,
        scheduleDate,
        notes,
        meta: meta || {}
      },
      { new: true, runValidators: true }
    ).populate('warehouse', 'name shortCode')
     .populate('from', 'name email')
     .populate('contact')
     .populate('createdBy', 'name email');

    // Update document lines if provided
    if (lines && Array.isArray(lines)) {
      // Remove existing lines
      await DocumentLine.deleteMany({ document: req.params.id });

      // Create new lines
      const documentLines = lines.map(line => ({
        document: req.params.id,
        product: line.product,
        uom: line.uom,
        quantity: line.quantity,
        unitCost: line.unitCost || 0,
        status: 'PENDING',
        meta: line.meta || {}
      }));

      await DocumentLine.insertMany(documentLines);
    }

    const populatedLines = await DocumentLine.find({ document: req.params.id })
      .populate('product', 'sku name category defaultUom');

    res.status(200).json({
      success: true,
      data: {
        ...updatedDocument.toObject(),
        lines: populatedLines
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReceipt = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const user = await User.findById(userId).populate('warehouseAssigned');

    if (!user || !user.warehouseAssigned) {
      return res.status(403).json({
        success: false,
        message: 'Manager must be assigned to a warehouse'
      });
    }

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    if (document.type !== 'RECEIPT') {
      return res.status(400).json({
        success: false,
        message: 'Document is not a receipt'
      });
    }

    if (document.warehouse.toString() !== user.warehouseAssigned._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage receipts from your assigned warehouse'
      });
    }

    if (document.status !== 'DRAFT') {
      return res.status(403).json({
        success: false,
        message: 'Can only delete receipts in DRAFT status'
      });
    }

    await DocumentLine.deleteMany({ document: req.params.id });
    await Document.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Receipt deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Manager-specific delivery CRUD operations
export const createDelivery = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const user = await User.findById(userId).populate('warehouseAssigned');

    if (!user || !user.warehouseAssigned) {
      return res.status(403).json({
        success: false,
        message: 'Manager must be assigned to a warehouse'
      });
    }

    const { to, contact, contactRef, scheduleDate, notes, meta, lines } = req.body;

    if (!to) {
      return res.status(400).json({
        success: false,
        message: 'To contact is required for deliveries'
      });
    }

    if (!lines || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one document line is required'
      });
    }

    const reference = `DELIVERY-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const document = await Document.create({
      reference,
      type: 'DELIVERY',
      warehouse: user.warehouseAssigned._id,
      to,
      contact,
      contactRef,
      scheduleDate,
      notes,
      status: 'DRAFT',
      meta: meta || {},
      createdBy: userId,
      owner: userId
    });

    // Create document lines
    const documentLines = lines.map(line => ({
      document: document._id,
      product: line.product,
      uom: line.uom,
      quantity: line.quantity,
      unitCost: line.unitCost || 0,
      status: 'PENDING',
      meta: line.meta || {}
    }));

    await DocumentLine.insertMany(documentLines);

    const populatedDocument = await Document.findById(document._id)
      .populate('warehouse', 'name shortCode')
      .populate('to', 'name email')
      .populate('contact')
      .populate('createdBy', 'name email');

    const populatedLines = await DocumentLine.find({ document: document._id })
      .populate('product', 'sku name category defaultUom');

    res.status(201).json({
      success: true,
      data: {
        ...populatedDocument.toObject(),
        lines: populatedLines
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateDelivery = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const user = await User.findById(userId).populate('warehouseAssigned');

    if (!user || !user.warehouseAssigned) {
      return res.status(403).json({
        success: false,
        message: 'Manager must be assigned to a warehouse'
      });
    }

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }

    if (document.type !== 'DELIVERY') {
      return res.status(400).json({
        success: false,
        message: 'Document is not a delivery'
      });
    }

    if (document.warehouse.toString() !== user.warehouseAssigned._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage deliveries from your assigned warehouse'
      });
    }

    if (document.status !== 'DRAFT') {
      return res.status(403).json({
        success: false,
        message: 'Can only update deliveries in DRAFT status'
      });
    }

    const { to, contact, contactRef, scheduleDate, notes, meta, lines } = req.body;

    const updatedDocument = await Document.findByIdAndUpdate(
      req.params.id,
      {
        to,
        contact,
        contactRef,
        scheduleDate,
        notes,
        meta: meta || {}
      },
      { new: true, runValidators: true }
    ).populate('warehouse', 'name shortCode')
     .populate('to', 'name email')
     .populate('contact')
     .populate('createdBy', 'name email');

    // Update document lines if provided
    if (lines && Array.isArray(lines)) {
      // Remove existing lines
      await DocumentLine.deleteMany({ document: req.params.id });

      // Create new lines
      const documentLines = lines.map(line => ({
        document: req.params.id,
        product: line.product,
        uom: line.uom,
        quantity: line.quantity,
        unitCost: line.unitCost || 0,
        status: 'PENDING',
        meta: line.meta || {}
      }));

      await DocumentLine.insertMany(documentLines);
    }

    const populatedLines = await DocumentLine.find({ document: req.params.id })
      .populate('product', 'sku name category defaultUom');

    res.status(200).json({
      success: true,
      data: {
        ...updatedDocument.toObject(),
        lines: populatedLines
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDelivery = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const user = await User.findById(userId).populate('warehouseAssigned');

    if (!user || !user.warehouseAssigned) {
      return res.status(403).json({
        success: false,
        message: 'Manager must be assigned to a warehouse'
      });
    }

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }

    if (document.type !== 'DELIVERY') {
      return res.status(400).json({
        success: false,
        message: 'Document is not a delivery'
      });
    }

    if (document.warehouse.toString() !== user.warehouseAssigned._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage deliveries from your assigned warehouse'
      });
    }

    if (document.status !== 'DRAFT') {
      return res.status(403).json({
        success: false,
        message: 'Can only delete deliveries in DRAFT status'
      });
    }

    await DocumentLine.deleteMany({ document: req.params.id });
    await Document.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Delivery deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Manager-specific transfer CRUD operations
export const createTransfer = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const user = await User.findById(userId).populate('warehouseAssigned');

    if (!user || !user.warehouseAssigned) {
      return res.status(403).json({
        success: false,
        message: 'Manager must be assigned to a warehouse'
      });
    }

    const { toWarehouse, fromLocation, toLocation, scheduleDate, notes, meta, lines } = req.body;

    if (!toWarehouse) {
      return res.status(400).json({
        success: false,
        message: 'Destination warehouse is required for transfers'
      });
    }

    if (!lines || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one document line is required'
      });
    }

    const reference = `TRANSFER-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const document = await Document.create({
      reference,
      type: 'TRANSFER',
      warehouse: user.warehouseAssigned._id,
      toWarehouse,
      fromLocation,
      toLocation,
      scheduleDate,
      notes,
      status: 'DRAFT',
      meta: meta || {},
      createdBy: userId,
      owner: userId
    });

    // Create document lines
    const documentLines = lines.map(line => ({
      document: document._id,
      product: line.product,
      uom: line.uom,
      quantity: line.quantity,
      unitCost: line.unitCost || 0,
      status: 'PENDING',
      meta: line.meta || {}
    }));

    await DocumentLine.insertMany(documentLines);

    const populatedDocument = await Document.findById(document._id)
      .populate('warehouse', 'name shortCode')
      .populate('toWarehouse', 'name shortCode')
      .populate('fromLocation', 'name code')
      .populate('toLocation', 'name code')
      .populate('createdBy', 'name email');

    const populatedLines = await DocumentLine.find({ document: document._id })
      .populate('product', 'sku name category defaultUom');

    res.status(201).json({
      success: true,
      data: {
        ...populatedDocument.toObject(),
        lines: populatedLines
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateTransfer = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const user = await User.findById(userId).populate('warehouseAssigned');

    if (!user || !user.warehouseAssigned) {
      return res.status(403).json({
        success: false,
        message: 'Manager must be assigned to a warehouse'
      });
    }

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Transfer not found'
      });
    }

    if (document.type !== 'TRANSFER') {
      return res.status(400).json({
        success: false,
        message: 'Document is not a transfer'
      });
    }

    if (document.warehouse.toString() !== user.warehouseAssigned._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage transfers from your assigned warehouse'
      });
    }

    if (document.status !== 'DRAFT') {
      return res.status(403).json({
        success: false,
        message: 'Can only update transfers in DRAFT status'
      });
    }

    const { toWarehouse, fromLocation, toLocation, scheduleDate, notes, meta, lines } = req.body;

    const updatedDocument = await Document.findByIdAndUpdate(
      req.params.id,
      {
        toWarehouse,
        fromLocation,
        toLocation,
        scheduleDate,
        notes,
        meta: meta || {}
      },
      { new: true, runValidators: true }
    ).populate('warehouse', 'name shortCode')
     .populate('toWarehouse', 'name shortCode')
     .populate('fromLocation', 'name code')
     .populate('toLocation', 'name code')
     .populate('createdBy', 'name email');

    // Update document lines if provided
    if (lines && Array.isArray(lines)) {
      // Remove existing lines
      await DocumentLine.deleteMany({ document: req.params.id });

      // Create new lines
      const documentLines = lines.map(line => ({
        document: req.params.id,
        product: line.product,
        uom: line.uom,
        quantity: line.quantity,
        unitCost: line.unitCost || 0,
        status: 'PENDING',
        meta: line.meta || {}
      }));

      await DocumentLine.insertMany(documentLines);
    }

    const populatedLines = await DocumentLine.find({ document: req.params.id })
      .populate('product', 'sku name category defaultUom');

    res.status(200).json({
      success: true,
      data: {
        ...updatedDocument.toObject(),
        lines: populatedLines
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTransfer = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const user = await User.findById(userId).populate('warehouseAssigned');

    if (!user || !user.warehouseAssigned) {
      return res.status(403).json({
        success: false,
        message: 'Manager must be assigned to a warehouse'
      });
    }

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Transfer not found'
      });
    }

    if (document.type !== 'TRANSFER') {
      return res.status(400).json({
        success: false,
        message: 'Document is not a transfer'
      });
    }

    if (document.warehouse.toString() !== user.warehouseAssigned._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage transfers from your assigned warehouse'
      });
    }

    if (document.status !== 'DRAFT') {
      return res.status(403).json({
        success: false,
        message: 'Can only delete transfers in DRAFT status'
      });
    }

    await DocumentLine.deleteMany({ document: req.params.id });
    await Document.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Transfer deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
