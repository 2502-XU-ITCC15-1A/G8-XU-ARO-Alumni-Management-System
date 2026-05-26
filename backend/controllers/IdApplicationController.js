const SystemLog = require("../models/SystemLog");
const IdApplication = require("../models/IdApplication");
const AlumniProfile = require("../models/AlumniProfile");
const Notification = require("../models/Notification");
const Education = require("../models/Education");
const { sendStatusEmail } = require("../utils/emailService");


const STATUS_NOTIFICATIONS = {
  under_review:    { title: 'Application Under Review',        message: 'Your Alumni ID application is now being reviewed by ARO staff.',                                                                                    type: 'info'    },
  approved:        { title: 'Application Approved',            message: 'Your Alumni ID application has been approved. Please visit the XU Book Center to pay the ₱150 Alumni ID fee and proceed with your ID card.',       type: 'success' },
  rejected:        { title: 'Application Rejected',            message: 'Your Alumni ID application has been rejected.',                                                                                                      type: 'error'   },
  payment_pending: { title: 'Payment Confirmed',               message: 'Your payment has been confirmed by the XU Book Center. Your Alumni ID card is now being processed.',                                                 type: 'info'    },
  printing:        { title: 'ID Printing in Progress',         message: 'Your Alumni ID card is now being printed. You will be notified once it is ready for pick-up.',                                                      type: 'success' },
  released:        { title: 'Alumni ID Ready for Pick-up',     message: 'Your Alumni ID card is ready! Please visit the Alumni Relations Office to pick it up.',                                                              type: 'success' },
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
      .sort({ createdAt: -1 })
      .lean();

    const userIds = apps.map(a => a.userId?._id).filter(Boolean);

    const [profiles] = await Promise.all([
      AlumniProfile.find({ userId: { $in: userIds } }).lean()
    ]);

    const profileMap = new Map();
    for (const p of profiles) {
      profileMap.set(p.userId.toString(), p);
    }

    const merged = apps.map(app => {
      const id = app.userId?._id?.toString();

      return {
        ...app,
        education: app.educationSnapshot || [], 
        alumniProfile: profileMap.get(id) || null
      };
    });

    res.json(merged);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getIdApplication = async (req, res) => {
    try {

        const app = await IdApplication.findById(req.params.id)
            .populate('userId', 'name email')
            .lean();

        if (!app) {
            return res.status(404).json({
                message: 'Not found'
            });
        }

        app.education = app.educationSnapshot || [];

        const alumniProfile = await AlumniProfile.findOne({
            userId: app.userId?._id
        }).lean();

        app.alumniProfile = alumniProfile || null;

        res.json(app);

    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: err.message
        });
    }
};

exports.createIdApplication = async (req, res) => {
    try {
        const app = await IdApplication.create({
        ...req.body,
        userId: req.user._id,
        educationSnapshot: req.body.educationSnapshot || []
        });
        const populated = await IdApplication.findById(app._id)
            .populate('userId', 'name email');
        res.json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, remarks, paymentVerified, universityIdNumber } = req.body;

        const fields = {};
        if (status !== undefined)          fields.status = status;
        if (remarks !== undefined)         fields.remarks = remarks;
        if (paymentVerified !== undefined) fields.paymentVerified = paymentVerified;
        if (paymentVerified) {             fields.verifiedBy = "XU_BookCenter"; }
        
        if (universityIdNumber !== undefined) fields.universityIdNumber = universityIdNumber;

        if (status === 'released') {
            const THREE_YEARS_MS = 3 * 365.25 * 24 * 60 * 60 * 1000;
            fields.validUntil = new Date(Date.now() + THREE_YEARS_MS);
        }

        const updated = await IdApplication.findByIdAndUpdate(id, fields, { returnDocument: 'after' }).populate('userId', 'name email');
        
        if (updated?.userId && universityIdNumber) {
            await AlumniProfile.findOneAndUpdate(
                { userId: updated.userId._id },
                { universityIdNumber },
                { upsert: false }
            ).catch(err => console.error('Failed to sync ID to profile:', err));
        }

        const logData = {
            performedBy: {
                userId: req.user._id,
                name: req.user.name || "Unknown",
                role: req.user.role || "unknown",
            },
            target: updated.userId?.name || "Unknown User",
        };

        let statusAction = "UNKNOWN_ACTION";
        if (status === "approved") statusAction = "APPLICATION_APPROVED";
        if (status === "rejected") statusAction = "APPLICATION_REJECTED";
        if (status === "printing") statusAction = "ID_PRINTING_STARTED";
        if (status === "released") statusAction = "ID_RELEASED";

        if (status) {
            await SystemLog.create({
                ...logData,
                action: statusAction,
                details: `Status changed to ${status}. Remarks: ${remarks || "None"}. ID Number Assigned: ${universityIdNumber || "None"}`
            });
        }

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

exports.uploadAlumniIdPhoto = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
        const photoPath = req.file.path.replace(/\\/g, '/');
        const updated = await IdApplication.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { idPhoto: photoPath },
            { returnDocument: 'after' }
        );
        if (!updated) return res.status(404).json({ message: 'Application not found.' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.uploadAlumniSignature = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
        const sigPath = req.file.path.replace(/\\/g, '/');
        const updated = await IdApplication.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { signature: sigPath },
            { returnDocument: 'after' }
        );
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