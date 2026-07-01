const OnlineRegistration = require("../models/onlineRegistrationModel");

const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const softDelete = require("../utils/softDelete");

//
// CREATE
//
const createOnlineRegistration = asyncHandler(async (req, res) => {
  try {
    const exist = await OnlineRegistration.findOne({
      agencyId: req.body.agencyId,
      isDelete: false,
    });

    if (exist) {
      return res.status(400).json({
        success: false,
        message: "Cơ quan này đã có thông tin đăng ký online.",
      });
    }

    const onlineRegistration = await OnlineRegistration.create(req.body);

    res.status(201).json({
      success: true,
      data: onlineRegistration,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//
// UPDATE
//
const updateOnlineRegistration = asyncHandler(async (req, res) => {
  const { id } = req.params;

  validateMongoDbId(id);

  try {
    const onlineRegistration = await OnlineRegistration.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
      }
    );

    res.json({
      success: true,
      data: onlineRegistration,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//
// DELETE
//
const deleteOnlineRegistration = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await softDelete(OnlineRegistration, id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin đăng ký online.",
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
const getOnlineRegistration = asyncHandler(async (req, res) => {
  const { id } = req.params;

  validateMongoDbId(id);

  try {
    const onlineRegistration = await OnlineRegistration.findOne({
      _id: id,
      isDelete: false,
    }).populate("agencyId");

    if (!onlineRegistration) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy dữ liệu.",
      });
    }

    res.json({
      success: true,
      data: onlineRegistration,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//
// GET ALL
//
const getAllOnlineRegistrations = asyncHandler(async (req, res) => {
  try {
    const data = await OnlineRegistration.find({
      isDelete: false,
    })
      .populate("agencyId")
      .sort({
        createdAt: -1,
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
const getOnlineRegistrationByAgency = asyncHandler(async (req, res) => {
  const { agencyId } = req.params;

  validateMongoDbId(agencyId);

  try {
    const data = await OnlineRegistration.findOne({
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
const searchOnlineRegistration = asyncHandler(async (req, res) => {
  try {
    const {
      keyword,
      supportOnline,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {
      isDelete: false,
    };

    if (supportOnline !== undefined) {
      query.supportOnline = supportOnline === "true";
    }

    if (keyword) {
      query.$or = [
        {
          registerUrl: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          guide: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          note: {
            $regex: keyword,
            $options: "i",
          },
        },
      ];
    }

    const data = await OnlineRegistration.find(query)
      .populate("agencyId")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({
        createdAt: -1,
      });

    const total = await OnlineRegistration.countDocuments(query);

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
  createOnlineRegistration,
  updateOnlineRegistration,
  deleteOnlineRegistration,
  getOnlineRegistration,
  getAllOnlineRegistrations,
  getOnlineRegistrationByAgency,
  searchOnlineRegistration,
};