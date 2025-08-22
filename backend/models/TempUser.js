const mongoose = require('mongoose');

const tempUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  otp: {
    type: String,
    required: true
  },
  formData: {
    type: Object,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Automatically delete after 10 minutes
  }
});

const TempUser = mongoose.model('TempUser', tempUserSchema);

module.exports = TempUser;
