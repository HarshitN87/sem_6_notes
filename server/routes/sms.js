const express = require('express');
const SMSLog = require('../models/SMSLog');
const HelpRequest = require('../models/HelpRequest');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Known categories for SMS parsing
const CATEGORIES = ['food', 'water', 'medical', 'shelter', 'rescue'];

// Dummy coordinates for common location keywords (for prototype)
const LOCATION_COORDS = {
  'downtown': { lat: 28.6139, lng: 77.2090 },
  'north': { lat: 28.7041, lng: 77.1025 },
  'south': { lat: 28.5245, lng: 77.1855 },
  'east': { lat: 28.6280, lng: 77.2950 },
  'west': { lat: 28.6353, lng: 77.0880 },
  'central': { lat: 28.6315, lng: 77.2167 },
  'river': { lat: 28.6850, lng: 77.2200 },
  'hospital': { lat: 28.5672, lng: 77.2100 },
  'station': { lat: 28.6425, lng: 77.2195 },
  'market': { lat: 28.6507, lng: 77.2334 },
};

/**
 * Parse SMS message body
 * Expected format: HELP [CATEGORY] [LOCATION_DESCRIPTION]
 * Example: "HELP MEDICAL downtown near river"
 */
function parseSMS(messageBody) {
  const parts = messageBody.trim().split(/\s+/);

  if (parts.length < 2 || parts[0].toUpperCase() !== 'HELP') {
    return null;
  }

  const potentialCategory = parts[1].toLowerCase();
  let category = 'rescue'; // default
  let locationStr = '';

  if (CATEGORIES.includes(potentialCategory)) {
    category = potentialCategory;
    locationStr = parts.slice(2).join(' ');
  } else {
    locationStr = parts.slice(1).join(' ');
  }

  // Try to find coordinates from location keywords
  let coords = { lat: 28.6139, lng: 77.2090 }; // Default to Delhi
  const locationLower = locationStr.toLowerCase();
  for (const [keyword, c] of Object.entries(LOCATION_COORDS)) {
    if (locationLower.includes(keyword)) {
      coords = c;
      break;
    }
  }

  return {
    category,
    location: {
      name: locationStr || 'Unknown location',
      lat: coords.lat,
      lng: coords.lng,
    },
  };
}

// POST /api/sms/incoming — Receive and parse SMS
router.post('/incoming', async (req, res) => {
  try {
    const { senderPhone, messageBody } = req.body;

    if (!senderPhone || !messageBody) {
      return res.status(400).json({ message: 'senderPhone and messageBody are required' });
    }

    const parsed = parseSMS(messageBody);

    const smsLog = new SMSLog({
      senderPhone,
      messageBody,
      parsedStatus: parsed ? 'success' : 'failed',
      parsedData: parsed ? { category: parsed.category, location: parsed.location.name } : null,
    });

    if (parsed) {
      // Find or use a system admin to report the request
      let reporter = await User.findOne({ role: 'admin' });
      if (!reporter) {
        reporter = await User.findOne(); // fallback to any user
      }

      if (reporter) {
        const request = new HelpRequest({
          title: `SMS: ${parsed.category.toUpperCase()} request from ${senderPhone}`,
          description: `Auto-generated from SMS: "${messageBody}"`,
          category: parsed.category,
          priority: 'critical', // SMS requests are treated as critical
          location: parsed.location,
          reportedBy: reporter._id,
          source: 'sms',
        });

        await request.save();
        smsLog.generatedRequest = request._id;
      }
    }

    await smsLog.save();

    res.status(201).json({
      message: parsed ? 'SMS parsed and request created' : 'SMS received but could not be parsed',
      smsLog,
      parsed,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/sms/logs — View SMS logs
router.get('/logs', requireAuth, async (req, res) => {
  try {
    const logs = await SMSLog.find()
      .populate('generatedRequest')
      .sort({ receivedAt: -1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
