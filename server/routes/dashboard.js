const express = require('express');
const HelpRequest = require('../models/HelpRequest');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard/stats — Get dashboard statistics
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const [total, pending, assigned, completed, critical, normal] = await Promise.all([
      HelpRequest.countDocuments(),
      HelpRequest.countDocuments({ status: 'pending' }),
      HelpRequest.countDocuments({ status: 'assigned' }),
      HelpRequest.countDocuments({ status: 'completed' }),
      HelpRequest.countDocuments({ priority: 'critical' }),
      HelpRequest.countDocuments({ priority: 'normal' }),
    ]);

    // Category breakdown
    const categoryStats = await HelpRequest.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    // Recent requests
    const recentRequests = await HelpRequest.find()
      .populate('reportedBy', 'name')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      total,
      pending,
      assigned,
      completed,
      priority: { critical, normal },
      categoryStats,
      recentRequests,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
