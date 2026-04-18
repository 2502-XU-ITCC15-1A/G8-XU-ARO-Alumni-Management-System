const router = require("express").Router();
const { createIdApplication, getIdApplication, updateStatus } = require("../controllers/IdApplicationController");

router.post("/", createIdApplication);
router.get("/", getIdApplication);
router.put("/:id", updateStatus);

module.exports = router;