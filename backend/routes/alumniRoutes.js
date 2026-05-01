const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { createProfile, getProfiles, getMyProfile, saveMyProfile } = require("../controllers/alumniController");

router.get("/",    protect, getProfiles);
router.get("/me",  protect, getMyProfile);
router.put("/me",  protect, saveMyProfile);
router.post("/",   protect, createProfile);

module.exports = router;