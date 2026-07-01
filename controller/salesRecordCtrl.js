const SalesRecord = require("../models/salesRecordModel");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const validateMongoDbId = require("../utils/validateMongodbId");
const moment = require("moment-timezone");

const createSalesRecord = asyncHandler(async (req, res) => {
  const record = await SalesRecord.create(req.body);

  res.status(201).json({
    success: true,
    data: record,
  });
});

const updateSalesRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;

  validateMongoDbId(id);

  const record = await SalesRecord.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  res.json({
    success: true,
    data: record,
  });
});

const deleteSalesRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;

  validateMongoDbId(id);

  const record = await SalesRecord.findByIdAndUpdate(
    id,
    {
      isDelete: true,
      status: false,
    },
    {
      new: true,
    },
  );

  res.json({
    success: true,
    data: record,
  });
});

const getSalesRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;

  validateMongoDbId(id);

  const record = await SalesRecord.findById(id).populate("userId", "-password");

  res.json({
    success: true,
    data: record,
  });
});

const getAllSalesRecord = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, fromDate, toDate } = req.query;

  const filter = {
    isDelete: false,
  };

  // Mặc định lấy tháng hiện tại
  const start = fromDate || moment().startOf("month").format("YYYY-MM-DD");

  const end = toDate || moment().endOf("month").format("YYYY-MM-DD");

  filter.reportDate = {
    $gte: new Date(start),
    $lte: new Date(end),
  };

  const skip = (Number(page) - 1) * Number(limit);

  const records = await SalesRecord.find(filter)
    .populate("userId", "-password")
    .sort({
      reportDate: -1,
      createdAt: -1,
    })
    .skip(skip)
    .limit(Number(limit));

  const total = await SalesRecord.countDocuments(filter);

  const summaryAgg = await SalesRecord.aggregate([
    {
      $match: {
        isDelete: false,
        reportDate: {
          $gte: new Date(start),
          $lte: new Date(end),
        },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: {
          $sum: "$revenue",
        },
        totalCustomers: {
          $sum: "$customerCount",
        },
        totalProducts: {
          $sum: "$productQuantity",
        },
      },
    },
  ]);

  res.json({
    success: true,
    records,
    summary: summaryAgg[0] || {
      totalRevenue: 0,
      totalCustomers: 0,
      totalProducts: 0,
    },
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

const searchSalesRecord = asyncHandler(async (req, res) => {
  const { keyword = "", productType, sourceType, userId } = req.query;

  const query = {
    isDelete: false,
  };

  if (productType) {
    query.productType = productType;
  }

  if (sourceType) {
    query.sourceType = sourceType;
  }

  if (userId) {
    query.userId = userId;
  }

  const data = await SalesRecord.find(query)
    .populate("userId", "-password")
    .sort({
      createdAt: -1,
    });

  res.json({
    success: true,
    data,
  });
});

const getByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { month, year } = req.query;

  const filter = {
    userId,
    isDelete: false,
  };

  if (month && year) {
    const start = new Date(Number(year), Number(month) - 1, 1);
    const end = new Date(Number(year), Number(month), 1);

    filter.reportDate = {
      $gte: start,
      $lt: end,
    };
  }

  const data = await SalesRecord.find(filter)
    .populate("userId", "-password")
    .sort({
      reportDate: -1,
    });

  res.json({
    success: true,
    data,
  });
});

const dashboardSales = asyncHandler(async (req, res) => {
  try {
    const now = new Date();

    const month = Number(req.query.month || now.getMonth() + 1);
    const year = Number(req.query.year || now.getFullYear());

    // Khoảng thời gian của THÁNG được chọn
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    // Khoảng thời gian của CẢ NĂM (để vẽ biểu đồ 12 tháng)
    const startYear = new Date(year, 0, 1);
    const endYear = new Date(year + 1, 0, 1);

    // =====================
    // KPI SUMMARY (THEO THÁNG)
    // =====================

    const summary = await SalesRecord.aggregate([
      {
        $match: {
          isDelete: false,
          reportDate: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$revenue" },
          totalCustomers: { $sum: "$customerCount" },
          totalProducts: { $sum: "$productQuantity" },
          totalRecords: { $sum: 1 },
        },
      },
    ]);

    // =====================
    // MONTHLY REVENUE (THEO NĂM)
    // =====================

    const monthlyRevenue = await SalesRecord.aggregate([
      {
        $match: {
          isDelete: false,
          reportDate: {
            $gte: startYear,
            $lt: endYear,
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$reportDate" },
          },
          revenue: { $sum: "$revenue" },
        },
      },
      {
        $sort: {
          "_id.month": 1,
        },
      },
    ]);

    // =====================
    // PRODUCT REVENUE (THEO THÁNG)
    // =====================

    const productRevenue = await SalesRecord.aggregate([
      {
        $match: {
          isDelete: false,
          reportDate: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: "$productType",
          revenue: { $sum: "$revenue" },
          customers: { $sum: "$customerCount" },
          quantity: { $sum: "$productQuantity" },
        },
      },
      {
        $sort: {
          revenue: -1,
        },
      },
    ]);

    // =====================
    // EMPLOYEE REVENUE (THEO THÁNG)
    // =====================

    const employeeRevenue = await SalesRecord.aggregate([
      {
        $match: {
          isDelete: false,
          reportDate: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: "$userId",
          revenue: { $sum: "$revenue" },
          customers: { $sum: "$customerCount" },
          quantity: { $sum: "$productQuantity" },
        },
      },
      {
        $sort: {
          revenue: -1,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
    ]);

    res.json({
      success: true,
      data: {
        summary: summary[0] || {
          totalRevenue: 0,
          totalCustomers: 0,
          totalProducts: 0,
          totalRecords: 0,
        },
        monthlyRevenue,
        productRevenue,
        employeeRevenue,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

const userDashboardSales = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;

    const now = new Date();

    const month = Number(req.query.month || now.getMonth() + 1);
    const year = Number(req.query.year || now.getFullYear());

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const summary = await SalesRecord.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          isDelete: false,
          reportDate: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$revenue" },
          totalCustomers: { $sum: "$customerCount" },
          totalProducts: { $sum: "$productQuantity" },
          totalRecords: { $sum: 1 },
        },
      },
    ]);

    const productRevenue = await SalesRecord.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          isDelete: false,
          reportDate: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: "$productType",
          revenue: { $sum: "$revenue" },
          customers: { $sum: "$customerCount" },
          quantity: { $sum: "$productQuantity" },
          records: { $sum: 1 },
        },
      },
      {
        $sort: {
          revenue: -1,
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        summary: summary[0] || {
          totalRevenue: 0,
          totalCustomers: 0,
          totalProducts: 0,
          totalRecords: 0,
        },
        productRevenue,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

const getCalendarRevenue = asyncHandler(async (req, res) => {
  try {
    const { month, year } = req.query;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const result = await SalesRecord.aggregate([
      {
        $match: {
          isDelete: false,
          reportDate: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$reportDate",
            },
          },
          totalRevenue: {
            $sum: "$revenue",
          },
          totalCustomers: {
            $sum: "$customerCount",
          },
          totalProducts: {
            $sum: "$productQuantity",
          },
          totalRecords: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

const getRevenueByDay = asyncHandler(async (req, res) => {
  try {
    const { date } = req.query;

    const start = new Date(date);
    const end = new Date(date);

    end.setDate(end.getDate() + 1);

    const records = await SalesRecord.find({
      reportDate: {
        $gte: start,
        $lt: end,
      },
    }).populate("userId");

    const summary = await SalesRecord.aggregate([
      {
        $match: {
          reportDate: {
            $gte: start,
            $lt: end,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$revenue",
          },
          totalCustomers: {
            $sum: "$customerCount",
          },
          totalProducts: {
            $sum: "$productQuantity",
          },
          totalRecords: {
            $sum: 1,
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      summary: summary[0] || {},
      records,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

const getMonthlyRevenue = asyncHandler(async (req, res) => {
  try {
    const now = new Date();

    const month = Number(req.query.month || now.getMonth() + 1);
    const year = Number(req.query.year || now.getFullYear());

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const revenue = await SalesRecord.aggregate([
      {
        $match: {
          isDelete: false,
          reportDate: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$revenue",
          },
        },
      },
    ]);

    const products = await SalesRecord.aggregate([
      {
        $match: {
          isDelete: false,
          reportDate: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: "$productType",
          revenue: {
            $sum: "$revenue",
          },
          customers: {
            $sum: "$customerCount",
          },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        month,
        year,
        totalRevenue: revenue[0]?.totalRevenue || 0,
        products,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

const getYearRevenue = asyncHandler(async (req, res) => {
  try {
    const year = Number(req.query.year || new Date().getFullYear());

    const startYear = new Date(year, 0, 1);
    const endYear = new Date(year + 1, 0, 1);

    const revenue = await SalesRecord.aggregate([
      {
        $match: {
          isDelete: false,
          reportDate: {
            $gte: startYear,
            $lt: endYear,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$revenue",
          },
        },
      },
    ]);

    const products = await SalesRecord.aggregate([
      {
        $match: {
          isDelete: false,
          reportDate: {
            $gte: startYear,
            $lt: endYear,
          },
        },
      },
      {
        $group: {
          _id: "$productType",
          revenue: {
            $sum: "$revenue",
          },
          customers: {
            $sum: "$customerCount",
          },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        year,
        totalRevenue: revenue[0]?.totalRevenue || 0,
        products,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

const getRangeSummary = asyncHandler(async (req, res) => {
  try {
    const { from, to } = req.query;

    const records = await SalesRecord.find({
      reportDate: {
        $gte: new Date(from),
        $lte: new Date(to),
      },
    });

    const summary = {
      totalRevenue: 0,
      totalCustomers: 0,
      totalProducts: 0,
      totalRecords: 0,

      easyHRMRevenue: 0,
      easyHRMCustomers: 0,

      iCareRevenue: 0,
      iCareCustomers: 0,
    };

    records.forEach((item) => {
      summary.totalRevenue += item.revenue || 0;

      summary.totalCustomers += item.customerCount || 0;

      summary.totalProducts += item.productQuantity || 0;

      summary.totalRecords += 1;

      if (item.productType === "EasyHRM MASS") {
        summary.easyHRMRevenue += item.revenue || 0;

        summary.easyHRMCustomers += item.customerCount || 0;
      }
      if (item.productType === "EasyHRM PROJECT") {
        summary.easyHRMRevenue += item.revenue || 0;

        summary.easyHRMCustomers += item.customerCount || 0;
      }

      if (item.productType === "iCare DN") {
        summary.iCareRevenue += item.revenue || 0;

        summary.iCareCustomers += item.customerCount || 0;
      }
      if (item.productType === "iCare HKD") {
        summary.iCareRevenue += item.revenue || 0;

        summary.iCareCustomers += item.customerCount || 0;
      }
    });

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = {
  createSalesRecord,
  updateSalesRecord,
  deleteSalesRecord,
  getSalesRecord,
  getAllSalesRecord,
  searchSalesRecord,
  getByUser,
  dashboardSales,
  userDashboardSales,
  getCalendarRevenue,
  getRevenueByDay,
  getRangeSummary,
  getMonthlyRevenue,
  getYearRevenue,
};
