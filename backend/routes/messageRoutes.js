const express = require("express");
const Message = require("../models/Message");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Send message
router.post("/send", authMiddleware, async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const msg = new Message({ senderId: req.user, receiverId, text });
    await msg.save();
    res.status(201).json(msg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── IMPORTANT: /unread/counts MUST be before /:userId ────────
// otherwise Express matches "unread" as userId param
router.get("/unread/counts", authMiddleware, async (req, res) => {
  try {
    const counts = await Message.aggregate([
      {
        $match: {
          receiverId: require("mongoose").Types.ObjectId.createFromHexString
            ? require("mongoose").Types.ObjectId.createFromHexString(req.user.toString())
            : new (require("mongoose").Types.ObjectId)(req.user),
          read: false,
        },
      },
      { $group: { _id: "$senderId", count: { $sum: 1 } } },
    ]);

    const result = {};
    counts.forEach((c) => {
      result[c._id.toString()] = c.count;
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark messages as read
router.put("/read/:senderId", authMiddleware, async (req, res) => {
  try {
    await Message.updateMany(
      { senderId: req.params.senderId, receiverId: req.user, read: false },
      { read: true }
    );
    res.status(200).json({ message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get conversation — /:userId MUST be last
router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.user, receiverId: req.params.userId },
        { senderId: req.params.userId, receiverId: req.user },
      ],
    }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;