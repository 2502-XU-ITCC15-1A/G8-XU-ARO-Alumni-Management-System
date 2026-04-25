
const router = require("express").Router();
const { protect, requireRole } = require("../middleware/authMiddleware");
const {
    getBookCenterApplications,
    verifyPayment,
    startPrinting,
    releaseId,
    holdApplication,
} = require("../controllers/bookCenterController");

router.use(protect);
router.use(requireRole("external"));

router.get("/", getBookCenterApplications);
router.put("/:id/verify-payment", verifyPayment);
router.put("/:id/start-printing", startPrinting);
router.put("/:id/release", releaseId);
router.put("/:id/hold", holdApplication);

module.exports = router;