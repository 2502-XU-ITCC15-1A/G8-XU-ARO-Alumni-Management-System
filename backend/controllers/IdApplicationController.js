const IdApplication = require("../models/IdApplication");

exports.createIdApplication = async (req, res) => {
    const app = await IdApplication.create(req.body);
    res.json(app);
};

exports.getIdApplications = async (req, res) => {
    const apps = await IdApplication.find();
    res.json(apps);
};

exports.updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await IdApplication.findByIdAndUpdate(id, { status }, { new: true});

    res.json(updated);
};