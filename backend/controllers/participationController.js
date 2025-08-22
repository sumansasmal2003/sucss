// Backend: participationController.js
const Participation = require('../models/Participation');
const ParticipatingEvent = require('../models/ParticipatingEvent');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.registerParticipation = async (req, res) => {
  try {
    const { eventId, subEventName, participants } = req.body;
    const userId = req.user._id;

    if (!eventId || !subEventName || !participants || participants.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Event ID, sub-event name, and participants are required'
      });
    }

    const event = await ParticipatingEvent.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (new Date() > event.registrationClosing) {
      return res.status(400).json({
        success: false,
        message: 'Registration for this event has closed'
      });
    }

    const subEvent = event.subEvents.find(se => se.subEventName === subEventName);
    if (!subEvent) {
      return res.status(404).json({
        success: false,
        message: 'Sub-event not found'
      });
    }

    // Check for duplicate participants in the same event with the same role
    for (const participant of participants) {
      const { role, participantName, email, phone } = participant;

      if (!role || !participantName || !email || !phone) {
        return res.status(400).json({
          success: false,
          message: 'All participant fields are required'
        });
      }

      // Check if participant already exists in this event with the same role
      const existingParticipant = await Participation.findOne({
        eventId,
        'participants.role': role,
        'participants.email': email.toLowerCase()
      });

      if (existingParticipant) {
        return res.status(400).json({
          success: false,
          message: `Participant with email ${email} is already registered for role ${role} in this event`
        });
      }

      const roleExists = subEvent.roles.some(r => r.roleName === role);
      if (!roleExists) {
        return res.status(400).json({
          success: false,
          message: `Role '${role}' not found in sub-event`
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Phone number must be 10 digits'
        });
      }
    }

    const compulsoryRoles = subEvent.roles.filter(r => r.isCompulsory).map(r => r.roleName);
    const filledRoles = participants.map(p => p.role);

    for (const compulsoryRole of compulsoryRoles) {
      if (!filledRoles.includes(compulsoryRole)) {
        return res.status(400).json({
          success: false,
          message: `Compulsory role '${compulsoryRole}' must be filled`
        });
      }
    }

    const participation = new Participation({
      eventId,
      subEventName,
      participants: participants.map(p => ({
        ...p,
        email: p.email.toLowerCase()
      })),
      userId
    });

    await participation.save();

    // Precompute logo handling outside the loop
    const logoCid = 'sucsslogo';
    let logoSrc = process.env.CLIENT_LOGO_URL || '';
    let logoAttachments = [];

    // If no hosted logo URL, try to use local file
    if (!logoSrc) {
      const localLogoPath = path.join(__dirname, '..', 'config', 'sucss.png');

      if (fs.existsSync(localLogoPath)) {
        logoSrc = `cid:${logoCid}`;
        logoAttachments.push({
          filename: 'logo.png',
          path: localLogoPath,
          cid: logoCid
        });
      } else {
        console.warn('Local logo file not found at:', localLogoPath);
      }
    }

    // Send confirmation emails to all participants
    try {
      for (const participant of participants) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: participant.email,
          subject: `Registration Confirmation — ${event.eventName}`,
          text: `
Hello ${participant.participantName},

Thank you for registering for ${event.eventName} (${subEventName} — role: ${participant.role}).

Event: ${event.eventName}
Sub-event: ${subEventName}
Role: ${participant.role}
Date & Time: ${event.date || 'TBD'}
Location: ${event.location || 'TBD'}

If you need to make changes or have questions, please contact the event organizers.

Best regards,
Event Management Team
`,
          html: `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color:#f4f6f8;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <!-- Container -->
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(16,24,40,0.08);">
          <!-- Header / Logo -->
          <tr>
            <td style="padding:24px 32px;background: linear-gradient(90deg,#0f62fe 0%, #2563eb 100%); color:#ffffff;">
              <table width="100%" role="presentation">
                <tr>
                  <td style="vertical-align:middle;">
                    ${logoSrc ? `
                    <img src="${logoSrc}" alt="${event.organizer || 'Event Organizer'}" width="60" style="display:block;border:0;outline:none;text-decoration:none;">
                    ` : `
                    <div style="font-size:20px;font-weight:bold;">${event.organizer || 'Event Organizer'}</div>
                    `}
                  </td>
                  <td align="right" style="vertical-align:middle;color:#ffffff;font-size:14px;">
                    <strong>Registration Confirmed</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 32px;color:#0f172a;">
              <h1 style="margin:0 0 12px 0;font-size:20px;font-weight:600;">Hi ${participant.participantName},</h1>
              <p style="margin:0 0 16px 0;line-height:1.5;color:#334155;">
                Thank you for registering for <strong>${event.eventName}</strong>. This email confirms your registration for the sub-event <strong>${subEventName}</strong> in the role of <strong>${participant.role}</strong>.
              </p>

              <!-- Event details card -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:16px 0 20px 0;border:1px solid #e6eef8;border-radius:6px;">
                <tr>
                  <td style="padding:12px 16px;">
                    <p style="margin:0 0 8px 0;font-weight:600;color:#0f172a;">Event details</p>
                    <p style="margin:0;color:#475569;line-height:1.5;">
                      <strong>Event:</strong> ${event.eventName} <br>
                      <strong>Sub-event:</strong> ${subEventName} <br>
                      <strong>Role:</strong> ${participant.role} <br>
                      ${event.date ? `<strong>Date & Time:</strong> ${event.date} <br>` : ''}
                      ${event.location ? `<strong>Location:</strong> ${event.location} <br>` : ''}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;color:#64748b;line-height:1.5;">
                Please keep this email for your records. If any information is incorrect or you need to update your registration, contact the event organizers at
                <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@example.com'}" style="color:#0f62fe;text-decoration:none;">${process.env.SUPPORT_EMAIL || 'support@example.com'}</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:18px 32px;background-color:#f8fafc;color:#64748b;font-size:13px;">
              <table width="100%" role="presentation">
                <tr>
                  <td style="vertical-align:middle;">
                    <div style="font-weight:600;color:#0f172a;">${event.organizer || 'Event Management Team'}</div>
                    <div style="margin-top:6px;">${process.env.ORGANIZER_ADDRESS || ''}</div>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <div style="text-align:right;">
                      <div style="margin-bottom:6px;">Need help?</div>
                      <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@example.com'}" style="color:#0f62fe;text-decoration:none;">${process.env.SUPPORT_EMAIL || 'support@example.com'}</a>
                      ${process.env.SUPPORT_PHONE ? `<div style="margin-top:6px;">${process.env.SUPPORT_PHONE}</div>` : ''}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="text-align:center;padding:12px 16px;background:#ffffff;color:#94a3b8;font-size:12px;">
              <div style="max-width:520px;margin:0 auto;">
                This is an automated message — please do not reply to this email. If you wish to unsubscribe from event notifications, manage your preferences in your account.
              </div>
            </td>
          </tr>

        </table>
        <!-- /Container -->
      </td>
    </tr>
  </table>
</body>
</html>
`,
          attachments: logoAttachments
        };

        await transporter.sendMail(mailOptions);
        console.log(`Confirmation email sent to ${participant.email}`);
      }
    } catch (emailError) {
      console.error('Error sending confirmation emails:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Participation registered successfully',
      data: participation
    });
  } catch (error) {
    console.error('Error registering participation:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

exports.getUserParticipations = async (req, res) => {
  try {
    const userId = req.user._id;

    const participations = await Participation.find({
      userId
    }).populate('eventId', 'eventName eventDate');

    res.status(200).json({
      success: true,
      data: participations
    });
  } catch (error) {
    console.error('Error fetching participations:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get participations for the currently authenticated user
exports.getMyParticipations = async (req, res) => {
  try {
    const userId = req.user._id; // Get user ID from authenticated user

    // Find all participations where the userId matches
    const participations = await Participation.find({
      userId
    })
    .populate('eventId', 'eventName eventDate eventTime')
    .sort({ createdAt: -1 });

    // Format the response data
    const formattedParticipations = participations.map(participation => ({
      _id: participation._id,
      eventName: participation.eventId?.eventName || 'Unknown Event',
      eventDate: participation.eventId?.eventDate,
      eventTime: participation.eventId?.eventTime,
      subEventName: participation.subEventName,
      participants: participation.participants,
      createdAt: participation.createdAt
    }));

    res.status(200).json({
      success: true,
      data: formattedParticipations
    });
  } catch (error) {
    console.error('Error fetching user participations:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all participants for a specific event
exports.getEventParticipants = async (req, res) => {
  try {
    const { eventId } = req.params;

    const participations = await Participation.find({
      eventId
    }).select('participants');

    // Extract all participants from all participations for this event
    const allParticipants = participations.flatMap(p => p.participants);

    res.status(200).json({
      success: true,
      data: allParticipants
    });
  } catch (error) {
    console.error('Error fetching event participants:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

exports.getUserRecords = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get all users with pagination
    const users = await User.find()
      .select('-password')
      .skip(skip)
      .limit(limit);

    // Get participation records for each user
    const userRecords = await Promise.all(
      users.map(async (user) => {
        const participations = await Participation.find({ userId: user._id })
          .populate('eventId', 'eventName eventDate eventTime');

        // Calculate total participants for this user
        const totalParticipants = participations.reduce(
          (total, participation) => total + participation.participants.length,
          0
        );

        return {
          user: {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            mobile: user.mobile,
            username: user.username,
            address: user.address,
            createdAt: user.createdAt
          },
          participations,
          totalParticipants
        };
      })
    );

    const totalUsers = await User.countDocuments();

    res.status(200).json({
      success: true,
      data: userRecords,
      pagination: {
        current: page,
        pages: Math.ceil(totalUsers / limit),
        total: totalUsers
      }
    });
  } catch (error) {
    console.error('Error fetching user records:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
