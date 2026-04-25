const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = express.Router();

// GET /api/auth/google — Initiate Google OAuth flow
// NOTE: Do NOT use session:false here — Passport needs the session to store
// the OAuth 'state' nonce between this redirect and the callback.
router.get(
  "/",
  passport.authenticate("google", { 
    scope: ["profile", "email"],
    prompt: "select_account" 
  })
);

// GET /api/auth/google/callback — Google OAuth callback
// Using custom callback to properly capture and log errors
router.get("/callback", (req, res, next) => {
  console.log("📥 Google Callback received. Query params:", req.query);
  
  passport.authenticate("google", (err, user, info) => {
    const clientURL = process.env.CLIENT_URL || "http://localhost:5173";

    if (err) {
      console.error("❌ Passport Auth Error:", err);
      return res.redirect(`${clientURL}/signin?error=${encodeURIComponent(err.message || "Auth Error")}`);
    }

    if (!user) {
      console.warn("⚠️ No user returned from Google. Info:", info);
      const msg = info?.message || "Google Authentication failed";
      return res.redirect(`${clientURL}/signin?error=${encodeURIComponent(msg)}`);
    }

    console.log("✅ OAuth success for user:", user.email);

    // Generate JWT with same payload structure as manual signup
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePhoto: user.profilePhoto || null,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Redirect to frontend callback page with token and user data
    res.redirect(`${clientURL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      profilePhoto: user.profilePhoto,
    }))}`);
  })(req, res, next);
});

module.exports = router;
