const axios = require("axios");
const MonthlyReport = require("../models/monthlyReportModel");

// Thay bằng URL Web App Google Sheet của bạn
const SHEET_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwSWUZyExt_yx_J-1AK-9jR7mud1ARxW1oBn-MCOVQ_bFMn3t0mPwfZD2L75R-NiVrM6g/exec";

/**
 * Lấy dữ liệu tháng
 * GET /api/monthly-report/:month
 */
const getMonthReports = async (req, res) => {
  try {
    const { month } = req.params;

    // Lấy dữ liệu từ Google Sheet theo tháng
    const response = await axios.get(`${SHEET_WEB_APP_URL}?month=${month}`);
    const sheetDataRaw = response.data;

    // Nếu Web App trả về { status, data }
    const sheetData = Array.isArray(sheetDataRaw) 
      ? sheetDataRaw 
      : (sheetDataRaw.data || []);

    // Đồng bộ vào DB
    await MonthlyReport.deleteMany({ month });
    const dbData = sheetData.map(r => ({ ...r, month }));
    await MonthlyReport.insertMany(dbData);

    res.json({ status: "success", data: sheetData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};


/**
 * Upsert dữ liệu 1 ngày cho user
 * PUT /api/monthly-report/:month/:userId/day/:day
 */
const upsertDay = async (req, res) => {
  try {
    const { month, userId, day } = req.params;
    const { DN, HKD, HRM, money } = req.body;

    // Gửi dữ liệu lên Google Sheet
    await axios.post(SHEET_WEB_APP_URL, {
      month,
      action: "upsertDay",
      userId,
      day,
      data: { DN, HKD, HRM, money }
    });

    // Cập nhật DB
    const report = await MonthlyReport.findOneAndUpdate(
      { month, userId },
      { $set: { [`days.${day}`]: { DN, HKD, HRM, money } } },
      { upsert: true, new: true }
    );

    res.json({ status: "success", data: report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

/**
 * Tính lại totals cho user
 * PUT /api/monthly-report/:month/:userId/recalculate
 */
const recalcTotals = async (req, res) => {
  try {
    const { month, userId } = req.params;

    // Lấy report hiện tại
    const report = await MonthlyReport.findOne({ month, userId });
    if (!report) return res.status(404).json({ status: "error", message: "User not found" });

    // Tính tổng
    let totalDN = 0, totalHKD = 0, totalHRM = 0, totalMoney = 0;
    if (report.days) {
      Object.values(report.days).forEach(day => {
        totalDN += day.DN?.amount || 0;
        totalHKD += day.HKD?.amount || 0;
        totalHRM += day.HRM?.amount || 0;
        totalMoney += day.money || 0;
      });
    }

    // Cập nhật totals vào DB
    report.totals = { DN: totalDN, HKD: totalHKD, HRM: totalHRM, money: totalMoney };
    await report.save();

    // Đồng bộ lên Google Sheet
    await axios.post(SHEET_WEB_APP_URL, {
      month,
      action: "recalculate",
      userId,
      data: report.totals
    });

    res.json({ status: "success", data: report.totals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

module.exports = { getMonthReports, upsertDay, recalcTotals };
