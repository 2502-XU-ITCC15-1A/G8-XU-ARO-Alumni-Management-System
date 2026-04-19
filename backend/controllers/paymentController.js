const Payment = require("../models/Payment");

exports.uploadReceipt = async (req, res) => {
  try {
    const payment = await Payment.create({
      application: req.body.applicationId,
      receipt_image: req.file.filename,
      status: "Payment Under Verification",
      dateUploaded: new Date()
    });

    res.json(payment);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate("application");
    res.json(payments);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { status, remarks } = req.body;

    const updated = await Payment.findByIdAndUpdate(
      req.params.id,
      {
        status,
        remarks
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json(err.message);
  }
};