const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Handle Sandbox Guest session
      if (token === 'sandbox_jwt_session_token_xyz') {
        let guestUser = await User.findOne({ email: 'guest@hiremind.ai' });
        if (!guestUser) {
          guestUser = await User.create({
            name: 'Guest Innovator',
            email: 'guest@hiremind.ai',
            password: 'mock_password_sandbox_123',
            plan: 'free',
            usage: {
              resumesAnalyzed: 1,
              interviewsConducted: 1,
              roadmapsGenerated: 1,
            }
          });
        }
        req.user = guestUser;
        return next();
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hiremind_jwt_secret_key');

      // Get user from the token, exclude password
      req.user = await User.findById(decoded.id);
      
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
