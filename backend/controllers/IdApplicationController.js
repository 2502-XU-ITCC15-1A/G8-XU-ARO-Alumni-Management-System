const IdApplication = require("../models/IdApplication");
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
            { receiptImage: receiptPath, status: "payment" },  
            { new: true }
        ).populate('userId', 'name email');

        if (updated.userId) {
            await Notification.create({
                userId: updated.userId._id,
                message: "Your payment receipt has been submitted and is now being reviewed by the Book Center.",
                type: "status_update",
            });
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

        const updated = await IdApplication.findByIdAndUpdate(id, fields, { new: true })
            .populate('userId', 'name email');

        if (status && updated.userId) {
            const messages = {
                approved:     "Your Alumni ID application has been approved by XU-ARO!",
                rejected:     `Your Alumni ID application was rejected.${remarks ? ` Reason: ${remarks}` : ''}`,
                under_review: "Your Alumni ID application is now under review.",
                payment:      "Your payment receipt has been submitted and is awaiting Book Center verification.",
                printing:     "Your payment has been verified! Your Alumni ID is now being printed.",
                released:     "Your Alumni ID has been released. Please collect it at the Book Center.",
                };
            const message = messages[status];
            if (message) {
                await Notification.create({
                    userId:  updated.userId._id,
                    message,
                    type:    "status_update",
                });
            }
        }

        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};