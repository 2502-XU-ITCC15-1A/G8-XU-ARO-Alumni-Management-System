require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

app.use(cors());
app.use(express.json());

//routes
const applicationsRoute = require('./routes/applications');
app.use('/api/applications', applicationsRoute);

app.get("/", (req, res) => {
    res.send("Backend Running");
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});