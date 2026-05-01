const express = require("express");
const router = express.Router();
const { protect: authMiddleware } = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { getUsers, createUser, updateUser, deleteUser } = require("../controllers/userController");

router.use(authMiddleware, adminMiddleware);

router.get("/", getUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
