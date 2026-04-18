const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,

    course: String,
    homeAddress: String,
    universityIdNumber: String,

    status: {
        type: String,
        default: "pending"
    },

    validUntil: Date,
    verifiedBy: String,

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Application", applicationSchema);