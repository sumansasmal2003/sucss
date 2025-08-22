const jwt = require('jsonwebtoken');
const Member = require('../models/Member');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key-for-development';

const memberAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.member && decoded.member.id) {
      const member = await Member.findById(decoded.member.id).select('-password');

      if (!member) {
        return res.status(401).json({
          success: false,
          message: 'Token is not valid. Member not found.'
        });
      }

      if (member.status !== 'approved') {
        return res.status(401).json({
          success: false,
          message: 'Account is not approved or has been suspended.'
        });
      }

      req.memberId = member._id;
      req.member = member;
      return next();
    }

    if (decoded.user && decoded.user.id) {
      const user = await User.findById(decoded.user.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is not valid. User not found.'
        });
      }

      if (user.isBlocked) {
        return res.status(401).json({
          success: false,
          message: 'Account has been blocked.'
        });
      }

      req.userId = user._id;
      req.user = user;
      return next();
    }

    return res.status(401).json({
      success: false,
      message: 'Token is not valid.'
    });
  } catch (error) {
    console.error('Auth middleware error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error in authentication.'
    });
  }
};

const userAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded.user || !decoded.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid for user access.'
      });
    }

    const user = await User.findById(decoded.user.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid. User not found.'
      });
    }

    if (user.isBlocked) {
      return res.status(401).json({
        success: false,
        message: 'Account has been blocked.'
      });
    }

    req.userId = user._id;
    req.user = user;
    next();
  } catch (error) {
    console.error('User auth middleware error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error in authentication.'
    });
  }
};

const strictMemberAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded.member || !decoded.member.id) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid for member access.'
      });
    }

    const member = await Member.findById(decoded.member.id).select('-password');

    if (!member) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid. Member not found.'
        });
    }

    if (member.status !== 'approved') {
      return res.status(401).json({
        success: false,
        message: 'Account is not approved or has been suspended.'
      });
    }

    req.memberId = member._id;
    req.member = member;
    next();
  } catch (error) {
    console.error('Member auth middleware error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error in authentication.'
    });
  }
};

module.exports = {
  memberAuth,
  userAuth,
  strictMemberAuth,
  JWT_SECRET
};
