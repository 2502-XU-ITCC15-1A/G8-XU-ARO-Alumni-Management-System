const router = require("express").Router();
const upload = require("../middleware/upload");
const {
    getIdApplications,
    getIdApplication,
    createIdApplication,
    updateStatus,
    uploadReceipt,
    deleteIdApplication } = require("../controllers/IdApplicationController");

router.get("/", getIdApplications);
router.get("/:id", getIdApplication);
router.post("/", createIdApplication);

router.post("/upload/:id", upload.single("receipt"), uploadReceipt);

router.put("/:id", updateStatus);
router.delete("/:id", deleteIdApplication);

module.exports = router;