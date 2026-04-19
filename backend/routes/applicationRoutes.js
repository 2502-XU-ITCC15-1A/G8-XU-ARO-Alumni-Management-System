// routes/applicationRoutes.js
import express from "express";
import { createApplication, getMyApplications } from "../controllers/applicationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createApplication);
router.get("/my", protect, getMyApplications);

export default router;