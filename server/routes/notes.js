const express = require("express");
const Note = require("../models/Note");
const auth = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(auth);

// ── GET ROUTES (Specific before generic) ─────────────────

// GET /api/notes/deleted — Get all soft-deleted notes
router.get("/deleted", async (req, res) => {
  try {
    console.log("Fetching deleted notes for userId:", req.user.userId);
    const notes = await Note.find({ userId: req.user.userId, isDeleted: true }).sort({ deletedAt: -1 });
    res.json(notes);
  } catch (error) {
    console.error("Get deleted notes error:", error);
    res.status(500).json({ message: "Server error fetching deleted notes" });
  }
});

// GET /api/notes — Get all non-deleted notes
router.get("/", async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.userId, isDeleted: false }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    console.error("Get notes error:", error);
    res.status(500).json({ message: "Server error fetching notes" });
  }
});

// ── POST ROUTES ──────────────────────────────────────────

// POST /api/notes — Create a new note
router.post("/", async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const note = await Note.create({
      userId: req.user.userId,
      title,
      content: content || "",
    });

    res.status(201).json(note);
  } catch (error) {
    console.error("Create note error:", error);
    res.status(500).json({ message: "Server error creating note" });
  }
});

// ── PATCH ROUTES (Specific before generic) ───────────────

// PATCH /api/notes/:id/lock — Toggle lock state
router.patch("/:id/lock", async (req, res) => {
  try {
    console.log("Lock route hit, noteId:", req.params.id);
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.userId });

    if (!note) {
      console.error("Note not found for lock toggle:", req.params.id);
      return res.status(404).json({ message: "Note not found" });
    }

    note.isLocked = !note.isLocked;
    note.lockedAt = note.isLocked ? new Date() : null;
    await note.save();

    res.json(note);
  } catch (error) {
    console.error("Toggle lock error:", error);
    res.status(500).json({ message: "Server error toggling lock" });
  }
});

// PATCH /api/notes/:id/restore — Restore a soft-deleted note
router.patch("/:id/restore", async (req, res) => {
  try {
    console.log("Restore route hit, noteId:", req.params.id);
    const note = await Note.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId,
      isDeleted: true 
    });

    if (!note) {
      console.error("Note not found in trash for restore:", req.params.id);
      return res.status(404).json({ message: "Note not found in trash" });
    }

    note.isDeleted = false;
    note.deletedAt = null;
    await note.save();

    res.json(note);
  } catch (error) {
    console.error("Restore note error:", error);
    res.status(500).json({ message: "Server error restoring note" });
  }
});

// ── DELETE ROUTES (Specific before generic) ──────────────

// DELETE /api/notes/:id/permanent — Permanently delete
router.delete("/:id/permanent", async (req, res) => {
  try {
    console.log("Permanent delete hit, noteId:", req.params.id);
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.userId });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    await note.deleteOne();
    res.json({ message: "Note permanently deleted" });
  } catch (error) {
    console.error("Permanent delete note error:", error);
    res.status(500).json({ message: "Server error permanently deleting note" });
  }
});

// DELETE /api/notes/:id — Soft delete
router.delete("/:id", async (req, res) => {
  try {
    console.log("Soft delete hit, noteId:", req.params.id);
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.userId });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    note.isDeleted = true;
    note.deletedAt = new Date();
    await note.save();

    res.json({ message: "Note moved to Recently Deleted" });
  } catch (error) {
    console.error("Soft delete note error:", error);
    res.status(500).json({ message: "Server error deleting note" });
  }
});

module.exports = router;
