const mongoose = require('mongoose');

const smsLogSchema = new mongoose.Schema({
  senderPhone: {
    type: String,
    required: [true, 'Sender phone is required'],
    trim: true,
  },
  messageBody: {
    type: String,
    required: [true, 'Message body is required'],
  },
  parsedStatus: {
    type: String,
    enum: ['success', 'failed'],
    default: 'failed',
  },
  generatedRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HelpRequest',
    default: null,
  },
  parsedData: {
    category: String,
    location: String,
  },
  receivedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('SMSLog', smsLogSchema);
