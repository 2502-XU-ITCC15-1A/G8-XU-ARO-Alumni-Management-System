// controllers/paymentController.js
import Payment from "../../AlumniMS/backend/models/Payment.js";

export const uploadReceipt = async (req, res) => {
  const payment = await Payment.create({
    application: req.body.applicationId,
    receipt_image: req.file.filename
  });

  res.json(payment);
};