require("dotenv").config(); // MUST BE FIRST — before any other require

const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");
const connectDB = require("./confgs/db");
const passport = require("./confgs/google");
const UserModel = require("./models/usermodel");
const GoogleRouter = require("./router/google.auth");
const { postRouter } = require("./router/post.router");
const { notificationRouter } = require("./router/notification.router");
const { userRouter } = require("./router/user.router");

const app = express();
const PORT = process.env.PORT || 8080;
const FRONTEND_URL = process.env.FRONTEND_CALLBACK_URL || "http://localhost:3000";

// =============> MIDDLEWARES (order matters)
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);
app.use(express.json());
app.use(
  cookieSession({
    name: "google-auth-session",
    keys: ["fitfusion-key1", "fitfusion-key2"],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);
app.use(passport.initialize());
app.use(passport.session());

// =============> ROUTES
app.get("/", (req, res) => res.send({ message: "Welcome to FitFusion API" }));

// ℹ️  /test-insert route removed — Atlas connection confirmed working

// Get user by ID (used by frontend SideBar)
app.get("/getuser", async (req, res) => {
  const userId = req.query.userID;
  try {
    if (!userId) return res.status(400).json({ message: "userID query param is required" });
    const data = await UserModel.findById(userId).select("-password");
    if (!data) return res.status(404).json({ message: "User not found" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.use("/posts", postRouter);
app.use("/notifications", notificationRouter);
app.use("/user", userRouter);
app.use("/auth", GoogleRouter);

// =============> Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

// ==============> START SERVER
const startServer = async () => {
  await connectDB(); // Connect to MongoDB Atlas first
  app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
  });
};

startServer();
