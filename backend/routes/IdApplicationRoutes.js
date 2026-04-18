const router = require("express").Router();
const upload = require("../middleware/upload");
const {
    createIdApplication,
    getIdApplication,
    updateStatus,
    uploadReceipt } = require("../controllers/IdApplicationController");

router.post("/", createIdApplication);

router.post("/upload/:id", upload.single("receipt"), uploadReceipt);

router.put("/:id", updateStatus);

module.exports = router;