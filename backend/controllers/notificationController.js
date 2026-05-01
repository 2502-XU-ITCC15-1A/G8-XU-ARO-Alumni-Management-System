const Notification = require("../models/Notification");
const mongoose = require("mongoose");

exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  console.log('Request to mark as read received for ID:', req.params.id);

  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid notification ID:', req.params.id);
      return res.status(400).json({ message: 'Invalid notification ID' });
    }

    const updatedNotification = await Notification.findByIdAndUpdate(
      req.params.id, 
      { read: true },
      { returnDocument: 'after' }
    );

    if (!updatedNotification) {
      console.log('Notification not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Notification not found' });
    }

    console.log('Notification marked as read:', updatedNotification);
    return res.json(updatedNotification);
  } catch (err) {
    console.error('Error in marking as read:', err);
    return res.status(500).json({ message: err.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { $set: { read: true } }
    );
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user.id,
      read: false
    });

    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};