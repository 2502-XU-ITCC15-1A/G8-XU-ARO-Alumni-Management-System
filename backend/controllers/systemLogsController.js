const SystemLog = require("../models/SystemLog");

exports.getSystemLogs = async (req, res) => {
    try {
        const role = req.user.role;

        const logs = await SystemLog.find({
            $or: [
                { "performedBy.role": role },
                { "performedBy.role": "system" },     // Allows background automated/cron engine events to stream
                { action: "PAYMENT_VERIFIED" },
                { action: "USER_CREATED" },          // Let staff creation logs pass through
                { action: "USER_DELETED" },          // Let staff deletion logs pass through
                { action: "DATABASE_BACKUP" },       // Whitelists successful Google Drive backup events
                { action: "DATABASE_BACKUP_FAILED" } // Whitelists critical backup alert snapshots
            ]
        })
        .sort({ createdAt: -1 })
        .limit(500);

        res.json(logs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch system logs" });
    }
};