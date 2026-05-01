const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,

    company: String,
    department: String,
    position: String,
    address: String,
    phone: String,
    email: String
});

module.exports = mongoose.model("Work", schema);