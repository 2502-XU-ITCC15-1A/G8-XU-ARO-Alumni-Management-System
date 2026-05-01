require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use('/uploads', require('express').static('uploads'));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/alumni", require("./routes/alumniRoutes"));
app.use("/api/IdApplication", require("./routes/IdApplicationRoutes"));
app.use("/api/bookcenter", require("./routes/bookCenterRoutes"));
app.use("/api/education", require("./routes/educationRoutes"));
app.use("/api/work", require("./routes/workRoutes")); 
app.use("/api/notifications", require("./routes/notificationRoutes"));



app.get("/", (req, res) => {
    res.send("Backend Running");
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});