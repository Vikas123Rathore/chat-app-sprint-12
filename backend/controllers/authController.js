const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '7d',
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashed });

    const token = createToken(user._id);
    // set cookie with explicit maxAge to persist across browser sessions
    // token expiry is 7 days (see createToken). maxAge is in milliseconds.
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge,
      // expires is optional but explicit
      expires: new Date(Date.now() + maxAge),
    });

    const { password: _p, ...userData } = user.toObject();
    res.status(201).json({ user: userData });
  } catch (err) {
    console.error('Register error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing credentials' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // set online status
    user.isOnline = true;
    await user.save();

    const token = createToken(user._id);
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge,
      expires: new Date(Date.now() + maxAge),
    });

    const { password: _p, ...userData } = user.toObject();
    res.json({ user: userData });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      if (decoded && decoded.id) {
        await User.findByIdAndUpdate(decoded.id, { isOnline: false, lastSeen: new Date() });
      }
    }

    res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
    res.json({ message: 'Logged out' });
  } catch (err) {
    console.error('Logout error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
