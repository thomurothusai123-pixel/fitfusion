const express = require("express");
const GoogleRouter = express.Router();
const passport = require("../confgs/google");
const bcrypt = require("bcrypt");
const UserModel = require("../models/usermodel");
const { NotificationModel } = require("../models/notification.model"); // Added
require("dotenv").config();

const FRONTEND_CALLBACK_URL = process.env.FRONTEND_CALLBACK_URL || "http://localhost:3000";
const RedirectHome = `${FRONTEND_CALLBACK_URL}/home`;
const RedirectRoot = `${FRONTEND_CALLBACK_URL}`;

// =============> Initiate Google OAuth
GoogleRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// =============> Google OAuth Callback
GoogleRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "/auth/login/success",
    failureRedirect: "/auth/login/failed",
  })
);

// =============> Login Success — save/find user, redirect to frontend
GoogleRouter.get("/login/success", async (req, res) => {
  if (!req.user) {
    return res.redirect(`${RedirectRoot}?authsuccess=false`);
  }
  const payload = req.user;
  const userDetails = {
    name: payload.displayName,
    email: payload.emails[0].value,
    gender: "Not Assigned",
    phone: 0,
    password: payload.emails[0].value,
    img: payload.photos[0].value,
    verified: true,
  };
  console.log("Google Auth Accessed by " + userDetails.email);
  try {
    const existing = await UserModel.find({ email: userDetails.email });
    if (existing.length !== 0) {
      const id = existing[0]._id;
      return res.redirect(`${RedirectHome}?authsuccess=true&userID=${id}`);
    }
    // New user — hash and save
    bcrypt.hash(userDetails.email, 10, async (err, hash) => {
      if (err) return res.redirect(`${RedirectRoot}?authsuccess=false`);
      userDetails.password = hash;
      const instance = new UserModel(userDetails);
      await instance.save();

      // NEW: Add a welcome notification for the new user
      const welcomeMessage = new NotificationModel({
        userId: instance._id,
        message: "Welcome to FitFusion! Ready to transform your life? Check out our dashboard of features to get started.",
        type: "success"
      });
      await welcomeMessage.save();

      res.redirect(`${RedirectHome}?authsuccess=true&userID=${instance._id}`);
    });
  } catch (error) {
    console.error(error);
    res.redirect(`${RedirectRoot}?authsuccess=false`);
  }
});

// =============> Login Failed
GoogleRouter.get("/login/failed", (req, res) => {
  res.redirect(`${RedirectRoot}?authsuccess=false`);
});

// =============> Logout — passport v0.6+ requires callback
GoogleRouter.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    res.redirect(RedirectRoot);
  });
});

module.exports = GoogleRouter;
