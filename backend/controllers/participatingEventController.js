const ParticipatingEvent = require('../models/ParticipatingEvent');
const Participation = require('../models/Participation');

exports.createParticipatingEvent = async (req, res) => {
  try {
    const {
      eventName,
      eventDate,
      eventTime,
      registrationClosing,
      subEvents
    } = req.body;

    if (new Date(eventDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Event date must be in the future'
      });
    }

    const eventDateObj = new Date(eventDate);
    const registrationClosingObj = new Date(registrationClosing);
    const oneDayBeforeEvent = new Date(eventDateObj);
    oneDayBeforeEvent.setDate(oneDayBeforeEvent.getDate() - 1);

    if (registrationClosingObj > oneDayBeforeEvent) {
      return res.status(400).json({
        success: false,
        message: 'Registration must close at least one day before the event'
      });
    }

    for (const subEvent of subEvents) {
      const hasCompulsoryRole = subEvent.roles.some(role => role.isCompulsory);
      if (!hasCompulsoryRole) {
        return res.status(400).json({
          success: false,
          message: `Each sub-event must have at least one compulsory role. Missing in: ${subEvent.subEventName}`
        });
      }
    }

    const participatingEvent = new ParticipatingEvent({
      eventName,
      eventDate,
      eventTime,
      registrationClosing,
      subEvents,
      createdBy: req.memberId
    });

    await participatingEvent.save();

    res.status(201).json({
      success: true,
      message: 'Participating event created successfully',
      data: participatingEvent
    });
  } catch (error) {
    console.error('Error creating participating event:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

exports.getMemberParticipatingEvents = async (req, res) => {
  try {
    const events = await ParticipatingEvent.find({ createdBy: req.memberId })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'fullName memberId');

    res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching participating events:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

exports.getAllParticipatingEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const events = await ParticipatingEvent.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'fullName memberId');

    const total = await ParticipatingEvent.countDocuments();

    res.status(200).json({
      success: true,
      data: events,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total: total
      }
    });
  } catch (error) {
    console.error('Error fetching all participating events:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

exports.getParticipatingEvent = async (req, res) => {
  try {
    const event = await ParticipatingEvent.findById(req.params.id)
      .populate('createdBy', 'fullName memberId');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error fetching participating event:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

exports.updateParticipatingEvent = async (req, res) => {
  try {
    const event = await ParticipatingEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.createdBy.toString() !== req.memberId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    if (new Date() > event.registrationClosing) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update event after registration has closed'
      });
    }

    const updatedEvent = await ParticipatingEvent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent
    });
  } catch (error) {
    console.error('Error updating participating event:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

exports.deleteParticipatingEvent = async (req, res) => {
  try {
    const event = await ParticipatingEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.createdBy.toString() !== req.memberId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }

    await ParticipatingEvent.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting participating event:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

exports.getOpenEvents = async (req, res) => {
  try {
    const currentDate = new Date();
    const events = await ParticipatingEvent.find({
      registrationClosing: { $gt: currentDate },
      status: 'active'
    }).select('eventName eventDate eventTime registrationClosing subEvents');

    res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching open events:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
