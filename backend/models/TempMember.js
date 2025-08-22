const mongoose = require('mongoose');

const tempMemberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  memberId: {
    type: String,
    required: true
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

const TempMember = mongoose.model('TempMember', tempMemberSchema);

module.exports = TempMember;
