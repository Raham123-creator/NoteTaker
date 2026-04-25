const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

module.exports = function configurePassport(passport) {
  // Debug: verify credentials are loaded
  console.log("🔑 GOOGLE_CLIENT_ID loaded:", !!process.env.GOOGLE_CLIENT_ID);
  console.log("🔑 GOOGLE_CLIENT_SECRET loaded:", !!process.env.GOOGLE_CLIENT_SECRET);

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error("❌ Missing Google OAuth credentials! Check your .env file.");
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:5000/api/auth/google/callback",
        proxy: true,
        state: false,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;

          if (!email) {
            return done(null, false, { message: "Could not retrieve email from Google" });
          }

          // Check if user exists by googleId
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // Update profile photo if changed
            if (profile.photos?.[0]?.value && user.profilePhoto !== profile.photos[0].value) {
              user.profilePhoto = profile.photos[0].value;
              await user.save();
            }
            return done(null, user);
          }

          // Check if user exists with same email (manual signup) — link accounts
          user = await User.findOne({ email: email.toLowerCase() });

          if (user) {
            user.googleId = profile.id;
            user.profilePhoto = profile.photos?.[0]?.value || user.profilePhoto;
            user.authProvider = user.authProvider === "local" ? "local" : "google";
            await user.save();
            return done(null, user);
          }

          // Create new user from Google profile
          const displayName = profile.displayName || email.split("@")[0];
          // Generate a unique username from email
          let baseUsername = email.split("@")[0];
          let username = baseUsername;
          let counter = 1;
          while (await User.findOne({ username: { $regex: new RegExp(`^${username}$`, "i") } })) {
            username = `${baseUsername}${counter}`;
            counter++;
          }

          user = await User.create({
            fullName: displayName,
            username,
            email: email.toLowerCase(),
            googleId: profile.id,
            profilePhoto: profile.photos?.[0]?.value || null,
            authProvider: "google",
            password: null,
          });

          return done(null, user);
        } catch (error) {
          console.error("Google OAuth error:", error);
          return done(error, null);
        }
      }
    )
  );

  // Serialize/Deserialize (only used during OAuth callback flow)
  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};
