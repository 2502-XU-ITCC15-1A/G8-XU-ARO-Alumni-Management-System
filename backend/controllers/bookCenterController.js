const IdApplication = require("../models/IdApplication");
const { sendStatusEmail } = require("../utils/emailService");
const Notification = require("../models/Notification");
const SystemLog = require("../models/SystemLog");

exports.getBookCenterApplications = async (req, res) => {
    try {
        const apps = await IdApplication.find({
            status: { $in: ["approved", "payment_pending", "printing", "released"] }
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

        const app = await IdApplication.findById(id).populate("userId", "name email");
        if (!app) return res.status(404).json({ message: "Application not found" });

        const updated = await IdApplication.findByIdAndUpdate(
            id,
            {
                paymentVerified: true,
                status: "printing",
                verifiedBy: "XU_BookCenter",
            },
            { returnDocument: 'after' }
        ).populate("userId", "name email");

        if (updated?.userId) {
            sendStatusEmail(updated.userId.email, updated.userId.name, 'printing')
                .catch(err => console.error('Email notification failed:', err));
            Notification.create({
                userId: updated.userId._id,
                title: 'Payment Confirmed — ID Printing',
                message: 'Your payment has been confirmed by the XU Book Center. Your Alumni ID card is now being printed.',
                type: 'success',
            }).catch(console.error);
        }

        await SystemLog.create({
            action: 'PAYMENT_VERIFIED',
            performedBy: {
                name: req.user?.name || 'XU Book Center Staff',
                id: req.user?.id || req.user?._id || null
            },
            target: updated.universityIdNumber || 'N/A',
            details: `Verified ₱150 payment fee for applicant: ${updated.firstName} ${updated.lastName}`
        }).catch(err => console.error('Failed to create system log:', err));

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
            return res.status(400).json({ message: "Payment not yet confirmed" });
        }

        const updated = await IdApplication.findByIdAndUpdate(
            id,
            { status: "printing" },
            { returnDocument: 'after' }
        );


        await SystemLog.create({
            action: 'ID_PRINTING_STARTED',
            performedBy: {
                name: req.user?.name || 'XU Book Center Staff',
                id: req.user?.id || req.user?._id || null
            },
            target: updated.universityIdNumber || 'N/A',
            details: `Started ID card printing process for: ${updated.firstName} ${updated.lastName}`
        }).catch(err => console.error('Failed to create system log:', err));

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
            { returnDocument: 'after' }
        );

        if (!updated) return res.status(404).json({ message: "Application not found" });


        await SystemLog.create({
            action: 'ID_RELEASED',
            performedBy: {
                name: req.user?.name || 'XU Book Center Staff',
                id: req.user?.id || req.user?._id || null
            },
            target: updated.universityIdNumber || 'N/A',
            details: `Alumni ID card successfully released to: ${updated.firstName} ${updated.lastName}`
        }).catch(err => console.error('Failed to create system log:', err));

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
            { paymentVerified: false, status: "approved" },
            { returnDocument: 'after' }
        );

        if (!updated) return res.status(404).json({ message: "Application not found" });

        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};