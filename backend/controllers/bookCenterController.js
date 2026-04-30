const IdApplication = require("../models/IdApplication");

exports.getBookCenterApplications = async (req, res) => {
    try {
        const apps = await IdApplication.find({
            status: { $in: ["approved", "under_review", "printing", "released"] }
        })
            .populate("userId", "name email")
            .sort({ createdAt: -1 });
 
        res.json(apps);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { id } = req.params;
 
        const app = await IdApplication.findById(id);
        if (!app) return res.status(404).json({ message: "Application not found" });
 
        if (!app.receiptImage) {
            return res.status(400).json({ message: "No receipt uploaded yet" });
        }
 
        const updated = await IdApplication.findByIdAndUpdate(
            id,
            {
                paymentVerified: true,
                status: "approved",
                verifiedBy: "XU_BookCenter",
            },
            { new: true }
        );
 
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.startPrinting = async (req, res) => {
    try {
        const { id } = req.params;
 
        const app = await IdApplication.findById(id);
        if (!app) return res.status(404).json({ message: "Application not found" });
 
        if (!app.paymentVerified) {
            return res.status(400).json({ message: "Payment not yet verified" });
        }
 
        const updated = await IdApplication.findByIdAndUpdate(
            id,
            { status: "printing" },
            { new: true }
        );
 
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.releaseId = async (req, res) => {
    try {
        const { id } = req.params;
 
        const updated = await IdApplication.findByIdAndUpdate(
            id,
            { status: "released" },
            { new: true }
        );
 
        if (!updated) return res.status(404).json({ message: "Application not found" });
 
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.holdApplication = async (req, res) => {
    try {
        const { id } = req.params;
 
        const updated = await IdApplication.findByIdAndUpdate(
            id,
            { paymentVerified: false, status: "under_review" },
            { new: true }
        );
 
        if (!updated) return res.status(404).json({ message: "Application not found" });
 
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
 