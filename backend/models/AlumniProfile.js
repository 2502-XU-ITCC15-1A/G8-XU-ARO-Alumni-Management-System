const mongoose = require("mongoose");

const alumniScheme = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,

    surname: String,
    firtsName: String,
    middleName: String,
    nickname: String,

    gender: String,
    birthdate: Date,
    nationality: String,
    religion: String,
    universityIdNumber: String,

    spouseName: String,
    childrenNames: [String],

    email: String,
    phone: String,
    facebook: String,

    address: {
        street: String,
        barangay: String,
        city: String,
        province: Atring,
        country: String,
        zipCode: String
    }
});

module.exports = mongoose.model("AlumniProfile", alumniSchema);