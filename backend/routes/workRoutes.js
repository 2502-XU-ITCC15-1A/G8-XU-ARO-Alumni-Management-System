const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { getMyWork, addWork, updateWork, deleteWork } = require("../controllers/workController");

router.get("/", protect, getMyWork);
router.post("/", protect, addWork);
router.put("/:id", protect, updateWork);
router.delete("/:id", protect, deleteWork);

module.exports = router;