const { Router } = require("express");
const UserModel = require("../models/usermodel");
const bcrypt = require("bcrypt");

const userRouter = Router();

// POST /user/register — create a new user with email/password
userRouter.post("/register", async (req, res) => {
  try {
    const { name, email, password, gender, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    const existing = await UserModel.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = new UserModel({
      name,
      email,
      password: hash,
      gender: gender || "Not Assigned",
      phone: phone || 0,
      verified: false,
    });
    await user.save();
    res.status(201).json({
      message: "Registration successful",
      userId: user._id,
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /user/login — login with email and password
userRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }
    // Return user without password
    const { password: _pw, ...userSafe } = user.toObject();
    res.json({ message: "Login successful", userId: user._id, user: userSafe });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /user/update/:id — update user profile
userRouter.patch("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, gender, phone } = req.body;

    const updateData = {};
    if (name !== undefined && name !== "") updateData.name = name;
    if (email !== undefined && email !== "") updateData.email = email;
    if (gender !== undefined && gender !== "") updateData.gender = gender;
    if (phone !== undefined && phone !== "") updateData.phone = Number(phone);
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /user/:id — get user by id
userRouter.get("/:id", async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = { userRouter };
