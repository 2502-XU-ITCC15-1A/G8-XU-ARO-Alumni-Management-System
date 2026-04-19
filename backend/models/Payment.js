const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Application"
  },
  receipt_image: String,
  status: {
    type: String,
    default: "Payment Under Verification"
  },
  remarks: String,
  dateUploaded: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Payment", paymentSchema);