import Contact from '../models/Contact.js';

export const getContacts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    let query = {};

    if (req.query.type) {
      query.type = req.query.type;
    }

    if (req.query.active !== undefined) {
      query.isActive = req.query.active === 'true';
    }

    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { mobileNo: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    const total = await Contact.countDocuments(query);

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalContacts: total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    };

    res.status(200).json({
      success: true,
      count: contacts.length,
      pagination,
      data: contacts
    });
  } catch (error) {
    next(error);
  }
};

export const getContact = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    next(error);
  }
};

export const createContact = async (req, res, next) => {
  try {
    const { name, email, mobileNo, address, type, userId, meta } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Contact name is required'
      });
    }

    const contact = await Contact.create({
      name,
      email,
      mobileNo,
      address,
      type: type || 'vendor',
      userId,
      meta: meta || {}
    });

    res.status(201).json({
      success: true,
      data: contact
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Contact already exists'
      });
    }
    next(error);
  }
};

export const updateContact = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    await Contact.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getContactsByType = async (req, res, next) => {
  try {
    const { type } = req.params;

    if (!['vendor', 'customer', 'internal'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contact type'
      });
    }

    const contacts = await Contact.find({ type, isActive: true });

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    next(error);
  }
};
