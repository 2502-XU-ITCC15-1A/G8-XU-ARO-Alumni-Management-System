require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

const alumniRoutes = require("./routes/alumni");
app.use("/api/alumni", alumniRoutes);

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log ("MongoDB Connected"))
    .catch(err => console.log(err));
    
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Backend Running");
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});