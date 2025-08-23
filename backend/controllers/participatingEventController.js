const ParticipatingEvent = require('../models/ParticipatingEvent');
const Participation = require('../models/Participation');
const User = require('../models/User'); // Import the User model
const { sendEventNotification } = require('../utils/email');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

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

    // Send emails to all users
    try {
      const users = await User.find({}, 'email');
      console.log(`Found ${users.length} users to notify`);

      // Send emails sequentially to avoid overwhelming the email service
      for (const user of users) {
        try {
          await sendEventNotification(user.email, {
            eventName,
            eventDate,
            eventTime,
            registrationClosing,
            subEvents  // Added subEvents to the email data
          });
          console.log(`Notification sent to ${user.email}`);
        } catch (emailError) {
          console.error(`Failed to send email to ${user.email}:`, emailError);
          // Continue with other emails even if one fails
        }
      }
    } catch (userError) {
      console.error('Error fetching users or sending emails:', userError);
      // Don't fail the entire request if email sending fails
    }

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
    const eventId = req.params.id;
    const event = await ParticipatingEvent.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Delete all participation records linked to this event
    const deleteResult = await Participation.deleteMany({ eventId });

    // Delete the event itself
    await ParticipatingEvent.findByIdAndDelete(eventId);

    // Fetch users to notify (email + fullName)
    let users = [];
    try {
      users = await User.find({}, 'email fullName');
    } catch (err) {
      console.error('Failed to fetch users for notifications:', err);
      // proceed — deletion already done; we'll return counts and note email failures
    }

    // Send plain professional cancellation email (no logo)
    let emailSuccessCount = 0;
    for (const u of users) {
      if (!u.email) continue;

      const toName = u.fullName || 'Member';
      const subject = `Cancellation: "${event.eventName}"`;
      const eventDateStr = event.eventDate ? new Date(event.eventDate).toLocaleString() : 'the scheduled date';
      const html = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
  </head>
  <body style="margin:0;padding:0;font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#f6f8fa;color:#0f172a;">
    <div style="max-width:680px;margin:28px auto;padding:0 16px;">
      <div style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 6px 20px rgba(2,6,23,0.08);">
        <div style="padding:24px 28px;background:linear-gradient(90deg,#0f62fe 0%,#2563eb 100%);color:#fff;">
          <h2 style="margin:0;font-size:18px;">Event Cancellation Notice</h2>
        </div>

        <div style="padding:24px 28px;">
          <p style="margin:0 0 12px 0;">Hello ${toName},</p>

          <p style="margin:0 0 12px 0;line-height:1.6;">
            We regret to inform you that the event <strong>${event.eventName}</strong>, scheduled for <strong>${eventDateStr}</strong>
            ${event.eventTime ? `at ${event.eventTime}` : ''} has been <strong>cancelled</strong>.
          </p>

          <div style="border:1px solid #e6eef8;padding:12px 14px;border-radius:8px;margin:12px 0;color:#334155;">
            <p style="margin:0 0 6px;font-weight:600;">What this means</p>
            <ul style="margin:6px 0 0 18px;line-height:1.6;">
              <li>All registrations and participations for this event have been cancelled and removed from our system.</li>
              <li>If you had registered, any follow-up (refunds or next steps) will be communicated by the event organizers where applicable.</li>
            </ul>
          </div>

          <p style="margin:0 0 12px 0;line-height:1.6;">
            We apologize for the inconvenience. If you have questions or need assistance, please contact
            <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@example.com'}" style="color:#0f62fe;text-decoration:none;">
              ${process.env.SUPPORT_EMAIL || 'support@example.com'}
            </a>
            ${process.env.SUPPORT_PHONE ? `or call ${process.env.SUPPORT_PHONE}` : ''}.
          </p>

          <p style="margin:16px 0 0 0;font-weight:600;">${process.env.ORGANIZER_NAME || 'Event Management Team'}</p>
        </div>

        <div style="padding:12px 28px;background:#fbfdff;color:#64748b;font-size:13px;">
          ${process.env.ORGANIZER_ADDRESS || ''}
        </div>
      </div>
    </div>
  </body>
</html>
      `;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: u.email,
        subject,
        html
      };

      try {
        await transporter.sendMail(mailOptions);
        emailSuccessCount++;
      } catch (emailErr) {
        console.error(`Failed to send cancellation email to ${u.email}:`, emailErr);
        // continue sending to others
      }
    }

    return res.status(200).json({
      success: true,
      message: `Event deleted successfully. Removed ${deleteResult.deletedCount} participation record(s). Cancellation emails sent to ${emailSuccessCount} of ${users.length} user(s).`
    });
  } catch (error) {
    console.error('Error deleting participating event:', error);
    return res.status(500).json({
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
