import DocumentLine from '../models/DocumentLine.js';
import Document from '../models/Document.js';

export const getDocumentLines = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    let query = {};

    if (req.query.document) {
      query.document = req.query.document;
    }

    if (req.query.product) {
      query.product = req.query.product;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    const lines = await DocumentLine.find(query)
      .populate('document', 'reference type status')
      .populate('product', 'sku name category defaultUom')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    const total = await DocumentLine.countDocuments(query);

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalLines: total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    };

    res.status(200).json({
      success: true,
      count: lines.length,
      pagination,
      data: lines
    });
  } catch (error) {
    next(error);
  }
};

export const getDocumentLine = async (req, res, next) => {
  try {
    const line = await DocumentLine.findById(req.params.id)
      .populate('document', 'reference type status warehouse')
      .populate('product', 'sku name category defaultUom perUnitCost');

    if (!line) {
      return res.status(404).json({
        success: false,
        message: 'Document line not found'
      });
    }

    res.status(200).json({
      success: true,
      data: line
    });
  } catch (error) {
    next(error);
  }
};

export const createDocumentLine = async (req, res, next) => {
  try {
    const { document, product, uom, quantity, unitCost, meta } = req.body;

    if (!document || !product || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Document, product, and quantity are required'
      });
    }

    const docExists = await Document.findById(document);
    if (!docExists) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const line = await DocumentLine.create({
      document,
      product,
      uom: uom || 'PIECE',
      quantity,
      unitCost,
      status: 'PENDING',
      meta: meta || {}
    });

    await line.populate('product', 'sku name category defaultUom');

    res.status(201).json({
      success: true,
      data: line
    });
  } catch (error) {
    next(error);
  }
};

export const updateDocumentLine = async (req, res, next) => {
  try {
    const line = await DocumentLine.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('product', 'sku name category defaultUom');

    if (!line) {
      return res.status(404).json({
        success: false,
        message: 'Document line not found'
      });
    }

    res.status(200).json({
      success: true,
      data: line
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDocumentLine = async (req, res, next) => {
  try {
    const line = await DocumentLine.findById(req.params.id);

    if (!line) {
      return res.status(404).json({
        success: false,
        message: 'Document line not found'
      });
    }

    await DocumentLine.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Document line deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const updateLineStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['PENDING', 'PARTIAL', 'FULFILLED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const line = await DocumentLine.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('product', 'sku name');

    if (!line) {
      return res.status(404).json({
        success: false,
        message: 'Document line not found'
      });
    }

    res.status(200).json({
      success: true,
      data: line
    });
  } catch (error) {
    next(error);
  }
};

export const getDocumentLinesByDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const lines = await DocumentLine.find({ document: documentId })
      .populate('product', 'sku name category defaultUom perUnitCost')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: lines.length,
      data: lines
    });
  } catch (error) {
    next(error);
  }
};
