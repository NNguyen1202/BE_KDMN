const express = require("express");
const router = express.Router();

const {
  authMiddleware,
  isAdmin,
  isAdminAndManager,
} = require("../middlewares/authMiddleware");

const {
  createAgencyContact,
  updateAgencyContact,
  deleteAgencyContact,
  getAgencyContact,
  getAllAgencyContacts,
  getAgencyContactByAgency,
  searchAgencyContact,
} = require("../controller/agencyContactCtrl");

/**
 * @swagger
 * components:
 *   schemas:
 *     AgencyContact:
 *       type: object
 *       required:
 *         - agencyId
 *         - phone
 *       properties:
 *         agencyId:
 *           type: string
 *           example: "68580f12ab34567890abcd12"
 *
 *         phone:
 *           type: string
 *           example: "02623856789"
 *
 *         email:
 *           type: string
 *           example: "daklak@vss.gov.vn"
 *
 *         website:
 *           type: string
 *           example: "https://daklak.baohiemxahoi.gov.vn"
 *
 *         address:
 *           type: string
 *           example: "02 Nguyễn Tất Thành, TP Buôn Ma Thuột"
 *
 *         workingTime:
 *           type: string
 *           example: "Thứ 2 - Thứ 6 (07:30 - 17:00)"
 *
 *         note:
 *           type: string
 *           example: "Liên hệ giờ hành chính"
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
 * /api/agency-contact/create:
 *   post:
 *     summary: Tạo thông tin liên hệ cơ quan BHXH
 *     tags:
 *       - AgencyContact
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AgencyContact'
 *     responses:
 *       201:
 *         description: Thành công
 */
router.post(
  "/create",
  authMiddleware,
  isAdminAndManager,
  createAgencyContact
);

/**
 * @swagger
 * /api/agency-contact/search:
 *   get:
 *     summary: Tìm kiếm thông tin liên hệ
 *     tags:
 *       - AgencyContact
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
router.get("/search", authMiddleware, searchAgencyContact);

/**
 * @swagger
 * /api/agency-contact/all:
 *   get:
 *     summary: Lấy tất cả thông tin liên hệ
 *     tags:
 *       - AgencyContact
 *     security:
 *       - bearerAuth: []
 */
router.get("/all", authMiddleware, getAllAgencyContacts);

/**
 * @swagger
 * /api/agency-contact/agency/{agencyId}:
 *   get:
 *     summary: Lấy thông tin liên hệ theo cơ quan BHXH
 *     tags:
 *       - AgencyContact
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: agencyId
 *         required: true
 *         schema:
 *           type: string
 */
router.get(
  "/agency/:agencyId",
  authMiddleware,
  getAgencyContactByAgency
);

/**
 * @swagger
 * /api/agency-contact/{id}:
 *   get:
 *     summary: Chi tiết thông tin liên hệ
 *     tags:
 *       - AgencyContact
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get("/:id", authMiddleware, getAgencyContact);

/**
 * @swagger
 * /api/agency-contact/{id}:
 *   put:
 *     summary: Cập nhật thông tin liên hệ
 *     tags:
 *       - AgencyContact
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
 *             $ref: '#/components/schemas/AgencyContact'
 */
router.put(
  "/:id",
  authMiddleware,
  isAdminAndManager,
  updateAgencyContact
);

/**
 * @swagger
 * /api/agency-contact/{id}:
 *   delete:
 *     summary: Xóa mềm thông tin liên hệ
 *     tags:
 *       - AgencyContact
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete(
  "/:id",
  authMiddleware,
  isAdmin,
  deleteAgencyContact
);

module.exports = router;