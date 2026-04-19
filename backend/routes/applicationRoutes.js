const express = require("express");
const router = express.Router();

const {
  createApplication,
  getMyApplications,
  getAllApplications,
  updateStatus
} = require("../controllers/applicationController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createApplication);
router.get("/my", protect, getMyApplications);
router.get("/", protect, getAllApplications);
router.put("/:id", protect, updateStatus);

module.exports = router;