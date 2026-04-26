const router = require("express").Router();
const { createProfile, getProfiles, deleteProfile } = require("../controllers/alumniController");

router.post("/", createProfile);
router.get("/", getProfiles);
router.delete("/:id", deleteProfile);

module.exports = router;