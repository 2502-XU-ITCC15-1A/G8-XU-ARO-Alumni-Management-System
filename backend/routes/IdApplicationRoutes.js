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
router.post("/upload/:id", upload.single("receipt"), uploadReceipt);
router.put("/:id", updateStatus);
router.delete("/:id", deleteIdApplication);

module.exports = router;