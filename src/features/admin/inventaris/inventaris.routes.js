const express = require("express");
const router = express.Router();
const inventarisController = require("./inventaris.controller");
const authMiddleware = require("../../../core/services/auth.middleware");

// GET all inventory items
router.get("/", authMiddleware, inventarisController.getInventory);

// GET inventory summary
router.get("/summary", authMiddleware, inventarisController.getSummary);

// CREATE inventory item
router.post("/", authMiddleware, inventarisController.createItem);

// UPDATE inventory item
router.patch("/:id", authMiddleware, inventarisController.updateItem);

// DELETE inventory item
router.delete("/:id", authMiddleware, inventarisController.deleteItem);

// ADD stock (increment)
router.post("/:id/add-stock", authMiddleware, inventarisController.addStock);

module.exports = router;
