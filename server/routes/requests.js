const express = require('express');
const HelpRequest = require('../models/HelpRequest');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/requests — List all requests with optional filters
router.get('/', requireAuth, async (req, res) => {
  try {
    const { status, category, priority, search } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'location.name': { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const requests = await HelpRequest.find(filter)
      .populate('reportedBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/requests/:id — Get single request
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const request = await HelpRequest.findById(req.params.id)
      .populate('reportedBy', 'name email role')
      .populate('assignedTo', 'name email role');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/requests — Create new request
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, description, category, priority, location } = req.body;

    const request = new HelpRequest({
      title,
      description,
      category,
      priority,
      location,
      reportedBy: req.user._id,
      source: 'web',
    });

    await request.save();
    await request.populate('reportedBy', 'name email role');

    res.status(201).json({ message: 'Request created', request });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/requests/:id — Update request
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { title, description, category, priority, status, location } = req.body;
    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;
    if (location !== undefined) updateData.location = location;

    const request = await HelpRequest.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('reportedBy', 'name email role')
      .populate('assignedTo', 'name email role');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json({ message: 'Request updated', request });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/requests/:id — Delete request (admin only)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const request = await HelpRequest.findByIdAndDelete(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json({ message: 'Request deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/requests/:id/assign — Assign volunteer to request
router.put('/:id/assign', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { volunteerId } = req.body;

    const request = await HelpRequest.findByIdAndUpdate(
      req.params.id,
      {
        assignedTo: volunteerId,
        status: 'assigned',
      },
      { new: true }
    )
      .populate('reportedBy', 'name email role')
      .populate('assignedTo', 'name email role');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json({ message: 'Volunteer assigned', request });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
