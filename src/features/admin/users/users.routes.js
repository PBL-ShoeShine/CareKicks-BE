const express = require("express");
const router = express.Router();
const usersController = require("./users.controller");
const authMiddleware = require("../../../core/services/auth.middleware");

const superadminOnly = (req, res, next) => {
  if (req.user && req.user.role === "superadmin") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Akses ditolak: Hanya SuperAdmin yang diizinkan."
    });
  }
};

router.get("/", authMiddleware, superadminOnly, usersController.getUsers);
router.post("/", authMiddleware, superadminOnly, usersController.createUser);
router.put("/:id", authMiddleware, superadminOnly, usersController.updateUser);
router.delete("/:id", authMiddleware, superadminOnly, usersController.deleteUser);

module.exports = router;
