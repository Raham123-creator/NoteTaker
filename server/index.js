require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");

const authRoutes = require("./routes/auth");
const googleRoutes = require("./routes/google");
const notesRoutes = require("./routes/notes");
const configurePassport = require("./config/passport");
const Note = require("./models/Note");

const app = express();
const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1);

// ── Middleware ──────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
    process.env.CLIENT_URL
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

// ── Session (required before Passport) ─────────────────
app.use(session({
  name: "notetaker.sid",
  secret: process.env.SESSION_SECRET || "notetaker_secret_2024",
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // http only on localhost
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: "lax",
  },
}));

// ── Passport (Google OAuth) ────────────────────────────
configurePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

// ── Routes ─────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/auth/google", googleRoutes);
app.use("/api/notes", notesRoutes);

// Health check
app.get("/", (_req, res) => {
  res.json({ message: "NoteTaker API is running" });
});

// ── Database + Server Start ────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);

      // ── Auto-cleanup: permanently delete notes older than 30 days ──
      const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
      async function cleanupOldDeletedNotes() {
        try {
          const cutoff = new Date(Date.now() - THIRTY_DAYS_MS);
          const result = await Note.deleteMany({
            isDeleted: true,
            deletedAt: { $lt: cutoff },
          });
          if (result.deletedCount > 0) {
            console.log(`🗑  Auto-cleanup: permanently removed ${result.deletedCount} note(s) older than 30 days.`);
          }
        } catch (err) {
          console.error("Auto-cleanup error:", err.message);
        }
      }
      cleanupOldDeletedNotes(); // run once on startup
      setInterval(cleanupOldDeletedNotes, 24 * 60 * 60 * 1000); // then every 24h
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`\n❌ Port ${PORT} is already in use.`);
        console.error(`   Kill the existing process and try again:`);
        console.error(`   1. Run: & "$env:SystemRoot\\System32\\NETSTAT.EXE" -ano | Select-String ":${PORT}"`);
        console.error(`   2. Find the PID, then run: Stop-Process -Id <PID> -Force`);
        console.error(`   3. Run: npm start\n`);
      } else {
        console.error("❌ Server error:", err.message);
      }
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
