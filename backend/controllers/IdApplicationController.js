const IdApplication = require("../models/IdApplication");
const AlumniProfile = require("../models/AlumniProfile");
const Notification = require("../models/Notification");
const { sendStatusEmail } = require("../utils/emailService");

const STATUS_NOTIFICATIONS = {
  under_review:    { title: 'Application Under Review',        message: 'Your Alumni ID application is now being reviewed by ARO staff.',                                             type: 'info'    },
  approved:        { title: 'Application Approved',            message: 'Your Alumni ID application has been approved. Please upload your payment receipt to proceed.',              type: 'success' },
  rejected:        { title: 'Application Rejected',            message: 'Your Alumni ID application has been rejected.',                                                              type: 'error'   },
  payment_pending: { title: 'Receipt Uploaded',                message: 'Your payment receipt has been submitted and is awaiting verification by the Book Center.',                  type: 'info'    },
  printing:        { title: 'Payment Verified — ID Printing',  message: 'Your payment has been verified. Your Alumni ID card is now being printed.',                                 type: 'success' },
  released:        { title: 'Alumni ID Ready for Pick-up',     message: 'Your Alumni ID card is ready! Please visit the Alumni Relations Office to pick it up.',                     type: 'success' },
};

const createNotification = (userId, status, remarks) => {
  const tpl = STATUS_NOTIFICATIONS[status];
  if (!tpl) return Promise.resolve();
  const message = (status === 'rejected' && remarks) ? `${tpl.message} Reason: ${remarks}` : tpl.message;
  return Notification.create({ userId, title: tpl.title, message, type: tpl.type }).catch(console.error);
};

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
            createNotification(updated.userId._id, 'payment_pending');
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

        if (updated?.userId) {
            if (status) {
                sendStatusEmail(updated.userId.email, updated.userId.name, status, remarks)
                    .catch(err => console.error('Email notification failed:', err));
                createNotification(updated.userId._id, status, remarks);
            } else if (paymentVerified) {
                Notification.create({
                    userId: updated.userId._id,
                    title: 'Payment Verified',
                    message: 'Your payment receipt has been verified by the Book Center.',
                    type: 'success',
                }).catch(console.error);
            }
        }

        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.uploadPhoto = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
        const photoPath = req.file.path.replace(/\\/g, '/');
        const updated = await IdApplication.findByIdAndUpdate(
            req.params.id,
            { alumniPhoto: photoPath },
            { returnDocument: 'after' }
        ).populate('userId', 'name email');
        if (!updated) return res.status(404).json({ message: 'Application not found.' });
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