const User = require('../models/userModel');

exports.getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    res.json({ user });
  } catch (err) {
    console.error('getCurrentUser error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (err) {
    console.error('getAllUsers error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const { name, bio } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (bio) updates.bio = bio;
    if (req.fileUrl) updates.profilePicture = req.fileUrl;

    const updated = await User.findByIdAndUpdate(user._id, updates, { new: true }).select('-password');
    res.json({ user: updated });
  } catch (err) {
    console.error('updateProfile error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
