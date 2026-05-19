const express = require("express");
const router = express.Router();
const inventarisController = require("./inventaris.controller");
const authMiddleware = require("../../../core/services/auth.middleware");
const upload = require("../../../core/services/upload.middleware");

// GET all inventory items
router.get("/", authMiddleware, inventarisController.getInventory);

// GET inventory summary
router.get("/summary", authMiddleware, inventarisController.getSummary);

// CREATE inventory item
router.post("/", authMiddleware, upload.single("foto_inven"), inventarisController.createItem);

// UPDATE inventory item
router.patch("/:id", authMiddleware, upload.single("foto_inven"), inventarisController.updateItem);

// DELETE inventory item
router.delete("/:id", authMiddleware, inventarisController.deleteItem);

// ADD stock (increment)
router.post("/:id/add-stock", authMiddleware, inventarisController.addStock);

// REDUCE stock (decrement)
router.post("/:id/reduce-stock", authMiddleware, inventarisController.reduceStock);

module.exports = router;
