const { Router } = require("express");
const { NotificationModel } = require("../models/notification.model");

const notificationRouter = Router();

// GET /notifications?userId=xxx — fetch all notifications for a user
notificationRouter.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: "userId query param is required" });
    const notifications = await NotificationModel.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /notifications — create a notification
notificationRouter.post("/", async (req, res) => {
  try {
    const { userId, message, type } = req.body;
    if (!userId || !message) {
      return res.status(400).json({ message: "userId and message are required" });
    }
    const notification = new NotificationModel({ userId, message, type: type || "info" });
    await notification.save();
    res.status(201).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /notifications/markallread — mark all as read for a user
// NOTE: this specific route must come BEFORE /:id/read to avoid conflict
notificationRouter.patch("/markallread", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required" });
    await NotificationModel.updateMany({ userId, read: false }, { $set: { read: true } });
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /notifications/:id/read — mark single notification as read
notificationRouter.patch("/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await NotificationModel.findByIdAndUpdate(
      id,
      { $set: { read: true } },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /notifications/:id — delete a notification
notificationRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await NotificationModel.findByIdAndDelete(id);
    res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = { notificationRouter };
