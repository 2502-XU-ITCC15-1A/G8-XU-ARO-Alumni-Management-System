const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { getMyWork, addWork, updateWork, deleteWork } = require("../controllers/workController");

router.get("/", auth, getMyWork);
router.post("/", auth, addWork);
router.put("/:id", auth, updateWork);
router.delete("/:id", auth, deleteWork);

module.exports = router;
