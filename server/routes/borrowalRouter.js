const express = require("express");
const router = express.Router();

// Import controller functions
const {
  getBorrowal,
  getAllBorrowal,
  addBorrowal,
  updateBorrowal,
  deleteBorrowal,
  payFineOffline
} = require("../controllers/borrowalController");

// Routes
router.get("/getAll", getAllBorrowal);
router.get("/get/:id", getBorrowal);
router.post("/add", addBorrowal);
router.put("/update/:id", updateBorrowal);
router.delete("/delete/:id", deleteBorrowal);
router.put("/pay-fine/:id", payFineOffline);

module.exports = router;
