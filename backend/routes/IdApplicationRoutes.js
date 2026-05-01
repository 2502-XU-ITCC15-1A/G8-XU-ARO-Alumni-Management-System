const router = require("express").Router();
const upload = require("../middleware/upload");
const { protect } = require("../middleware/authMiddleware");
const {
    getIdApplications,
    getIdApplication,
    createIdApplication,
    updateStatus,
    uploadReceipt
} = require("../controllers/IdApplicationController");

router.get("/",    protect, getIdApplications);
router.get("/my",  protect, async (req, res) => {
    try {
        const IdApplication = require("../models/IdApplication");
        const apps = await IdApplication.find({ userId: req.user._id })
            .sort({ createdAt: -1 });
        res.json(apps);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
router.get("/:id", protect, getIdApplication);
router.post("/",   protect, createIdApplication);
router.post("/upload/:id", upload.single("receipt"), uploadReceipt);
router.put("/:id", protect, updateStatus);

module.exports = router;