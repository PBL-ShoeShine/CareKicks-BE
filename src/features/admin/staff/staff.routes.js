const express = require("express");
const router = express.Router();
const StaffController = require("./staff.controller");
const authMiddleware = require("../../../core/services/auth.middleware");

// Pastikan urutan rute benar dan semua fungsi di Controller tersedia
router.post("/register", authMiddleware, StaffController.createStaff);
router.get("/", authMiddleware, StaffController.getStaffList);
router.get("/:id", authMiddleware, StaffController.getStaffById);
router.patch("/:id", authMiddleware, StaffController.updateStaffStatus);
router.delete("/:id", authMiddleware, StaffController.deleteStaff);

module.exports = router;