const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Personal information
    lastName:   String,
    firstName:  String,
    middleName: String,
    bloodType:  String,

    // Graduation years per school level
    gradGradeSchool: String,
    gradJHS:         String,
    gradSHS:         String,
    gradCollege:     String,
    gradPostGrad:    String,

    // Course and address
    course:      String,
    homeAddress: String,

    // University ID
    universityIdNumber: String,
    validUntil:         Date,
    verifiedBy:         String,
    signature:          String,

    // Payment
    receiptImage:    String,
    paymentVerified: { type: Boolean, default: false },

    status: {
        type: String,
        enum: ["pending", "under_review", "approved", "payment_pending", "payment", "rejected", "printing", "released"],
        default: "pending"
    },

    remarks: String,

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Application", applicationSchema);
