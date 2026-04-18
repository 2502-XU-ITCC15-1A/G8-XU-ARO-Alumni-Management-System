const IdApplication = require("../models/IdApplication");

exports.createIdApplication = async (req, res) => {
    try {
        const app = await IdApplication.create(req.body);
        res.json(app);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.uploadReceipt = async (req, res) => {
    try {
        const { id } = req.params;

        const updated = await IdApplication.findByIdAndUpdate(
            id,
            {
                receiptImage: req.file.path,
                status: "under_review"
            },
            { new: true }
        );

        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, remarks } = req.body;

        const updated = await IdApplication.findByIdAndUpdate(
            id,
            {
                status,
                remarks,
                verifiedBy: "XU_BookCenter"
            },
            { new: true }
        );

        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};