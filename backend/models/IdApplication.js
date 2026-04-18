const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    course: String,
    homeAddress: String,
    universityIdNumber: String,

    receiptImage: String,

    status: {
        type: String,
        enum: ["pending", "under_review", "approved", "rejected"],
        default: "pending"
    },

    remarks: String,

    validUntil: Date,
    verifiedBy: String,

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Application", applicationSchema);