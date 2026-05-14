const SystemLog = require("../models/SystemLog");

const getSystemLogs = async (req, res) => {
    try {
        const role = req.user.role;

        const logs = await SystemLog.find({
            "performedBy.role": role
        })
        .sort({ createdAt: -1 })
        .limit(500);

        res.json(logs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch system logs" });
    }
};

module.exports = {
    getSystemLogs,
};