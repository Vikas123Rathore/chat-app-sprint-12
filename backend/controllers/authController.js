// const User = require('../models/userModel');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// const createToken = (userId) => {
//   return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'secret', {
//     expiresIn: '7d',
//   });
// };

// exports.register = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     if (!name || !email || !password) {
//       return res.status(400).json({ message: 'All fields are required' });
//     }

//     const existing = await User.findOne({ email });
//     if (existing) return res.status(400).json({ message: 'Email already in use' });

//     const salt = await bcrypt.genSalt(10);
//     const hashed = await bcrypt.hash(password, salt);

//     const user = await User.create({ name, email, password: hashed });

//     const token = createToken(user._id);
//     // set cookie with explicit maxAge to persist across browser sessions
//     // token expiry is 7 days (see createToken). maxAge is in milliseconds.
//     const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
//     // Use SameSite 'lax' which works for same-origin dev proxy setups.
//     // Do not set SameSite=None unless you also set Secure and serve over HTTPS.
//     const sameSite = 'lax'
//     const secure = process.env.NODE_ENV === 'production'
//     res.cookie('token', token, {
//       httpOnly: true,
//       sameSite,
//       secure,
//       maxAge,
//       expires: new Date(Date.now() + maxAge),
//       path: '/',
//     });

//     const { password: _p, ...userData } = user.toObject();
//     res.status(201).json({ user: userData });
//   } catch (err) {
//     console.error('Register error', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) return res.status(400).json({ message: 'Missing credentials' });

//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: 'Invalid credentials' });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

//     // set online status
//     user.isOnline = true;
//     await user.save();

//     const token = createToken(user._id);
//     const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
//     const sameSite = process.env.NODE_ENV === 'production' ? 'lax' : 'none'
//     const secure = process.env.NODE_ENV === 'production'
//     res.cookie('token', token, {
//       httpOnly: true,
//       sameSite,
//       secure,
//       maxAge,
//       expires: new Date(Date.now() + maxAge),
//       path: '/',
//     });

//     const { password: _p, ...userData } = user.toObject();
//     res.json({ user: userData });
//   } catch (err) {
//     console.error('Login error', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// exports.logout = async (req, res) => {
//   try {
//     const token = req.cookies.token;
//     if (token) {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
//       if (decoded && decoded.id) {
//         await User.findByIdAndUpdate(decoded.id, { isOnline: false, lastSeen: new Date() });
//       }
//     }

//     res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
//     res.json({ message: 'Logged out' });
//   } catch (err) {
//     console.error('Logout error', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// ==========================================
// CREATE TOKEN
// ==========================================

const createToken = (userId) => {
  return jwt.sign(
    {
      id: userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};


// ==========================================
// COOKIE OPTIONS
// ==========================================

const cookieOptions = {
  httpOnly: true,

  // Development:
  // localhost frontend + localhost backend
  //
  // Production:
  // Vercel frontend + Render backend
  sameSite:
    process.env.NODE_ENV === "production"
      ? "none"
      : "lax",

  secure:
    process.env.NODE_ENV === "production",

  maxAge: 7 * 24 * 60 * 60 * 1000,

  path: "/",
};


// ==========================================
// REGISTER
// ==========================================

exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(
      password,
      salt
    );

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      isOnline: true,
    });

    // Generate JWT
    const token = createToken(user._id);

    // Set cookie
    res.cookie(
      "token",
      token,
      cookieOptions
    );

    // Remove password
    const {
      password: _password,
      ...userData
    } = user.toObject();

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: userData,
    });

  } catch (error) {

    console.error(
      "Register error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ==========================================
// LOGIN
// ==========================================

exports.login = async (req, res) => {
  try {

    const {
      email,
      password,
    } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Online status
    user.isOnline = true;
    user.lastSeen = null;

    await user.save();

    // Generate token
    const token = createToken(user._id);

    // Set cookie
    res.cookie(
      "token",
      token,
      cookieOptions
    );

    // Remove password
    const {
      password: _password,
      ...userData
    } = user.toObject();

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: userData,
    });

  } catch (error) {

    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ==========================================
// LOGOUT
// ==========================================

exports.logout = async (req, res) => {
  try {

    const token = req.cookies.token;

    if (token) {

      try {

        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET
        );

        if (decoded?.id) {

          await User.findByIdAndUpdate(
            decoded.id,
            {
              isOnline: false,
              lastSeen: new Date(),
            }
          );

        }

      } catch (tokenError) {

        console.log(
          "Token verification error:",
          tokenError.message
        );

      }
    }

    // IMPORTANT:
    // Same cookie options should be used
    // when clearing the cookie.
    res.clearCookie(
      "token",
      {
        httpOnly: true,
        sameSite:
          process.env.NODE_ENV === "production"
            ? "none"
            : "lax",
        secure:
          process.env.NODE_ENV === "production",
        path: "/",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });

  } catch (error) {

    console.error(
      "Logout error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};
