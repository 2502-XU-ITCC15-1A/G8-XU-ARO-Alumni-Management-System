const mongoose = require("mongoose");

const alumniScheme = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,

    surname: String,
    firstName: String,
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
        province: String,
        country: String,
        zipCode: String
    }
});

module.exports = mongoose.model("AlumniProfile", alumniScheme);