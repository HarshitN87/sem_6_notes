const express = require('express');
const User = require('../models/User');
const HelpRequest = require('../models/HelpRequest');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/volunteers — List all volunteers
router.get('/', requireAuth, async (req, res) => {
  try {
    const volunteers = await User.find({ role: 'volunteer' }).select('-password');
    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/volunteers/:id/assignments — Get volunteer's assigned requests
router.get('/:id/assignments', requireAuth, async (req, res) => {
  try {
    const requests = await HelpRequest.find({ assignedTo: req.params.id })
      .populate('reportedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
