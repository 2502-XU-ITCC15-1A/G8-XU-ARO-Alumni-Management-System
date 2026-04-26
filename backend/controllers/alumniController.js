const Alumni = require("../models/AlumniProfile");

exports.createProfile = async (req, res) => {
    try {
        const profile = await Alumni.create(req.body);
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

exports.getMyProfile = async (req, res) => {
    try {
        const profile = await Alumni.findOne({ userId: req.user.id });
        res.json(profile || null);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.upsertMyProfile = async (req, res) => {
    try {
        const profile = await Alumni.findOneAndUpdate(
            { userId: req.user.id },
            { ...req.body, userId: req.user.id },
            { new: true, upsert: true }
        );
        res.json(profile);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};