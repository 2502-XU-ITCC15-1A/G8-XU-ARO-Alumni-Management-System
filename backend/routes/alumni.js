const express = required("express");
const router = express.Router();
const Alumni = require("../models/AlumniProfile");

router.post("/create", async (req, res) => {
    const alumni = new Alumni(req.body);
    await alumni.save();
    res.json({ message: "Alumni saved" });
});

router.get("/", async (req, res) => {
    const data = await Alumni.find();
    res.json(data);
});

module.exports = router;