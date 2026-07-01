const PaymentAccount = require("../models/paymentAccountModel");

const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const softDelete = require("../utils/softDelete");

//
// CREATE
//
const createPaymentAccount = asyncHandler(async (req, res) => {
  try {
    const exist = await PaymentAccount.findOne({
      agencyId: req.body.agencyId,
      bankName: req.body.bankName,
      accountNumber: req.body.accountNumber,
      isDelete: false,
    });

    if (exist) {
      return res.status(400).json({
        success: false,
        message: "Tài khoản đóng tiền đã tồn tại.",
      });
    }

    const paymentAccount = await PaymentAccount.create(req.body);

    res.status(201).json({
      success: true,
      data: paymentAccount,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//
// UPDATE
//
const updatePaymentAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;

  validateMongoDbId(id);

  try {
    const paymentAccount = await PaymentAccount.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
      }
    );

    res.json({
      success: true,
      data: paymentAccount,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//
// DELETE
//
const deletePaymentAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await softDelete(PaymentAccount, id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản đóng tiền.",
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
const getPaymentAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;

  validateMongoDbId(id);

  try {
    const paymentAccount = await PaymentAccount.findOne({
      _id: id,
      isDelete: false,
    }).populate("agencyId");

    if (!paymentAccount) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản.",
      });
    }

    res.json({
      success: true,
      data: paymentAccount,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//
// GET ALL
//
const getAllPaymentAccounts = asyncHandler(async (req, res) => {
  try {
    const paymentAccounts = await PaymentAccount.find({
      isDelete: false,
    })
      .populate("agencyId")
      .sort({
        bankName: 1,
      });

    res.json({
      success: true,
      data: paymentAccounts,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//
// GET BY AGENCY
//
const getPaymentAccountByAgency = asyncHandler(async (req, res) => {
  const { agencyId } = req.params;

  validateMongoDbId(agencyId);

  try {
    const paymentAccounts = await PaymentAccount.find({
      agencyId,
      isDelete: false,
    })
      .populate("agencyId")
      .sort({
        bankName: 1,
      });

    res.json({
      success: true,
      data: paymentAccounts,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//
// SEARCH
//
const searchPaymentAccount = asyncHandler(async (req, res) => {
  try {
    const {
      keyword,
      agencyId,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {
      isDelete: false,
    };

    if (agencyId) {
      query.agencyId = agencyId;
    }

    if (keyword) {
      query.$or = [
        {
          bankName: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          accountName: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          accountNumber: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          transferContent: {
            $regex: keyword,
            $options: "i",
          },
        },
      ];
    }

    const data = await PaymentAccount.find(query)
      .populate("agencyId")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({
        bankName: 1,
      });

    const total = await PaymentAccount.countDocuments(query);

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
  createPaymentAccount,
  updatePaymentAccount,
  deletePaymentAccount,
  getPaymentAccount,
  getAllPaymentAccounts,
  getPaymentAccountByAgency,
  searchPaymentAccount,
};