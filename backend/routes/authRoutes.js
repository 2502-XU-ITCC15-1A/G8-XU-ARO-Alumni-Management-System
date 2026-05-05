const router = require("express").Router();
const { register, login, googleAuthRedirect, googleAuthCallback } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/google", googleAuthRedirect);
router.get("/google/callback", googleAuthCallback);

module.exports = router;
