const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const {
    getMyApplications,
    getIdApplications,
    getIdApplication,
    createIdApplication,
    updateStatus,
    uploadReceipt,
    deleteIdApplication } = require("../controllers/IdApplicationController");

router.get("/my", auth, getMyApplications);
router.get("/", getIdApplications);
router.get("/:id", getIdApplication);
router.post("/", auth, createIdApplication);

router.post("/upload/:id", upload.single("receipt"), uploadReceipt);

router.put("/:id", updateStatus);
router.delete("/:id", deleteIdApplication);

module.exports = router;