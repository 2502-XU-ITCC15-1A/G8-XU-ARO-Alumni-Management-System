const express = require('express');
const router = express.Router();
const Application = require('../models/IdApplication');

//get applications
router.get('/', async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;