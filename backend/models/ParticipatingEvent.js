const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  roleName: {
    type: String,
    required: true,
    trim: true
  },
  isCompulsory: {
    type: Boolean,
    default: false
  }
});

const subEventSchema = new mongoose.Schema({
  subEventName: {
    type: String,
    required: true,
    trim: true
  },
  maxParticipants: {
    type: Number,
    required: true,
    min: 1
  },
  roles: [roleSchema],
  description: {
    type: String,
    trim: true
  }
});

const participatingEventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true,
    trim: true
  },
  eventDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Event date must be in the future'
    }
  },
  eventTime: {
    type: String,
    required: true
  },
  registrationClosing: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        const eventDate = new Date(this.eventDate);
        const oneDayBefore = new Date(eventDate);
        oneDayBefore.setDate(oneDayBefore.getDate() - 1);
        return value <= oneDayBefore;
      },
      message: 'Registration must close at least one day before the event'
    }
  },
  subEvents: [subEventSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'completed'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Pre-save middleware to automatically set registrationClosing if not provided
participatingEventSchema.pre('validate', function(next) {
  if (this.eventDate && !this.registrationClosing) {
    const closingDate = new Date(this.eventDate);
    closingDate.setDate(closingDate.getDate() - 1);
    this.registrationClosing = closingDate;
  }
  next();
});

module.exports = mongoose.model('ParticipatingEvent', participatingEventSchema);
