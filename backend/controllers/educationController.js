const Education = require("../models/Education");

exports.getMyEducation = async (req, res) => {
    try {
        const records = await Education.find({ userId: req.user.id });
        res.json(records);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.addEducation = async (req, res) => {
    try {
        const record = await Education.create({ ...req.body, userId: req.user.id });
        res.json(record);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.updateEducation = async (req, res) => {
    try {
        const record = await Education.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true }
        );
        if (!record) return res.status(404).json({ message: "Not found" });
        res.json(record);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.deleteEducation = async (req, res) => {
    try {
        const record = await Education.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!record) return res.status(404).json({ message: "Not found" });
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};