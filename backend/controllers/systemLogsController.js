const SystemLog = require("../models/SystemLog");

const getSystemLogs = async (req, res) => {
    try {
        const role = req.user.role;

        // Base query: Match logs performed by the current user's role
        // ADDITION: Also look for payment verification actions regardless of role
        const logs = await SystemLog.find({
            $or: [
                { "performedBy.role": role },
                { action: "PAYMENT_VERIFIED" }
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

module.exports = {
    getSystemLogs,
};