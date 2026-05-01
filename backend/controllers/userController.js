const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $in: ["xu-aro", "external"] } })
            .select("-password")
            .sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!["xu-aro", "external"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: "Email already registered" });

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashed, role });

        res.status(201).json({ ...user.toObject(), password: undefined });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { name, role } = req.body;

        if (role && !["xu-aro", "external"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        if (req.params.id === req.user.id) {
            return res.status(400).json({ message: "Cannot modify your own account" });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { ...(name && { name }), ...(role && { role }) },
            { returnDocument: 'after' }
        ).select("-password");

        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        if (req.params.id === req.user.id) {
            return res.status(400).json({ message: "Cannot delete your own account" });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ message: "User deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
