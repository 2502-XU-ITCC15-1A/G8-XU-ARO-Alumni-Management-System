// routes/paymentRoutes.js
import express from "express";
import multer from "multer";
import { uploadReceipt } from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

router.post("/upload", protect, upload.single("receipt"), uploadReceipt);

export default router;