const mongoose = require('mongoose');

const helpRequestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    enum: ['food', 'water', 'medical', 'shelter', 'rescue'],
    required: [true, 'Category is required'],
  },
  priority: {
    type: String,
    enum: ['normal', 'critical'],
    default: 'normal',
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'completed'],
    default: 'pending',
  },
  location: {
    name: { type: String, default: '' },
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  source: {
    type: String,
    enum: ['web', 'sms'],
    default: 'web',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
helpRequestSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

helpRequestSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('HelpRequest', helpRequestSchema);
