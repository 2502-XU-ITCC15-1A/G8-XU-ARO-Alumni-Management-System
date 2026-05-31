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
        const data = await Alumni.aggregate([
            {
                $lookup: {
                    from: "educations",       
                    localField: "userId",     
                    foreignField: "userId",   
                    as: "education"         
                }
            },
            {
                $lookup: {
                    from: "works",            
                    localField: "userId",     
                    foreignField: "userId",   
                    as: "work"                
                }
            }
        ]);
        
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getProfileById = async (req, res) => {
    try {
        const mongoose = require("mongoose");
        const profileId = new mongoose.Types.ObjectId(req.params.id);

        const data = await Alumni.aggregate([
            { $match: { _id: profileId } },
            {
                $lookup: {
                    from: "educations",
                    localField: "userId",
                    foreignField: "userId",
                    as: "education"
                }
            },
            {
                $lookup: {
                    from: "works",
                    localField: "userId",
                    foreignField: "userId",
                    as: "work"
                }
            }
        ]);

        if (!data || data.length === 0) {
            return res.status(404).json({ message: "Alumni not found" });
        }

        res.json(data[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const updated = await Alumni.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updated) {
            return res.status(404).json({
                message: "Alumni not found"
            });
        }

        res.json(updated);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
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