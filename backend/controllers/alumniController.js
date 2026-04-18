const Alumni = require("../models/AlumniProfile");

exports.createProfile = async (req, res) => {
    const profile = await Alumni.create(req.body);
    res.json(profile);
};

exports.getProfiles = async (req, res) => {
    const data = await Alumni.find();
    res.json(data);
};