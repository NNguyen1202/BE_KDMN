const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const { getMonthReports, upsertDay, recalcTotals } = require("../controller/monthlyReportCtrl");

/**
 * @swagger
 * tags:
 *   name: MonthlyReport
 *   description: Quản lý báo cáo theo tháng
 */

/**
 * @swagger
 * /api/monthly-report/{month}:
 *   get:
 *     summary: Lấy danh sách báo cáo cho tháng (kèm user info)
 *     tags: [MonthlyReport]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: month
 *         schema:
 *           type: string
 *           example: "2025-09"
 *         required: true
 *         description: Tháng định dạng YYYY-MM
 *     responses:
 *       200:
 *         description: Danh sách báo cáo (mảng)
 *       500:
 *         description: Lỗi server
 */
router.get("/:month", authMiddleware, getMonthReports);

/**
 * @swagger
 * /api/monthly-report/{month}/{userId}/day/{day}:
 *   put:
 *     summary: Upsert dữ liệu cho 1 ngày của user trong tháng
 *     tags: [MonthlyReport]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: month
 *         required: true
 *         schema:
 *           type: string
 *           example: "2025-09"
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: day
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               DN:
 *                 type: object
 *                 properties:
 *                   amount: { type: number, example: 1 }
 *                   money: { type: number, example: 1000000 }
 *               HKD:
 *                 type: object
 *                 properties:
 *                   amount: { type: number, example: 0 }
 *                   money: { type: number, example: 0 }
 *               HRM:
 *                 type: object
 *                 properties:
 *                   amount: { type: number, example: 0 }
 *                   money: { type: number, example: 0 }
 *               money:
 *                 type: number
 *                 example: 1000000
 *     responses:
 *       200:
 *         description: Báo cáo ngày được lưu và totals đã cập nhật
 *       500:
 *         description: Lỗi server
 */
router.put("/:month/:userId/day/:day", authMiddleware, upsertDay);

/**
 * @swagger
 * /api/monthly-report/{month}/{userId}/recalculate:
 *   put:
 *     summary: Tính lại totals cho 1 user trong tháng
 *     tags: [MonthlyReport]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: month
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tổng đã được tính lại
 *       500:
 *         description: Lỗi server
 */
router.put("/:month/:userId/recalculate", authMiddleware, recalcTotals);

module.exports = router;
