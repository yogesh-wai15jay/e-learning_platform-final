const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendWelcomeEmail, sendNewUserNotification } = require('../utils/emailService');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({ email, password, name });
    await user.save();

    // Send welcome email to the new user (don't wait for response)
    sendWelcomeEmail(name, email).catch(err => console.error('Welcome email failed:', err));

    // Send notification to additional recipients
    sendNewUserNotification(name, email, user.createdAt).catch(err => console.error('Notification email failed:', err));

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login with role validation (updated)
router.post('/login', async (req, res) => {
  try {
    const { email, password, requestedRole } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // --- Updated role validation ---
    if (requestedRole) {
      const isAllowed = (actualRole, requested) => {
        if (actualRole === requested) return true;
        // Allow authors to act as regular users
        if (actualRole === 'author' && requested === 'user') return true;
        // Allow admins to act as any role
        if (actualRole === 'admin') return true;
        return false;
      };
      if (!isAllowed(user.role, requestedRole)) {
        return res.status(403).json({
          message: `Please login as a ${user.role}.`
        });
      }
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;