const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");

const {
  getMyNotifications,
  markAsRead, 
  markAllAsRead,
  getUnreadCount
} = require("../controllers/notificationController");

router.get("/my", protect, getMyNotifications);
router.patch("/:id/read", protect, markAsRead);
router.patch("/read-all", protect, markAllAsRead);
router.get("/unread-count", protect, getUnreadCount);

module.exports = router;