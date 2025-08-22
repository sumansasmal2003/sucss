const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require('../models/User');
const Member = require('../models/Member');
const TempUser = require('../models/TempUser');
const TempMember = require('../models/TempMember');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Professional email template
const getEmailTemplate = (otp) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }

      .container {
        max-width: 600px;
        margin: 20px auto;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 0 20px rgba(0,0,0,0.1);
      }

      .header {
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
        padding: 30px 20px;
        text-align: center;
      }

      .header h1 {
        color: white;
        font-size: 24px;
        margin-bottom: 10px;
      }

      .header p {
        color: rgba(255,255,255,0.8);
        font-size: 16px;
      }

      .content {
        padding: 30px;
        background-color: #ffffff;
      }

      .otp-container {
        background-color: #f3f4f6;
        border-radius: 8px;
        padding: 20px;
        text-align: center;
        margin: 25px 0;
      }

      .otp-code {
        font-size: 42px;
        letter-spacing: 8px;
        color: #1d4ed8;
        font-weight: bold;
        margin: 15px 0;
      }

      .note {
        color: #6b7280;
        font-size: 14px;
        margin-top: 10px;
      }

      .footer {
        background-color: #f9fafb;
        padding: 20px;
        text-align: center;
        border-top: 1px solid #e5e7eb;
        color: #6b7280;
        font-size: 12px;
      }

      .btn {
        display: inline-block;
        padding: 12px 30px;
        background: #2563eb;
        color: white !important;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 600;
        margin-top: 20px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Sijgeria Umesh Chandra Smriti Sangha</h1>
        <p>Official Registration Verification</p>
      </div>

      <div class="content">
        <h2>Verify Your Email Address</h2>
        <p>Thank you for registering with us! To complete your registration, please enter the following verification code:</p>

        <div class="otp-container">
          <div class="otp-code">${otp}</div>
          <p class="note">This code will expire in 10 minutes</p>
        </div>

        <p>If you didn't request this, please ignore this email. For security reasons, do not share this code with anyone.</p>
      </div>

      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Sijgeria Umesh Chandra Smriti Sangha. All rights reserved.</p>
        <p>This is an automated message - please do not reply directly to this email.</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

const getMemberEmailTemplate = (otp) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Member Verification</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }

      .container {
        max-width: 600px;
        margin: 20px auto;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 0 20px rgba(0,0,0,0.1);
      }

      /* GREEN THEME FOR MEMBERS */
      .header {
        background: linear-gradient(135deg, #059669, #047857);
        padding: 30px 20px;
        text-align: center;
      }

      .header h1 {
        color: white;
        font-size: 24px;
        margin-bottom: 10px;
      }

      .header p {
        color: rgba(255,255,255,0.8);
        font-size: 16px;
      }

      .content {
        padding: 30px;
        background-color: #ffffff;
      }

      .otp-container {
        background-color: #f0fdf4;
        border: 1px solid #bbf7d0;
        border-radius: 8px;
        padding: 20px;
        text-align: center;
        margin: 25px 0;
      }

      .otp-code {
        font-size: 42px;
        letter-spacing: 8px;
        color: #047857;
        font-weight: bold;
        margin: 15px 0;
      }

      .note {
        color: #6b7280;
        font-size: 14px;
        margin-top: 10px;
      }

      .footer {
        background-color: #f9fafb;
        padding: 20px;
        text-align: center;
        border-top: 1px solid #e5e7eb;
        color: #6b7280;
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Sijgeria Umesh Chandra Smriti Sangha</h1>
        <p>Member Registration Verification</p>
      </div>

      <div class="content">
        <h2>Welcome Valued Member!</h2>
        <p>Thank you for registering as a member! To complete your registration, please enter the following verification code:</p>

        <div class="otp-container">
          <div class="otp-code">${otp}</div>
          <p class="note">This code will expire in 10 minutes</p>
        </div>

        <p>If you didn't request this, please contact our membership team immediately.</p>
      </div>

      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Sijgeria Umesh Chandra Smriti Sangha. All rights reserved.</p>
        <p>Membership Committee</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

const getMemberApprovedTemplate = (memberName) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Membership Approved</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }

      .container {
        max-width: 600px;
        margin: 20px auto;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 0 20px rgba(0,0,0,0.1);
      }

      .header {
        background: linear-gradient(135deg, #059669, #047857);
        padding: 30px 20px;
        text-align: center;
      }

      .header h1 {
        color: white;
        font-size: 24px;
        margin-bottom: 10px;
      }

      .header p {
        color: white
      }

      .content {
        padding: 30px;
        background-color: #ffffff;
      }

      .highlight {
        background-color: #f0fdf4;
        border-left: 4px solid #10b981;
        padding: 20px;
        margin: 25px 0;
      }

      .footer {
        background-color: #f9fafb;
        padding: 20px;
        text-align: center;
        border-top: 1px solid #e5e7eb;
        color: #6b7280;
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Sijgeria Umesh Chandra Smriti Sangha</h1>
        <p>Membership Approval Notification</p>
      </div>

      <div class="content">
        <h2>Dear ${memberName},</h2>
        <p>We are pleased to inform you that your membership application has been approved!</p>

        <div class="highlight">
          <p><strong>Welcome to our community!</strong> You can now access all member benefits and features.</p>
          <p>Your member ID is the same as you registered with. Please keep it safe for future reference.</p>
        </div>

        <p>To get started, please login to your account:</p>
        <a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; padding: 12px 30px; background: #059669; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px;">
          Login to Member Portal
        </a>

        <p>If you have any questions, please contact our membership committee.</p>
      </div>

      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Sijgeria Umesh Chandra Smriti Sangha. All rights reserved.</p>
        <p>Membership Committee</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

const getMemberRejectedTemplate = (memberName, reason) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Membership Application Update</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }

      .container {
        max-width: 600px;
        margin: 20px auto;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 0 20px rgba(0,0,0,0.1);
      }

      .header {
        background: linear-gradient(135deg, #ef4444, #dc2626);
        padding: 30px 20px;
        text-align: center;
      }

      .header h1 {
        color: white;
        font-size: 24px;
        margin-bottom: 10px;
      }

      .header p {
        color: white
      }

      .content {
        padding: 30px;
        background-color: #ffffff;
      }

      .note {
        background-color: #fef2f2;
        border-left: 4px solid #ef4444;
        padding: 20px;
        margin: 25px 0;
      }

      .footer {
        background-color: #f9fafb;
        padding: 20px;
        text-align: center;
        border-top: 1px solid #e5e7eb;
        color: #6b7280;
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Sijgeria Umesh Chandra Smriti Sangha</h1>
        <p>Membership Application Update</p>
      </div>

      <div class="content">
        <h2>Dear ${memberName},</h2>
        <p>Thank you for your interest in becoming a member of our community.</p>

        <div class="note">
          <p>After careful review, we regret to inform you that your membership application has not been approved at this time.</p>
          <p><strong>Reason:</strong> ${reason || 'Please contact membership committee for details'}</p>
        </div>

        <p>If you believe this decision was made in error, or if you would like to provide additional information, please contact our membership committee:</p>
        <a href="mailto:sijgeria@gmail.com" style="color: #3b82f6; text-decoration: underline;">
          sijgeria@gmail.com
        </a>

        <p>We appreciate your understanding and hope you will consider reapplying in the future.</p>
      </div>

      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Sijgeria Umesh Chandra Smriti Sangha. All rights reserved.</p>
        <p>Membership Committee</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

const getUserBlockedTemplate = (userName, reason) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Status Update</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }

      .container {
        max-width: 600px;
        margin: 20px auto;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 0 20px rgba(0,0,0,0.1);
      }

      .header {
        background: linear-gradient(135deg, #ef4444, #dc2626);
        padding: 30px 20px;
        text-align: center;
      }

      .header h1 {
        color: white;
        font-size: 24px;
        margin-bottom: 10px;
      }

      .header p {
        color: white
      }

      .content {
        padding: 30px;
        background-color: #ffffff;
      }

      .alert {
        background-color: #fef2f2;
        border-left: 4px solid #ef4444;
        padding: 20px;
        margin: 25px 0;
      }

      .footer {
        background-color: #f9fafb;
        padding: 20px;
        text-align: center;
        border-top: 1px solid #e5e7eb;
        color: #6b7280;
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Sijgeria Umesh Chandra Smriti Sangha</h1>
        <p>Account Status Notification</p>
      </div>

      <div class="content">
        <h2>Dear ${userName},</h2>
        <p>This email is to inform you about an important change to your account status.</p>

        <div class="alert">
          <p><strong>Your account has been temporarily blocked.</strong></p>
          <p><strong>Reason:</strong> ${reason || 'Violation of community guidelines'}</p>
        </div>

        <p>During this period, you will not be able to access your account. If you believe this action was taken in error, or if you would like to appeal this decision, please contact our support team:</p>
        <a href="mailto:sijgeria@gmail.com" style="color: #3b82f6; text-decoration: underline;">
          sijgeria@gmail.com
        </a>

        <p>We take these measures to ensure a safe and respectful environment for all our community members.</p>
      </div>

      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Sijgeria Umesh Chandra Smriti Sangha. All rights reserved.</p>
        <p>Account Management Team</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

const getUserUnblockedTemplate = (userName) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Reactivation</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }

      .container {
        max-width: 600px;
        margin: 20px auto;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 0 20px rgba(0,0,0,0.1);
      }

      .header {
        background: linear-gradient(135deg, #059669, #047857);
        padding: 30px 20px;
        text-align: center;
      }

      .header h1 {
        color: white;
        font-size: 24px;
        margin-bottom: 10px;
      }

      .header p {
        color: white
      }

      .content {
        padding: 30px;
        background-color: #ffffff;
      }

      .highlight {
        background-color: #f0fdf4;
        border-left: 4px solid #10b981;
        padding: 20px;
        margin: 25px 0;
      }

      .footer {
        background-color: #f9fafb;
        padding: 20px;
        text-align: center;
        border-top: 1px solid #e5e7eb;
        color: #6b7280;
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Sijgeria Umesh Chandra Smriti Sangha</h1>
        <p>Account Reactivation Notification</p>
      </div>

      <div class="content">
        <h2>Dear ${userName},</h2>
        <p>We are pleased to inform you that your account has been reactivated!</p>

        <div class="highlight">
          <p><strong>Your access has been fully restored.</strong> You can now login and access all features of your account.</p>
        </div>

        <p>To access your account, please visit:</p>
        <a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; padding: 12px 30px; background: #059669; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 10px;">
          Login to Your Account
        </a>

        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
      </div>

      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Sijgeria Umesh Chandra Smriti Sangha. All rights reserved.</p>
        <p>Account Management Team</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

// Helper to send OTP email
const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"SUCSS Registration" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Verification Code',
      html: getEmailTemplate(otp)
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send OTP email');
  }
};

const sendMemberOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"SUCSS Membership" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Member Verification Code',
      html: getMemberEmailTemplate(otp)
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Member email send error:', error);
    throw new Error('Failed to send member OTP email');
  }
};

const sendMemberApprovedEmail = async (email, memberName) => {
  try {
    const mailOptions = {
      from: `"SUCSS Membership" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Membership Has Been Approved',
      html: getMemberApprovedTemplate(memberName)
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Member approval email error:', error);
  }
};

const sendMemberRejectedEmail = async (email, memberName, reason) => {
  try {
    const mailOptions = {
      from: `"SUCSS Membership" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Update on Your Membership Application',
      html: getMemberRejectedTemplate(memberName, reason)
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Member rejection email error:', error);
  }
};

const sendUserBlockedEmail = async (email, userName, reason) => {
  try {
    const mailOptions = {
      from: `"SUCSS Account Management" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Account Has Been Blocked',
      html: getUserBlockedTemplate(userName, reason)
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('User blocked email error:', error);
  }
};

const sendUserUnblockedEmail = async (email, userName) => {
  try {
    const mailOptions = {
      from: `"SUCSS Account Management" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Account Has Been Reactivated',
      html: getUserUnblockedTemplate(userName)
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('User unblocked email error:', error);
  }
};

// Escape regex characters for case-insensitive search
const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Admin authentication middleware
const adminAuthMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user is admin
    if (decoded.user && decoded.user.role === 'admin') {
      req.user = decoded.user;
      next();
    } else {
      return res.status(403).json({ message: 'Admin access required' });
    }
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

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

router.get('/member/me', memberAuthMiddleware, async (req, res) => {
  try {
    const member = await Member.findById(req.member.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Return only necessary data (exclude password)
    const memberData = {
      _id: member._id,
      memberId: member.memberId,
      fullName: member.fullName,
      email: member.email,
      phone: member.phone,
      designation: member.designation,
      status: member.status,
      createdAt: member.createdAt,
      approvedAt: member.approvedAt
    };

    res.json(memberData);
  } catch (error) {
    console.error('Error fetching member data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Generate OTP
    const otp = generateOTP();

    // Store in temporary collection
    await TempUser.findOneAndUpdate(
      { email },
      {
        email,
        otp,
        formData: req.body
      },
      { upsert: true, new: true }
    );

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('OTP send error:', error);
    res.status(500).json({
      message: 'Failed to send OTP',
      error: error.message
    });
  }
});

// Verify OTP and register
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find temp user
    const tempUser = await TempUser.findOne({ email });
    if (!tempUser) {
      return res.status(404).json({ message: 'OTP expired or invalid' });
    }

    // Verify OTP
    if (tempUser.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Extract form data
    const { username, fullName, mobile, address, password } = tempUser.formData;

    // Create new user
    const user = new User({
      username,
      fullName,
      mobile,
      email,
      address,
      password,
      role: 'user',
      isBlocked: false
    });

    await user.save();

    // Delete temp user
    await TempUser.deleteOne({ email });

    res.json({
      message: 'Registration successful',
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        message: `${field} already exists`,
        field
      });
    }

    res.status(500).json({
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Member Send OTP
router.post('/member/send-otp', async (req, res) => {
  try {
    const { email, memberId } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if member ID or email is already registered
    const existingMember = await Member.findOne({
      $or: [{ email }, { memberId }]
    });

    if (existingMember) {
      return res.status(409).json({
        message: existingMember.email === email ?
          'Email already registered' : 'Member ID already exists'
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Store in temporary collection
    await TempMember.findOneAndUpdate(
      { email },
      {
        email,
        memberId,
        otp,
        formData: req.body
      },
      { upsert: true, new: true }
    );

    // Send OTP email
    await sendMemberOTPEmail(email, otp);

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Member OTP send error:', error);
    res.status(500).json({
      message: 'Failed to send OTP',
      error: error.message
    });
  }
});

// Member Verify OTP
router.post('/member/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find temp member
    const tempMember = await TempMember.findOne({ email });
    if (!tempMember) {
      return res.status(404).json({ message: 'OTP expired or invalid' });
    }

    // Verify OTP
    if (tempMember.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Extract form data
    const { memberId, fullName, phone, designation, password } = tempMember.formData;

    // Create new member
    const member = new Member({
      memberId,
      fullName,
      phone,
      email,
      designation,
      password,
      status: 'pending' // Set to pending approval
    });

    await member.save();

    // Delete temp member
    await TempMember.deleteOne({ email });

    res.json({
      message: 'Registration successful. Account pending approval.',
      member: {
        id: member._id,
        email: member.email,
        memberId: member.memberId
      }
    });
  } catch (error) {
    console.error('Member OTP verification error:', error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        message: `${field} already exists`,
        field
      });
    }

    res.status(500).json({
      message: 'Registration failed',
      error: error.message
    });
  }
});

// User Login
router.post('/user/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Create case-insensitive regex
    const escapedUsername = escapeRegex(username);
    const usernameRegex = new RegExp(`^${escapedUsername}$`, 'i');

    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { username: { $regex: usernameRegex } },
        { email: { $regex: usernameRegex } }
      ]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({
        message: `Account blocked. Reason: ${user.blockReason || 'Contact administrator'}`,
        isBlocked: true
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    // Generate token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' },
      (err, token) => {
        if (err) {
          console.error('JWT error:', err);
          return res.status(500).json({ message: 'Error generating token' });
        }

        res.json({
          token,
          userData: {
            id: user._id,
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            isBlocked: user.isBlocked
          }
        });
      }
    );
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
});

// Member Login
router.post('/member/login', async (req, res) => {
  try {
    const { memberId, password } = req.body;

    // Validate input
    if (!memberId || !password) {
      return res.status(400).json({ message: 'Member ID and password are required' });
    }

    // Find member by ID
    const member = await Member.findOne({ memberId });
    if (!member) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if member is approved
    if (member.status !== 'approved') {
      return res.status(403).json({
        message: 'Account not approved. Please contact administrator.',
        status: member.status
      });
    }

    // Verify password
    const isMatch = await member.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT payload
    const payload = {
      member: {
        id: member.id,
        role: 'member'
      }
    };

    // Generate token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' },
      (err, token) => {
        if (err) {
          console.error('JWT error:', err);
          return res.status(500).json({ message: 'Error generating token' });
        }

        res.json({
          token,
          memberData: {
            id: member._id,
            memberId: member.memberId,
            fullName: member.fullName,
            email: member.email,
            designation: member.designation,
            status: member.status
          }
        });
      }
    );
  } catch (err) {
    console.error('Member login error:', err);
    res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
});

// ADMIN ROUTES (PROTECTED)
router.get('/admin/members/pending', adminAuthMiddleware, async (req, res) => {
  try {
    const pendingMembers = await Member.find({ status: 'pending' });
    res.json(pendingMembers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending members' });
  }
});

router.get('/admin/members/approved', adminAuthMiddleware, async (req, res) => {
  try {
    const approvedMembers = await Member.find({ status: 'approved' });
    res.json(approvedMembers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching approved members' });
  }
});

router.get('/public/members/approved', async (req, res) => {
  try {
    // Only fetch approved members with limited fields (exclude sensitive info)
    const approvedMembers = await Member.find(
      { status: 'approved' }
    );
    res.json(approvedMembers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching approved members' });
  }
});

router.get('/admin/members/rejected', adminAuthMiddleware, async (req, res) => {
  try {
    const rejectedMembers = await Member.find({ status: 'rejected' });
    res.json(rejectedMembers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rejected members' });
  }
});

router.post('/admin/members/:id/approve', adminAuthMiddleware, async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    member.status = 'approved';
    member.approvedAt = new Date();
    member.approvedBy = req.user.id;

    await member.save();

    // Send approval email
    await sendMemberApprovedEmail(member.email, member.fullName);

    res.json({ message: 'Member approved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error approving member' });
  }
});

// Reject Member
router.post('/admin/members/:id/reject', adminAuthMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ message: 'Reason is required' });

    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    member.status = 'rejected';
    member.rejectionReason = reason;
    member.rejectedAt = new Date();

    await member.save();

    // Send rejection email
    await sendMemberRejectedEmail(member.email, member.fullName, reason);

    res.json({ message: 'Member rejected successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting member' });
  }
});

router.get('/admin/users', adminAuthMiddleware, async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

router.post('/admin/users/:id/block', adminAuthMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ message: 'Reason is required' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isBlocked = true;
    user.blockReason = reason;
    await user.save();

    // Send blocked email
    await sendUserBlockedEmail(user.email, user.fullName, reason);

    res.json({ message: 'User blocked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error blocking user' });
  }
});

// Unblock User
router.post('/admin/users/:id/unblock', adminAuthMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isBlocked = false;
    user.blockReason = '';
    await user.save();

    // Send unblocked email
    await sendUserUnblockedEmail(user.email, user.fullName);

    res.json({ message: 'User unblocked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error unblocking user' });
  }
});

module.exports = router;
