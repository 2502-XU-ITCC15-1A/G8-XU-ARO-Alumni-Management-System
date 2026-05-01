const router = require("express").Router();
const { protect: auth } = require("../middleware/authMiddleware");
const { createProfile, getProfiles, deleteProfile, getMyProfile, upsertMyProfile } = require("../controllers/alumniController");

router.get("/me", auth, getMyProfile);
router.put("/me", auth, upsertMyProfile);
router.post("/", createProfile);
router.get("/", getProfiles);
router.delete("/:id", deleteProfile);

module.exports = router;