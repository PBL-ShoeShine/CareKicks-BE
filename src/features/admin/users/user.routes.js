const express = require("express");
const router = express.Router();

const authMiddleware = require("../../../core/services/auth.middleware");
const userController = require("./user.controller");

const superAdminOnly = (req, res, next) => {
  const role = req.user?.role?.toLowerCase();

  if (role !== "superadmin") {
    return res.status(403).json({
      success: false,
      message: "Hanya SuperAdmin yang dapat mengakses fitur ini",
    });
  }

  return next();
};

router.use(authMiddleware, superAdminOnly);

router.get("/", userController.getUsers);
router.get("/:id", userController.getUserById);
router.post("/", userController.createUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
