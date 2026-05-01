const IdApplication = require("../models/IdApplication");
const { createNotification } = require("../utils/notificationService");
const { sendStatusEmail } = require("../utils/emailService");

exports.getMyApplications = async (req, res) => {
    try {
        const apps = await IdApplication.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(apps);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getIdApplications = async (req, res) => {
    try {
        const apps = await IdApplication.find()
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });
        res.json(apps);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getIdApplication = async (req, res) => {
    try {
        const app = await IdApplication.findById(req.params.id).populate('userId', 'name email');
        if (!app) return res.status(404).json({ message: 'Not found' });
        res.json(app);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createIdApplication = async (req, res) => {
    try {
        const app = await IdApplication.create({ ...req.body, userId: req.user.id });
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
                status: "payment_pending"
            },
            { returnDocument: 'after' }
        ).populate('userId', 'name email');

        if (updated?.userId) {
            const user = updated.userId;

           sendStatusEmail(user.email, user.name, 'payment_pending')
                .catch(err => console.error('Email notification failed:', err));

            await createNotification(
                user._id,
                "Your payment receipt has been submitted and is pending verification.",
                "info"
            );
}

        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, remarks, paymentVerified } = req.body;

        const fields = {};
        if (status !== undefined)          fields.status = status;
        if (remarks !== undefined)         fields.remarks = remarks;
        if (paymentVerified !== undefined) fields.paymentVerified = paymentVerified;
        if (status)                        fields.verifiedBy = "XU_BookCenter";
        if (status === 'released') {
            const THREE_YEARS_MS = 3 * 365.25 * 24 * 60 * 60 * 1000;
            fields.validUntil = new Date(Date.now() + THREE_YEARS_MS);
        }

        const updated = await IdApplication.findByIdAndUpdate(id, fields, { returnDocument: 'after' }).populate('userId', 'name email');

        if (status && updated?.userId) {
            const user = updated.userId;

            sendStatusEmail(user.email, user.name, status, remarks)
                .catch(err => console.error('Email notification failed:', err));

            const messages = {
                approved: "Your application has been approved.",
                rejected: "Your application has been rejected.",
                payment_verified: "Your payment has been verified.",
                printing: "Your ID is now being processed.",
                released: "Your ID is ready for pickup."
            };

            await createNotification(
                user._id,
                messages[status] || `Status updated: ${status}`,
                "info"
            );
        }

        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteIdApplication = async (req, res) => {
    try {
        const deleted = await IdApplication.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};