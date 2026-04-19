const express = require("express");
const router = express.Router();

const multer = require("multer");

const {
  uploadReceipt,
  getPayments,
  verifyPayment
} = require("../controllers/paymentController");

const { protect } = require("../middleware/authMiddleware");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

router.post("/upload", protect, upload.single("receipt"), uploadReceipt);
router.get("/", protect, getPayments);
router.put("/:id", protect, verifyPayment);

module.exports = router;