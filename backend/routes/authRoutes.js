const router = require("express").Router();
const { register, login, googleAuthRedirect, googleAuthCallback, forgotPassword, resetPassword } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/google", googleAuthRedirect);
router.get("/google/callback", googleAuthCallback);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
