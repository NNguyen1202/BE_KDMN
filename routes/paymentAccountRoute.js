const express = require("express");
const router = express.Router();

const {
  authMiddleware,
  isAdmin,
  isAdminAndManager,
} = require("../middlewares/authMiddleware");

const {
  createPaymentAccount,
  updatePaymentAccount,
  deletePaymentAccount,
  getPaymentAccount,
  getAllPaymentAccounts,
  getPaymentAccountByAgency,
  searchPaymentAccount,
} = require("../controller/paymentAccountCtrl");

/**
 * @swagger
 * components:
 *   schemas:
 *     PaymentAccount:
 *       type: object
 *       required:
 *         - agencyId
 *         - bankName
 *         - accountName
 *         - accountNumber
 *       properties:
 *         agencyId:
 *           type: string
 *           example: "68580f12ab34567890abcd12"
 *
 *         bankName:
 *           type: string
 *           example: "Vietcombank"
 *
 *         accountName:
 *           type: string
 *           example: "BHXH TP Buôn Ma Thuột"
 *
 *         accountNumber:
 *           type: string
 *           example: "1020101234567"
 *
 *         transferContent:
 *           type: string
 *           example: "123456789"
 *
 *         note:
 *           type: string
 *           example: "Đóng BHXH tháng 06/2026"
 *
 *         status:
 *           type: boolean
 *           default: true
 *
 *         isDelete:
 *           type: boolean
 *           default: false
 */

/**
 * @swagger
 * /api/payment-account/create:
 *   post:
 *     summary: Tạo tài khoản đóng tiền
 *     tags:
 *       - PaymentAccount
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentAccount'
 *     responses:
 *       201:
 *         description: Thành công
 */
router.post(
  "/create",
  authMiddleware,
  isAdminAndManager,
  createPaymentAccount
);

/**
 * @swagger
 * /api/payment-account/search:
 *   get:
 *     summary: Tìm kiếm tài khoản đóng tiền
 *     tags:
 *       - PaymentAccount
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *
 *       - in: query
 *         name: agencyId
 *         schema:
 *           type: string
 *
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/search", authMiddleware, searchPaymentAccount);

/**
 * @swagger
 * /api/payment-account/all:
 *   get:
 *     summary: Lấy tất cả tài khoản đóng tiền
 *     tags:
 *       - PaymentAccount
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/all", authMiddleware, getAllPaymentAccounts);

/**
 * @swagger
 * /api/payment-account/agency/{agencyId}:
 *   get:
 *     summary: Danh sách tài khoản theo cơ quan BHXH
 *     tags:
 *       - PaymentAccount
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: agencyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get(
  "/agency/:agencyId",
  authMiddleware,
  getPaymentAccountByAgency
);

/**
 * @swagger
 * /api/payment-account/{id}:
 *   get:
 *     summary: Chi tiết tài khoản đóng tiền
 *     tags:
 *       - PaymentAccount
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
 *         description: Thành công
 */
router.get("/:id", authMiddleware, getPaymentAccount);

/**
 * @swagger
 * /api/payment-account/{id}:
 *   put:
 *     summary: Cập nhật tài khoản đóng tiền
 *     tags:
 *       - PaymentAccount
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentAccount'
 *     responses:
 *       200:
 *         description: Thành công
 */
router.put(
  "/:id",
  authMiddleware,
  isAdminAndManager,
  updatePaymentAccount
);

/**
 * @swagger
 * /api/payment-account/{id}:
 *   delete:
 *     summary: Xóa mềm tài khoản đóng tiền
 *     tags:
 *       - PaymentAccount
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
 *         description: Thành công
 */
router.delete(
  "/:id",
  authMiddleware,
  isAdmin,
  deletePaymentAccount
);

module.exports = router;