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