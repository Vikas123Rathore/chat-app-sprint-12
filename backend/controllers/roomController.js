const Room = require('../models/roomModel');
const User = require('../models/userModel');

exports.createRoom = async (req, res) => {
  try {
    const { name, description, type } = req.body;
    if (!name) return res.status(400).json({ message: 'Room name is required' });

    // ensure unique name
    const existing = await Room.findOne({ name });
    if (existing) return res.status(400).json({ message: 'Room name already exists' });

    const image = req.fileUrl || '';
    const room = await Room.create({ name, description, type: type || 'personal', image, createdBy: req.user._id, members: [req.user._id] });
    // emit room created event
    const io = req.app.get('io');
    if (io) io.emit('roomCreated', room);
    res.status(201).json({ room });
  } catch (err) {
    console.error('createRoom error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate('createdBy', 'name profilePicture').lean();
    // add memberCount
    const enhanced = rooms.map((r) => ({ ...r, memberCount: (r.members && r.members.length) || 0 }));
    res.json({ rooms: enhanced });
  } catch (err) {
    console.error('getAllRooms error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId).populate('createdBy', 'name profilePicture').lean();
    if (!room) return res.status(404).json({ message: 'Room not found' });
    room.memberCount = (room.members && room.members.length) || 0;
    res.json({ room });
  } catch (err) {
    console.error('getRoom error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const userId = req.user._id;
    if (!room.members.includes(userId)) {
      room.members.push(userId);
      await room.save();
    }

    res.json({ room });
  } catch (err) {
    console.error('joinRoom error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    // only creator can delete
    if (room.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only creator can delete this room' });
    }

    await Room.findByIdAndDelete(roomId);
    res.json({ message: 'Room deleted' });
  } catch (err) {
    console.error('deleteRoom error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
