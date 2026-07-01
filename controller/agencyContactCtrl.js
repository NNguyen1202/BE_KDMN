const AgencyContact = require("../models/agencyContactModel");

const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const softDelete = require("../utils/softDelete");

//
// CREATE
//
const createAgencyContact = asyncHandler(async (req, res) => {
  try {
    const exist = await AgencyContact.findOne({
      agencyId: req.body.agencyId,
      isDelete: false,
    });

    if (exist) {
      return res.status(400).json({
        success: false,
        message: "Cơ quan này đã có thông tin liên hệ.",
      });
    }

    const agencyContact = await AgencyContact.create(req.body);

    res.status(201).json({
      success: true,
      data: agencyContact,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//
// UPDATE
//
const updateAgencyContact = asyncHandler(async (req, res) => {
  const { id } = req.params;

  validateMongoDbId(id);

  try {
    const agencyContact = await AgencyContact.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
      }
    );

    res.json({
      success: true,
      data: agencyContact,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//
// DELETE
//
const deleteAgencyContact = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await softDelete(AgencyContact, id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin liên hệ.",
      });
    }

    res.json({
      success: true,
      message: "Xóa thành công.",
      data: deleted,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//
// DETAIL
//
const getAgencyContact = asyncHandler(async (req, res) => {
  const { id } = req.params;

  validateMongoDbId(id);

  try {
    const agencyContact = await AgencyContact.findOne({
      _id: id,
      isDelete: false,
    }).populate("agencyId");

    if (!agencyContact) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy dữ liệu.",
      });
    }

    res.json({
      success: true,
      data: agencyContact,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//
// GET ALL
//
const getAllAgencyContacts = asyncHandler(async (req, res) => {
  try {
    const data = await AgencyContact.find({
      isDelete: false,
    })
      .populate("agencyId")
      .sort({
        address: 1,
      });

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//
// GET BY AGENCY
//
const getAgencyContactByAgency = asyncHandler(async (req, res) => {
  const { agencyId } = req.params;

  validateMongoDbId(agencyId);

  try {
    const data = await AgencyContact.findOne({
      agencyId,
      isDelete: false,
    }).populate("agencyId");

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//
// SEARCH
//
const searchAgencyContact = asyncHandler(async (req, res) => {
  try {
    const {
      keyword,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {
      isDelete: false,
    };

    if (keyword) {
      query.$or = [
        {
          address: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          phone: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          email: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          website: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          workingTime: {
            $regex: keyword,
            $options: "i",
          },
        },
      ];
    }

    const data = await AgencyContact.find(query)
      .populate("agencyId")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({
        address: 1,
      });

    const total = await AgencyContact.countDocuments(query);

    res.json({
      total,
      page: Number(page),
      limit: Number(limit),
      data,
    });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createAgencyContact,
  updateAgencyContact,
  deleteAgencyContact,
  getAgencyContact,
  getAllAgencyContacts,
  getAgencyContactByAgency,
  searchAgencyContact,
};