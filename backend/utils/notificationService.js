const Notification = require("../models/Notification");

const NOTIF_CONFIG = {
  under_review: {
    title: "Under Review",
    message: "Your application is being reviewed.",
    type: "info"
  },
  approved: {
    title: "Approved",
    message: "Your application has been approved.",
    type: "success"
  },
  rejected: {
    title: "Not Approved",
    message: "Your application was not approved.",
    type: "error"
  },
  payment_pending: {
    title: "Payment Pending",
    message: "Your receipt is awaiting verification.",
    type: "warning"
  },
  payment_verified: {
    title: "Payment Verified",
    message: "Your payment has been verified.",
    type: "success"
  },
  printing: {
    title: "Processing",
    message: "Your ID is being printed.",
    type: "info"
  },
  released: {
    title: "Ready for Pickup",
    message: "Your ID is ready for pickup.",
    type: "success"
  }
};

const createStatusNotification = async (userId, status) => {
  const config = NOTIF_CONFIG[status];

  if (!config) return;

  return await Notification.create({
    userId,
    title: config.title,
    message: config.message,
    type: config.type,
    read: false
  });
};


const createNotification = async (userId, title, message, type = "info") => {
  return await Notification.create({
    userId,
    title,
    message,
    type,
    read: false
  });
};

module.exports = {
  createStatusNotification,
  createNotification
};