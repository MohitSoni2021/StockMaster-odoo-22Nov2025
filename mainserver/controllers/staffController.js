import Document from '../models/Document.js';
import DocumentLine from '../models/DocumentLine.js';
import Product from '../models/Product.js';
import Location from '../models/Location.js';
import StockBalance from '../models/StockBalance.js';
import StockLedger from '../models/StockLedger.js';

export const getStaffDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const warehouse = req.query.warehouse;

    let query = {
      $or: [
        { responsible: userId },
        { createdBy: userId }
      ]
    };

    if (warehouse) {
      query.warehouse = warehouse;
    }

    const receiptCount = await Document.countDocuments({
      ...query,
      type: 'RECEIPT',
      status: { $ne: 'DONE' }
    });

    const deliveryCount = await Document.countDocuments({
      ...query,
      type: 'DELIVERY',
      status: { $ne: 'DONE' }
    });

    const transferCount = await Document.countDocuments({
      ...query,
      type: 'TRANSFER',
      status: { $ne: 'DONE' }
    });

    const stockCountCount = await Document.countDocuments({
      ...query,
      type: 'ADJUSTMENT',
      status: { $ne: 'DONE' }
    });

    res.status(200).json({
      success: true,
      data: {
        receipts: receiptCount,
        deliveries: deliveryCount,
        transfers: transferCount,
        stockCounts: stockCountCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAssignedTasks = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const type = req.query.type;
    const status = req.query.status || 'WAITING';
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    let query = {
      $or: [
        { responsible: userId },
        { createdBy: userId }
      ]
    };

    if (type) {
      query.type = type;
    }

    if (status) {
      query.status = status;
    }

    const documents = await Document.find(query)
      .populate('warehouse', 'name shortCode')
      .populate('from', 'name email')
      .populate('to', 'name email')
      .populate('fromLocation', 'name shortCode')
      .populate('toLocation', 'name shortCode')
      .sort({ scheduleDate: 1, createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    const total = await Document.countDocuments(query);

    res.status(200).json({
      success: true,
      data: documents,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getTaskDetail = async (req, res, next) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id)
      .populate('warehouse', 'name shortCode')
      .populate('from', 'name email mobileNo')
      .populate('to', 'name email mobileNo')
      .populate('fromLocation', 'name shortCode')
      .populate('toLocation', 'name shortCode')
      .populate('responsible', 'name email')
      .populate('createdBy', 'name email');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const lines = await DocumentLine.find({ document: id })
      .populate('product', 'sku name category defaultUom perUnitCost');

    const stocks = await StockBalance.find({ warehouse: document.warehouse })
      .populate('product', 'sku name')
      .populate('location', 'name shortCode');

    res.status(200).json({
      success: true,
      data: {
        document,
        lines,
        stocks
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const performReceipt = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { lineUpdates } = req.body;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    if (document.type !== 'RECEIPT') {
      return res.status(400).json({
        success: false,
        message: 'Document is not a receipt'
      });
    }

    for (const update of lineUpdates) {
      const line = await DocumentLine.findByIdAndUpdate(
        update.lineId,
        {
          status: 'FULFILLED',
          meta: { receivedQuantity: update.receivedQuantity, ...update.meta }
        },
        { new: true }
      );

      const stockBalance = await StockBalance.findOne({
        product: line.product,
        warehouse: document.warehouse,
        location: null
      });

      if (stockBalance) {
        stockBalance.quantity += update.receivedQuantity;
        stockBalance.lastUpdatedAt = new Date();
        await stockBalance.save();
      } else {
        await StockBalance.create({
          product: line.product,
          warehouse: document.warehouse,
          quantity: update.receivedQuantity,
          reservedQuantity: 0
        });
      }

      await StockLedger.create({
        product: line.product,
        warehouse: document.warehouse,
        documentType: 'RECEIPT',
        documentRef: document.reference,
        quantity: update.receivedQuantity,
        type: 'IN',
        remarks: `Receipt ${document.reference}`,
        user: req.user._id
      });
    }

    document.status = 'READY';
    await document.save();

    res.status(200).json({
      success: true,
      message: 'Receipt processed successfully',
      data: document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const performDelivery = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { lineUpdates } = req.body;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    if (document.type !== 'DELIVERY') {
      return res.status(400).json({
        success: false,
        message: 'Document is not a delivery'
      });
    }

    for (const update of lineUpdates) {
      const line = await DocumentLine.findByIdAndUpdate(
        update.lineId,
        {
          status: 'FULFILLED',
          meta: { pickedQuantity: update.pickedQuantity, ...update.meta }
        },
        { new: true }
      );

      const stockBalance = await StockBalance.findOne({
        product: line.product,
        warehouse: document.warehouse
      });

      if (stockBalance) {
        if (stockBalance.quantity >= update.pickedQuantity) {
          stockBalance.quantity -= update.pickedQuantity;
          stockBalance.lastUpdatedAt = new Date();
          await stockBalance.save();
        } else {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for product ${line.product}`
          });
        }
      }

      await StockLedger.create({
        product: line.product,
        warehouse: document.warehouse,
        documentType: 'DELIVERY',
        documentRef: document.reference,
        quantity: update.pickedQuantity,
        type: 'OUT',
        remarks: `Delivery ${document.reference}`,
        user: req.user._id
      });
    }

    document.status = 'READY';
    await document.save();

    res.status(200).json({
      success: true,
      message: 'Delivery processed successfully',
      data: document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const performTransfer = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { lineUpdates } = req.body;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    if (document.type !== 'TRANSFER') {
      return res.status(400).json({
        success: false,
        message: 'Document is not a transfer'
      });
    }

    for (const update of lineUpdates) {
      const line = await DocumentLine.findByIdAndUpdate(
        update.lineId,
        {
          status: 'FULFILLED',
          meta: { transferredQuantity: update.transferredQuantity, ...update.meta }
        },
        { new: true }
      );

      const fromBalance = await StockBalance.findOne({
        product: line.product,
        location: document.fromLocation
      });

      if (fromBalance) {
        if (fromBalance.quantity >= update.transferredQuantity) {
          fromBalance.quantity -= update.transferredQuantity;
          await fromBalance.save();
        } else {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock at source location`
          });
        }
      }

      const toBalance = await StockBalance.findOne({
        product: line.product,
        location: document.toLocation
      });

      if (toBalance) {
        toBalance.quantity += update.transferredQuantity;
        await toBalance.save();
      } else {
        await StockBalance.create({
          product: line.product,
          warehouse: document.warehouse,
          location: document.toLocation,
          quantity: update.transferredQuantity,
          reservedQuantity: 0
        });
      }

      await StockLedger.create({
        product: line.product,
        warehouse: document.warehouse,
        documentType: 'TRANSFER',
        documentRef: document.reference,
        quantity: update.transferredQuantity,
        type: 'INTERNAL',
        remarks: `Transfer from ${document.fromLocation} to ${document.toLocation}`,
        user: req.user._id
      });
    }

    document.status = 'READY';
    await document.save();

    res.status(200).json({
      success: true,
      message: 'Transfer completed successfully',
      data: document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const performStockCount = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { lineUpdates } = req.body;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    if (document.type !== 'ADJUSTMENT') {
      return res.status(400).json({
        success: false,
        message: 'Document is not a stock count'
      });
    }

    for (const update of lineUpdates) {
      await DocumentLine.findByIdAndUpdate(
        update.lineId,
        {
          status: 'FULFILLED',
          meta: { countedQuantity: update.countedQuantity, ...update.meta }
        },
        { new: true }
      );
    }

    document.status = 'READY';
    await document.save();

    res.status(200).json({
      success: true,
      message: 'Stock count submitted successfully',
      data: document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const searchProduct = async (req, res, next) => {
  try {
    const { sku, name, barcode } = req.query;
    const warehouse = req.query.warehouse;

    let query = { isActive: true };

    if (sku) {
      query.sku = { $regex: sku, $options: 'i' };
    }

    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }

    if (barcode) {
      query.sku = barcode;
    }

    const products = await Product.find(query).limit(20);

    const enrichedProducts = await Promise.all(
      products.map(async (product) => {
        const stocks = await StockBalance.find({
          product: product._id,
          ...(warehouse && { warehouse })
        }).populate('location', 'name shortCode');

        return {
          ...product.toObject(),
          stocks
        };
      })
    );

    res.status(200).json({
      success: true,
      data: enrichedProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getLocationStock = async (req, res, next) => {
  try {
    const { locationId } = req.params;

    const location = await Location.findById(locationId).populate('warehouse');

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    const stocks = await StockBalance.find({ location: locationId })
      .populate('product', 'sku name category defaultUom')
      .sort({ product: 1 });

    res.status(200).json({
      success: true,
      data: {
        location,
        stocks
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['DRAFT', 'WAITING', 'READY', 'DONE', 'CANCELED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const document = await Document.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
