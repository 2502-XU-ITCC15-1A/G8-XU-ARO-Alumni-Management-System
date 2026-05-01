const Alumni = require("../models/AlumniProfile");

exports.getMyProfile = async (req, res) => {
    try {
        const profile = await Alumni.findOne({ userId: req.user.id || req.user._id });
        res.json(profile || {});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.upsertMyProfile = async (req, res) => {
    try {
        const profile = await Alumni.findOneAndUpdate(
            { userId: req.user.id || req.user._id },
            { ...req.body, userId: req.user.id || req.user._id },
            { returnDocument: 'after', upsert: true, runValidators: false }
        );
        res.json(profile);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.saveMyProfile = async (req, res) => {
    try {
        const profile = await Alumni.findOneAndUpdate(
            { userId: req.user.id || req.user._id },
            { ...req.body, userId: req.user.id || req.user._id },
            { new: true, upsert: true }
        );
        res.json(profile);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getProfiles = async (req, res) => {
    try {
        const data = await Alumni.find();
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createProfile = async (req, res) => {
    try {
        const profile = await Alumni.create(req.body);
        res.json(profile);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteProfile = async (req, res) => {
    try {
        const deleted = await Alumni.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Alumni not found" });
        res.json({ message: "Alumni deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
