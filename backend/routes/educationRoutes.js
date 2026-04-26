const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { getMyEducation, addEducation, updateEducation, deleteEducation } = require("../controllers/educationController");

router.get("/", auth, getMyEducation);
router.post("/", auth, addEducation);
router.put("/:id", auth, updateEducation);
router.delete("/:id", auth, deleteEducation);

module.exports = router;
