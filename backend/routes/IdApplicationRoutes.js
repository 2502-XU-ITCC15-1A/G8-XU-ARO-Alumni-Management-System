const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const {
    getMyApplications,
    getIdApplications,
    getIdApplication,
    createIdApplication,
    updateStatus,
    uploadReceipt,
    deleteIdApplication
} = require("../controllers/IdApplicationController");

router.get("/",    protect, getIdApplications);
router.get("/my",  protect, getMyApplications);
router.get("/:id", protect, getIdApplication);
router.post("/",   protect, createIdApplication);
router.post("/upload/:id", protect, upload.single("receipt"), uploadReceipt);
router.put("/:id", protect, updateStatus);
router.delete("/:id", protect, deleteIdApplication);

module.exports = router;