require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");

const app = express();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

app.use(cors());
app.use(express.json());
app.use('/uploads', require('express').static('uploads'));

//routes
const applicationsRoute = require('./routes/applications');
app.use('/api/applications', applicationsRoute);

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/alumni", require("./routes/alumniRoutes"));
app.use("/api/education", require("./routes/educationRoutes"));
app.use("/api/work", require("./routes/workRoutes"));
app.use("/api/IdApplication", require("./routes/IdApplicationRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/bookcenter", require("./routes/bookCenterRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));


app.get("/", (req, res) => {
    res.send("Backend Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});