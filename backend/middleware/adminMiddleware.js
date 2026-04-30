const User = require("../models/User");

module.exports = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== "xu-aro") {
            return res.status(403).json({ message: "Admin access required" });
        }
        next();
    } catch {
        res.status(500).json({ message: "Authorization check failed" });
    }
};
