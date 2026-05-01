const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { getMyEducation, addEducation, updateEducation, deleteEducation } = require("../controllers/educationController");

router.get("/", protect, getMyEducation);
router.post("/", protect, addEducation);
router.put("/:id", protect, updateEducation);
router.delete("/:id", protect, deleteEducation);

module.exports = router;
