// routes/events.js
const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const jwt = require('jsonwebtoken');

const memberAuthMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.member && decoded.member.role === 'member') {
      req.member = decoded.member;
      next();
    } else {
      return res.status(403).json({ message: 'Member access required' });
    }
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Create new event
router.post('/', memberAuthMiddleware, async (req, res) => {
  try {
    const { eventName, eventDateTime, description, memberId, memberName } = req.body;

    // Validate input
    if (!eventName || !eventDateTime || !description || !memberId || !memberName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create event
    const event = new Event({
      eventName,
      eventDateTime: new Date(eventDateTime),
      description,
      createdBy: req.member.id,
      memberId,
      memberName
    });

    await event.save();

    res.status(201).json({
      message: 'Event created successfully',
      event: {
        id: event._id,
        eventName: event.eventName,
        eventDateTime: event.eventDateTime,
        description: event.description
      }
    });
  } catch (error) {
    console.error('Event creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ eventDateTime: -1 });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
