const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');

router.get(
  '/analytics',
  authMiddleware,
  authorizeRole('admin'),
  adminController.getAnalytics
);

module.exports = router;