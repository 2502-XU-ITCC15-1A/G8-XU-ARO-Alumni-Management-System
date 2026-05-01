const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { createProfile, getProfiles, deleteProfile, getMyProfile, upsertMyProfile, saveMyProfile } = require("../controllers/alumniController");

router.get("/",    protect, getProfiles);
router.get("/me",  protect, getMyProfile);
router.put("/me",  protect, upsertMyProfile);
router.post("/",   protect, createProfile);
router.delete("/:id", protect, deleteProfile);

module.exports = router;