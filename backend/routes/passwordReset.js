const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendPasswordResetOTP } = require('../utils/emailService');
const { sendPasswordResetSuccessEmail } = require('../utils/emailService');
const router = express.Router();

// Request OTP
router.post('/request-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    // For security, don't reveal whether email exists
    if (!user) {
      return res.status(200).json({ message: 'If an account with that email exists, an OTP has been sent.' });
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    user.resetPasswordTempToken = null;
    await user.save();
    await sendPasswordResetOTP(user.email, otp);
    res.json({ message: 'OTP sent to your email.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }
    const tempToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordTempToken = tempToken;
    await user.save();
    res.json({ message: 'OTP verified', tempToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password – prevent using the same password
router.post('/reset-password', async (req, res) => {
  try {
    const { tempToken, newPassword } = req.body;
    if (!tempToken) {
      return res.status(400).json({ message: 'Missing token. Please restart the process.' });
    }
    const user = await User.findOne({ resetPasswordTempToken: tempToken });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token. Please restart the process.' });
    }
    // Check if new password is same as current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: 'New password must be different from the current password.' });
    }
    // Set plain password – pre('save') middleware will hash it automatically
    user.password = newPassword;
    user.resetPasswordOTP = null;
    user.resetPasswordExpires = null;
    user.resetPasswordTempToken = null;
    await user.save();
    res.json({ message: 'Password reset successfully. Please login.' });
    // Send success email (fire and forget)
    sendPasswordResetSuccessEmail(user.name, user.email)
      .catch(err => console.error('Password reset success email failed:', err));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;