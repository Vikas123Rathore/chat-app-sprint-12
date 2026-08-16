const Message = require('../models/messageModel');
const Room = require('../models/roomModel');

exports.sendMessage = async (req, res) => {
  try {
    const { room: roomId, text } = req.body;
    if (!roomId) return res.status(400).json({ message: 'room is required' });

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const image = req.fileUrl || '';
    const message = await Message.create({ room: roomId, sender: req.user._id, text: text || '', image });

    const populated = await message.populate('sender', 'name profilePicture');
    // emit via socket if available
    const io = req.app.get('io');
    if (io) io.to(roomId).emit('newMessage', populated);
    res.status(201).json({ message: populated });
  } catch (err) {
    console.error('sendMessage error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMessagesByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ room: roomId }).sort({ createdAt: 1 }).populate('sender', 'name profilePicture');
    res.json({ messages });
  } catch (err) {
    console.error('getMessagesByRoom error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ message: 'Message not found' });

    // only sender can delete
    if (msg.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    await Message.findByIdAndDelete(messageId);
    res.json({ message: 'Message deleted' });
  } catch (err) {
    console.error('deleteMessage error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
