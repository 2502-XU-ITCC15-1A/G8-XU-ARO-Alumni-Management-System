const IdApplication = require("../models/IdApplication");
const { sendStatusEmail } = require("../utils/emailService");

exports.getMyApplications = async (req, res) => {
    try {
        const apps = await IdApplication.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(apps);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const Notification = require("../models/Notification");
const AlumniProfile = require("../models/AlumniProfile");

exports.getIdApplications = async (req, res) => {
    try {
        const apps = await IdApplication.find()
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        const appsWithProfile = await Promise.all(apps.map(async (app) => {
            const profile = await AlumniProfile.findOne({ userId: app.userId?._id });
            return {
                ...app.toObject(),
                alumniProfile: profile || null,
            };
        }));

        res.json(appsWithProfile);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getIdApplication = async (req, res) => {
    try {
        const app = await IdApplication.findById(req.params.id)
            .populate('userId', 'name email');
        if (!app) return res.status(404).json({ message: 'Not found' });
        res.json(app);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createIdApplication = async (req, res) => {
    try {
        const app = await IdApplication.create({
            ...req.body,
            userId: req.user._id
        });
        const populated = await IdApplication.findById(app._id)
            .populate('userId', 'name email');
        res.json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.uploadReceipt = async (req, res) => {
    try {
        const receiptPath = req.file.path.replace(/\\/g, '/');
        const updated = await IdApplication.findByIdAndUpdate(
            req.params.id,
            {
                receiptImage: receiptPath,
                status: "payment_pending"
            },
            { returnDocument: 'after' }
        ).populate('userId', 'name email');

        if (updated?.userId) {
            sendStatusEmail(updated.userId.email, updated.userId.name, 'payment_pending')
                .catch(err => console.error('Email notification failed:', err));
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
            sendStatusEmail(updated.userId.email, updated.userId.name, status, remarks)
                .catch(err => console.error('Email notification failed:', err));
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