import Document from '../models/Document.js';
import DocumentLine from '../models/DocumentLine.js';

const generateReference = (type) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${type}-${timestamp}-${random}`;
};

export const getDocuments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    let query = {};

    if (req.query.type) {
      query.type = req.query.type;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.warehouse) {
      query.warehouse = req.query.warehouse;
    }

    if (req.query.search) {
      query.reference = { $regex: req.query.search, $options: 'i' };
    }

    const documents = await Document.find(query)
      .populate('warehouse', 'name shortCode')
      .populate('from', 'name email')
      .populate('to', 'name email')
      .populate('toWarehouse', 'name shortCode')
      .populate('contact', 'name email')
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
      count: documents.length,
      pagination,
      data: documents
    });
  } catch (error) {
    next(error);
  }
};

export const getDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('warehouse', 'name shortCode address')
      .populate('from', 'name email mobileNo address type')
      .populate('to', 'name email mobileNo address type')
      .populate('toWarehouse', 'name shortCode address')
      .populate('fromLocation', 'name code')
      .populate('toLocation', 'name code')
      .populate('contact')
      .populate('createdBy', 'name email')
      .populate('validatedBy', 'name email');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const lines = await DocumentLine.find({ document: req.params.id })
      .populate('product', 'sku name category defaultUom');

    res.status(200).json({
      success: true,
      data: {
        ...document.toObject(),
        lines
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createDocument = async (req, res, next) => {
  try {
    const { type, warehouse, from, to, toWarehouse, fromLocation, toLocation, contact, contactRef, scheduleDate, notes, meta, createdBy } = req.body;
    const userId = req.user?._id || req.user?.id;

    if (!type || !warehouse) {
      return res.status(400).json({
        success: false,
        message: 'Type and warehouse are required'
      });
    }

    if (type === 'RECEIPT' && !from) {
      return res.status(400).json({
        success: false,
        message: 'For RECEIPT, "from" contact is required'
      });
    }

    if (type === 'DELIVERY' && !to) {
      return res.status(400).json({
        success: false,
        message: 'For DELIVERY, "to" contact is required'
      });
    }

    if (type === 'TRANSFER' && !toWarehouse) {
      return res.status(400).json({
        success: false,
        message: 'For TRANSFER, destination warehouse is required'
      });
    }

    const reference = generateReference(type);

    const document = await Document.create({
      reference,
      type,
      warehouse,
      from,
      to,
      toWarehouse,
      fromLocation,
      toLocation,
      contact,
      contactRef,
      scheduleDate,
      notes,
      status: 'DRAFT',
      meta: meta || {},
      createdBy,
      owner: userId
    });

    res.status(201).json({
      success: true,
      data: document
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.reference) {
      return res.status(400).json({
        success: false,
        message: 'Document reference already exists'
      });
    }
    next(error);
  }
};

export const updateDocument = async (req, res, next) => {
  try {
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('warehouse', 'name shortCode')
     .populate('from', 'name email')
     .populate('to', 'name email')
     .populate('toWarehouse', 'name shortCode')
     .populate('createdBy', 'name email');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    const userId = req.user?._id || req.user?.id;

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    if (document.status === 'READY' || document.status === 'DONE') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete an approved document'
      });
    }

    if (document.owner?.toString() !== userId?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this document'
      });
    }

    await DocumentLine.deleteMany({ document: req.params.id });
    await Document.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const validateDocument = async (req, res, next) => {
  try {
    const { validatedBy } = req.body;

    if (!validatedBy) {
      return res.status(400).json({
        success: false,
        message: 'Validated by user is required'
      });
    }

    const document = await Document.findByIdAndUpdate(
      req.params.id,
      {
        status: 'READY',
        validatedBy,
        validatedAt: new Date()
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('warehouse', 'name shortCode')
     .populate('from', 'name email')
     .populate('to', 'name email')
     .populate('toWarehouse', 'name shortCode')
     .populate('validatedBy', 'name email');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Document validated successfully',
      data: document
    });
  } catch (error) {
    next(error);
  }
};

export const updateDocumentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['DRAFT', 'WAITING', 'READY', 'DONE', 'CANCELED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('warehouse', 'name shortCode')
     .populate('from', 'name email')
     .populate('to', 'name email')
     .populate('toWarehouse', 'name shortCode');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
};

export const getDocumentStats = async (req, res, next) => {
  try {
    const totalDocuments = await Document.countDocuments();
    const byStatus = await Document.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const byType = await Document.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalDocuments,
        byStatus,
        byType
      }
    });
  } catch (error) {
    next(error);
  }
};
