const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    level: String,
    schoolName: String,
    degree: String,
    yearGraduated: Number
});

module.exports = mongoose.model("Education", educationSchema);