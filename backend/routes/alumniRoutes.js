const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { createProfile, getProfiles, getMyProfile, upsertMyProfile } = require("../controllers/alumniController");

router.post("/", createProfile);
router.get("/", getProfiles);
router.get("/me", auth, getMyProfile);
router.put("/me", auth, upsertMyProfile);

module.exports = router;