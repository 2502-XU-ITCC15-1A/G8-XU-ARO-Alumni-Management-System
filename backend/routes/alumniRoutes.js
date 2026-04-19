const router = require("express").Router();
const { createProfile, getProfiles } = require("../controllers/alumniController");

router.post("/", createProfile);
router.get("/", getProfiles);

module.exports = router;