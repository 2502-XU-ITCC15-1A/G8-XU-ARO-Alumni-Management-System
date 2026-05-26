const SystemLog = require("../models/SystemLog");

exports.getSystemLogs = async (req, res) => {
    try {
        const role = req.user.role;

        const logs = await SystemLog.find({
            $or: [
                { "performedBy.role": role },
                { "performedBy.role": "system" },     
                { action: "PAYMENT_VERIFIED" },
                { action: "USER_CREATED" },        
                { action: "USER_DELETED" },         
                { action: "DATABASE_BACKUP" },       
                { action: "DATABASE_BACKUP_FAILED" }, 
                { action: "DATA_ARCHIVED" },     
                { action: "DATA_ARCHIVE_FAILED" }
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