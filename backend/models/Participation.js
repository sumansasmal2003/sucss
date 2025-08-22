// Backend: Participation model (updated)
const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true
  },
  participantName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  }
});

const participationSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParticipatingEvent',
    required: true
  },
  subEventName: {
    type: String,
    required: true
  },
  participants: [participantSchema],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Participation', participationSchema);
