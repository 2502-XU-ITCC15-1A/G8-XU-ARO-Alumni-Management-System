const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const Notification = require("../models/Notification");

router.get("/", protect, async (req, res) => {
    try {
        const notes = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 });
        res.json(notes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put("/read-all", protect, async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.user._id }, { read: true });
        res.json({ message: "All marked as read" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put("/:id/read", protect, async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { read: true });
        res.json({ message: "Marked as read" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;