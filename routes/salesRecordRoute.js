const express = require("express");
const router = express.Router();

const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const {
  createSalesRecord,
  updateSalesRecord,
  deleteSalesRecord,
  getSalesRecord,
  getAllSalesRecord,
  searchSalesRecord,
  getByUser,
  dashboardSales,
  getCalendarRevenue,
  getRevenueByDay,
  getRangeSummary,
  getMonthlyRevenue,
  getYearRevenue,
  userDashboardSales,
} = require("../controller/salesRecordCtrl");

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     SalesRecord:
 *       type: object
 *       required:
 *         - userId
 *         - productType
 *         - sourceType
 *         - customerCount
 *         - productQuantity
 *         - revenue
 *         - reportDate
 *       properties:
 *         _id:
 *           type: string
 *           example: 68581c4e5d2f9a001f85a999
 *
 *         userId:
 *           type: string
 *           example: 68581c4e5d2f9a001f85a123
 *
 *         productType:
 *           type: string
 *           enum:
 *             - EasyHRM MASS
 *             - EasyHRM PROJECT
 *             - iCare DN
 *             - iCare HKD
 *
 *         sourceType:
 *           type: string
 *           enum:
 *             - Marketing
 *             - ChuDong
 *             - CTV_DaiLy
 *
 *         customerCount:
 *           type: number
 *           example: 10
 *
 *         productQuantity:
 *           type: number
 *           example: 15
 *
 *         revenue:
 *           type: number
 *           example: 25000000
 *
 *         reportDate:
 *           type: string
 *           format: date
 *           example: 2026-06-24
 *
 *         note:
 *           type: string
 *           example: Khách hàng mới
 */

/**
 * @swagger
 * /api/sales-record/create:
 *   post:
 *     summary: Tạo doanh thu
 *     tags:
 *       - SalesRecord
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SalesRecord'
 *     responses:
 *       201:
 *         description: Tạo doanh thu thành công
 */
router.post("/create", authMiddleware, createSalesRecord);

/**
 * @swagger
 * /api/sales-record/search:
 *   get:
 *     summary: Tìm kiếm doanh thu
 *     tags:
 *       - SalesRecord
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *
 *       - in: query
 *         name: productType
 *         schema:
 *           type: string
 *
 *       - in: query
 *         name: sourceType
 *         schema:
 *           type: string
 *
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           example: 6
 *
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           example: 2026
 *
 *     responses:
 *       200:
 *         description: Danh sách doanh thu
 */
router.get("/search", authMiddleware, searchSalesRecord);

/**
 * @swagger
 * /api/sales-record/dashboard:
 *   get:
 *     summary: Dashboard doanh thu
 *     tags:
 *       - SalesRecord
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thống kê doanh thu dashboard
 */
router.get("/dashboard", authMiddleware, dashboardSales);

/**
 * @swagger
 * /api/sales-record/user/{userId}/dashboard:
 *   get:
 *     tags:
 *       - Sales Record
 *     summary: Lấy doanh thu của một nhân viên
 *     description: |
 *       Trả về danh sách doanh thu của nhân viên, có hỗ trợ lọc theo tháng hoặc năm
 *       và thống kê tổng doanh thu theo từng sản phẩm.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của nhân viên
 *
 *       - in: query
 *         name: month
 *         required: false
 *         schema:
 *           type: integer
 *           example: 6
 *         description: Tháng cần thống kê (1-12)
 *
 *       - in: query
 *         name: year
 *         required: false
 *         schema:
 *           type: integer
 *           example: 2026
 *         description: Năm cần thống kê
 *
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalRevenue:
 *                       type: number
 *                       example: 157800000
 *
 *                     totalCustomers:
 *                       type: integer
 *                       example: 23
 *
 *                     totalContracts:
 *                       type: integer
 *                       example: 28
 *
 *                     products:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           productType:
 *                             type: string
 *                             example: EasyHRM PROJECT
 *
 *                           revenue:
 *                             type: number
 *                             example: 85000000
 *
 *                           customers:
 *                             type: integer
 *                             example: 10
 *
 *                           quantity:
 *                             type: integer
 *                             example: 12
 *
 *                 records:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       productType:
 *                         type: string
 *                       revenue:
 *                         type: number
 *                       quantity:
 *                         type: integer
 *                       customer:
 *                         type: integer
 *                       reportDate:
 *                         type: string
 *                         format: date
 */
router.get("/user/:userId/dashboard", authMiddleware, userDashboardSales);

/**
 * @swagger
 * /api/sales-record/range-summary:
 *   get:
 *     summary: Thống kê doanh thu theo khoảng thời gian
 *     tags:
 *       - SalesRecord
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thống kê doanh thu theo khoảng thời gian
 */
router.get("/range-summary", getRangeSummary);

/**
 * @swagger
 * /api/sales-record/dashboard/monthly-revenue:
 *   get:
 *     summary: Thống kê tổng doanh thu theo tháng
 *     tags:
 *       - SalesRecord
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thống kê doanh thu theo khoảng thời gian
 */
router.get("/dashboard/monthly-revenue", getMonthlyRevenue);

/**
 * @swagger
 * /api/sales-record/dashboard/year-revenue:
 *   get:
 *     summary: Thống kê tổng doanh thu theo năm
 *     tags:
 *       - SalesRecord
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thống kê doanh thu theo khoảng thời gian
 */
router.get("/dashboard/year-revenue", getYearRevenue);

/**
 * @swagger
 * /api/sales-record/calendar:
 *   get:
 *     summary: Calendar doanh thu theo tháng
 *     tags:
 *       - SalesRecord
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *           example: 6
 *
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2026
 *
 *     responses:
 *       200:
 *         description: Dữ liệu calendar doanh thu
 */
router.get("/calendar", authMiddleware, getCalendarRevenue);

/**
 * @swagger
 * /api/sales-record/day:
 *   get:
 *     summary: Doanh thu chi tiết theo ngày
 *     tags:
 *       - SalesRecord
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: 2026-06-24
 *
 *     responses:
 *       200:
 *         description: Danh sách doanh thu trong ngày
 */
router.get("/day", authMiddleware, getRevenueByDay);

/**
 * @swagger
 * /api/sales-record/user/{userId}:
 *   get:
 *     summary: Doanh thu theo nhân viên
 *     tags:
 *       - SalesRecord
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của nhân viên
 *       - in: query
 *         name: month
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Tháng cần lọc (1-12)
 *       - in: query
 *         name: year
 *         required: false
 *         schema:
 *           type: integer
 *         description: Năm cần lọc, VD:2026
 *     responses:
 *       200:
 *         description: Danh sách doanh thu của nhân viên
 */
router.get("/user/:userId", authMiddleware, getByUser);

/**
 * @swagger
 * /api/sales-record/all:
 *   get:
 *     summary: Danh sách toàn bộ doanh thu
 *     tags:
 *       - SalesRecord
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách doanh thu
 */
router.get("/all", authMiddleware, getAllSalesRecord);

/**
 * @swagger
 * /api/sales-record/{id}:
 *   get:
 *     summary: Chi tiết doanh thu
 *     tags:
 *       - SalesRecord
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết doanh thu
 */
router.get("/:id", authMiddleware, getSalesRecord);

/**
 * @swagger
 * /api/sales-record/{id}:
 *   put:
 *     summary: Cập nhật doanh thu
 *     tags:
 *       - SalesRecord
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SalesRecord'
 *
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put("/:id", authMiddleware, updateSalesRecord);

/**
 * @swagger
 * /api/sales-record/{id}:
 *   delete:
 *     summary: Xóa doanh thu
 *     tags:
 *       - SalesRecord
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete("/:id", authMiddleware, isAdmin, deleteSalesRecord);

module.exports = router;
