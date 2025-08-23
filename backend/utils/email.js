// utils/email.js
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Read the email template
const emailTemplate = fs.readFileSync(
  path.join(__dirname, 'templates', 'event-notification.html'),
  'utf8'
);

exports.sendEventNotification = async (to, eventDetails) => {
  // Replace simple placeholders
  let htmlContent = emailTemplate
    .replace(/{{eventName}}/g, eventDetails.eventName)
    .replace(/{{eventDate}}/g, eventDetails.eventDate)
    .replace(/{{eventTime}}/g, eventDetails.eventTime)
    .replace(/{{registrationClosing}}/g, eventDetails.registrationClosing);

  // Generate subEvents HTML programmatically
  let subEventsHtml = '';
  if (eventDetails.subEvents && eventDetails.subEvents.length > 0) {
    subEventsHtml = '<div class="sub-events"><h3>Event Activities</h3>';

    eventDetails.subEvents.forEach(subEvent => {
      let rolesHtml = '';
      if (subEvent.roles && subEvent.roles.length > 0) {
        subEvent.roles.forEach(role => {
          rolesHtml += `<span class="role-badge ${role.isCompulsory ? 'compulsory' : ''}">
            ${role.name} ${role.isCompulsory ? '(*Required)' : ''}
          </span>`;
        });
      }

      subEventsHtml += `
        <div style="margin-bottom: 25px;">
          <div class="sub-event-title">${subEvent.subEventName}</div>
          <div>${rolesHtml}</div>
        </div>
      `;
    });

    subEventsHtml += '</div>';
  }

  // Replace the subEvents container with the generated HTML
  htmlContent = htmlContent.replace('<div id="subEventsContainer"></div>', subEventsHtml);

  const mailOptions = {
    from: `Sijgeria <${process.env.EMAIL_USER}>`,
    to,
    subject: `New Event: ${eventDetails.eventName}`,
    html: htmlContent
  };

  await transporter.sendMail(mailOptions);
};
