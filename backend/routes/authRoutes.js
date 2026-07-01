const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const Like = require("../models/Like");
const Match = require("../models/Match");

const router = express.Router();

// REGISTER — unchanged
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, age, gender, bio } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, age, gender, bio });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// LOGIN — unchanged
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET ME — unchanged
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE PROFILE — profileImage add kela ← UPDATED
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, age, bio, gender, profileImage } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user,
      { name, age, bio, gender, profileImage }, // ← profileImage add
      { new: true }
    ).select("-password");
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET USERS — authMiddleware add kela to exclude self ← UPDATED
router.get("/users", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user } }).select("-password"); // ← $ne: self exclude
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// LIKE + MATCH — unchanged
router.post("/like", async (req, res) => {
  try {
    const { likedBy, likedTo } = req.body;
    const newLike = new Like({ likedBy, likedTo });
    await newLike.save();

    const mutualLike = await Like.findOne({ likedBy: likedTo, likedTo: likedBy });
    if (mutualLike) {
      const existingMatch = await Match.findOne({ users: { $all: [likedBy, likedTo] } });
      if (!existingMatch) await new Match({ users: [likedBy, likedTo] }).save();
      return res.status(201).json({ message: "It's a Match! 💕", matched: true });
    }

    res.status(201).json({ message: "Like saved successfully", matched: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET MATCHES — unchanged
router.get("/matches", authMiddleware, async (req, res) => {
  try {
    const matches = await Match.find({ users: req.user }).populate("users", "-password");
    const result = matches.map((match) =>
      match.users.find((u) => u._id.toString() !== req.user.toString())
    );
    res.status(200).json(result.filter((u) => u !== null));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;