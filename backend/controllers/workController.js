const Work = require("../models/Work");

exports.getMyWork = async (req, res) => {
    try {
        const records = await Work.find({ userId: req.user.id });
        res.json(records);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addWork = async (req, res) => {
    try {
        const record = await Work.create({ ...req.body, userId: req.user.id });
        res.json(record);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateWork = async (req, res) => {
    try {
        const record = await Work.findOneAndUpdate(
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

exports.deleteWork = async (req, res) => {
    try {
        const record = await Work.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!record) return res.status(404).json({ message: "Not found" });
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
