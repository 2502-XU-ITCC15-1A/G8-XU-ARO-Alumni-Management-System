const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware'); 
const {
  getSystemLogs,
} = require('../controllers/systemLogsController');

router.get('/', protect, getSystemLogs);

module.exports = router;