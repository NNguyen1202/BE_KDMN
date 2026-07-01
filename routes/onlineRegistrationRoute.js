const express = require("express");
const router = express.Router();

const {
  authMiddleware,
  isAdmin,
  isAdminAndManager,
} = require("../middlewares/authMiddleware");

const {
  createOnlineRegistration,
  updateOnlineRegistration,
  deleteOnlineRegistration,
  getOnlineRegistration,
  getAllOnlineRegistrations,
  getOnlineRegistrationByAgency,
  searchOnlineRegistration,
} = require("../controller/onlineRegistrationCtrl");

/**
 * @swagger
 * components:
 *   schemas:
 *     OnlineRegistration:
 *       type: object
 *       required:
 *         - agencyId
 *         - registrationType
 *       properties:
 *         agencyId:
 *           type: string
 *           example: "68580f12ab34567890abcd12"
 *
 *         registrationType:
 *           type: string
 *           example: "Online"
 *
 *         registrationUrl:
 *           type: string
 *           example: "https://dichvucong.baohiemxahoi.gov.vn"
 *
 *         guideUrl:
 *           type: string
 *           example: "https://baohiemxahoi.gov.vn"
 *
 *         note:
 *           type: string
 *           example: "Thực hiện qua Cổng DVC Quốc gia"
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
 * /api/online-registration/create:
 *   post:
 *     summary: Tạo thông tin đăng ký mã đơn vị
 *     tags:
 *       - OnlineRegistration
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OnlineRegistration'
 *     responses:
 *       201:
 *         description: Thành công
 */
router.post(
  "/create",
  authMiddleware,
  isAdminAndManager,
  createOnlineRegistration,
);

/**
 * @swagger
 * /api/online-registration/search:
 *   get:
 *     summary: Tìm kiếm thông tin đăng ký
 *     tags:
 *       - OnlineRegistration
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
 */
router.get("/search", authMiddleware, searchOnlineRegistration);

/**
 * @swagger
 * /api/online-registration/all:
 *   get:
 *     summary: Lấy tất cả hình thức đăng ký
 *     tags:
 *       - OnlineRegistration
 *     security:
 *       - bearerAuth: []
 */
router.get("/all", authMiddleware, getAllOnlineRegistrations);

/**
 * @swagger
 * /api/online-registration/agency/{agencyId}:
 *   get:
 *     summary: Lấy theo cơ quan BHXH
 *     tags:
 *       - OnlineRegistration
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: agencyId
 *         required: true
 *         schema:
 *           type: string
 */
router.get("/agency/:agencyId", authMiddleware, getOnlineRegistrationByAgency);

/**
 * @swagger
 * /api/online-registration/{id}:
 *   get:
 *     summary: Chi tiết thông tin đăng ký
 *     tags:
 *       - OnlineRegistration
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get("/:id", authMiddleware, getOnlineRegistration);

/**
 * @swagger
 * /api/online-registration/{id}:
 *   put:
 *     summary: Cập nhật thông tin đăng ký
 *     tags:
 *       - OnlineRegistration
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
 *             $ref: '#/components/schemas/OnlineRegistration'
 */
router.put("/:id", authMiddleware, isAdminAndManager, updateOnlineRegistration);

/**
 * @swagger
 * /api/online-registration/{id}:
 *   delete:
 *     summary: Xóa mềm thông tin đăng ký
 *     tags:
 *       - OnlineRegistration
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete("/:id", authMiddleware, isAdmin, deleteOnlineRegistration);

module.exports = router;
