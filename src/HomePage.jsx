import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import AddNote from "./AddNote"
import Locked from "./Locked"
import NoteCard from "./NoteCard"
import NoteDetailModal from "./NoteDetailModal"
import RecentlyDeleted from "./RecentlyDeleted"
import API from "./api/axios"
import { useAuth } from "./context/AuthContext"

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function highlightText(text, query) {
  const normalizedQuery = query.trim()
  if (!normalizedQuery) return text

  const pattern = new RegExp(`(${escapeRegExp(normalizedQuery)})`, "ig")
  return String(text).split(pattern).map((piece, index) =>
    index % 2 === 1 ? (
      <mark key={`${piece}-${index}`} className="rounded-[3px] bg-[#FFE066] px-[2px]">{piece}</mark>
    ) : piece
  )
}

function NotesIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" style={{ color: "#6b7280" }}>
      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
        d="M5 4.75h14a1.25 1.25 0 0 1 1.25 1.25v12A1.25 1.25 0 0 1 19 19.25H5A1.25 1.25 0 0 1 3.75 18V6A1.25 1.25 0 0 1 5 4.75Zm3 4.25h8m-8 4h5" />
    </svg>
  )
}

function NotesPanelIcon({ type }) {
  const iconProps = { viewBox: "0 0 24 24", "aria-hidden": "true", className: "h-6 w-6", style: { color: "#6b7280" } }
  const pathProps = { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.8" }

  if (type === "all") return <svg {...iconProps}><path {...pathProps} d="M5.5 4.75h13A1.75 1.75 0 0 1 20.25 6.5v11A1.75 1.75 0 0 1 18.5 19.25h-13A1.75 1.75 0 0 1 3.75 17.5v-11A1.75 1.75 0 0 1 5.5 4.75Zm3 3.75h5m-5 4h2" /></svg>
  if (type === "notes") return <svg {...iconProps}><path {...pathProps} d="M12 4.75 6.5 7.5v9L12 19.25l5.5-2.75v-9L12 4.75Zm0 0v14.5m-5.5-11 5.5 2.75 5.5-2.75" /></svg>
  if (type === "locked") return <svg {...iconProps}><path {...pathProps} d="M7.5 11V8.5a4.5 4.5 0 1 1 9 0V11m-10.5 0h12A1.75 1.75 0 0 1 19.75 12.75v5.5A1.75 1.75 0 0 1 18 20H6A1.75 1.75 0 0 1 4.25 18.25v-5.5A1.75 1.75 0 0 1 6 11Zm4.5 3.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" /></svg>
  return <svg {...iconProps}><path {...pathProps} d="M6.5 4.75h11l1.75 2.5v11.5A1.5 1.5 0 0 1 17.75 20.25h-11A1.5 1.5 0 0 1 5.25 18.75V7.25l1.25-2.5Zm2.25 0V2.75m6 2V2.75M7.75 13.5h8.5" /></svg>
}

function FolderPlaceholderIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-16 w-16" style={{ color: "#d1d5db" }}>
      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6"
        d="M5.5 6.5h5l1.75 2H18.5A1.5 1.5 0 0 1 20 10v7.5A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-10A1 1 0 0 1 5 6.5h.5Z" />
    </svg>
  )
}

// Avatar component with profile photo or initial fallback
function UserAvatar({ user }) {
  if (user?.profilePhoto) {
    return (
      <img
        src={user.profilePhoto}
        alt={user.username}
        className="rounded-full object-cover"
        style={{ width: 32, height: 32 }}
        referrerPolicy="no-referrer"
      />
    )
  }

  const initial = (user?.username || "U")[0].toUpperCase()
  return (
    <div
      className="flex items-center justify-center rounded-full text-white text-sm font-bold"
      style={{ width: 32, height: 32, background: "#4F6EF7" }}
    >
      {initial}
    </div>
  )
}

function HomePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [notesOpen, setNotesOpen] = useState(false)
  const notesMenuRef = useRef(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentView, setCurrentView] = useState("notes")
  const [notes, setNotes] = useState([])
  const [deletedNotes, setDeletedNotes] = useState([])
  const [selectedNote, setSelectedNote] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const normalizedSearchQuery = searchQuery.trim().toLowerCase()

  // Derive locked/unlocked from notes array (isLocked field from DB)
  const unlockedNotes = notes.filter(n => !n.isLocked)
  const lockedNotes = notes.filter(n => n.isLocked)
  const totalNotesCount = notes.length // active notes only (locked + unlocked)

  // Fetch all data on mount
  useEffect(() => {
    async function fetchAllData() {
      try {
        setIsLoading(true)
        const [notesRes, deletedRes] = await Promise.all([
          API.get("/api/notes"),
          API.get("/api/notes/deleted")
        ])
        
        // We use _id directly to avoid mapping issues
        setNotes(notesRes.data)
        setDeletedNotes(deletedRes.data)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAllData()
  }, [])

  function getVisibleNotes() {
    if (currentView === "deleted") return deletedNotes
    if (currentView === "locked") return lockedNotes
    if (currentView === "all") return notes
    return unlockedNotes
  }

  const visibleNotes = getVisibleNotes()
  const displayedNotes = normalizedSearchQuery
    ? visibleNotes.filter((note) => (note.title || "").toLowerCase().includes(normalizedSearchQuery))
    : visibleNotes
  const noResultsFound = Boolean(normalizedSearchQuery) && displayedNotes.length === 0
  const highlightTitle = (text) => highlightText(text, searchQuery)

  useEffect(() => {
    function handlePointerDown(event) {
      if (!notesMenuRef.current) return
      if (!notesMenuRef.current.contains(event.target)) setNotesOpen(false)
    }
    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("touchstart", handlePointerDown)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("touchstart", handlePointerDown)
    }
  }, [])

  const noteMenuItems = [
    { key: "all", label: "All", count: totalNotesCount, view: "all" },
    { key: "notes", label: "Notes", count: unlockedNotes.length, view: "notes" },
    { key: "locked", label: "Locked", count: lockedNotes.length, view: "locked" },
    { key: "deleted", label: "Recently Deleted", count: deletedNotes.length, view: "deleted" },
  ]

  // Create note via API
  async function handleSaveNote(note) {
    try {
      const res = await API.post("/api/notes", {
        title: note.title,
        content: note.description,
      })
      setNotes((prev) => [res.data, ...prev])
      setCurrentView("notes")
    } catch (error) {
      console.error("Failed to create note:", error)
    }
  }

  // Delete note via API (soft delete)
  async function handleDeleteNote(noteId) {
    console.log("Soft deleting note:", noteId);
    const noteToDelete = notes.find((n) => n._id === noteId)
    if (!noteToDelete) return

    try {
      await API.delete(`/api/notes/${noteId}`)
      setNotes((prev) => prev.filter((n) => n._id !== noteId))
      setDeletedNotes((prev) => [{ ...noteToDelete, isDeleted: true }, ...prev])
      if (selectedNote?._id === noteId) setSelectedNote(null)
    } catch (error) {
      console.error("Failed to delete note:", error)
    }
  }

  // BUG 1 FIX: Toggle lock via API — persists to MongoDB
  async function handleLockNote(noteId) {
    console.log('Lock button clicked for note:', noteId);
    try {
      const res = await API.patch(`/api/notes/${noteId}/lock`)
      console.log('Lock toggle success, new state:', res.data.isLocked);
      
      setNotes((prev) =>
        prev.map((n) =>
          n._id === noteId
            ? { ...n, isLocked: res.data.isLocked }
            : n
        )
      )
      if (selectedNote?._id === noteId) setSelectedNote(null)
    } catch (error) {
      console.error("Lock toggle failed:", error)
    }
  }

  // Restore note via API
  async function handleRestoreNote(noteId) {
    console.log('Restore clicked for:', noteId);
    try {
      const res = await API.patch(`/api/notes/${noteId}/restore`)
      console.log('Restore success, returned note:', res.data);
      
      // Remove from deletedNotes state
      setDeletedNotes(prev => prev.filter(n => n._id !== noteId))
      
      // Add back to main notes state
      setNotes(prev => [res.data, ...prev])
      
      // Switch view back to 'all' (main notes section)
      setCurrentView("all")
      
      // Redirect using React Router to ensure clean state/URL
      navigate("/notes")

      // Show success message
      showToast("Note restored successfully!", "success")
    } catch (error) {
      console.error("Restore failed:", error)
      showToast("Failed to restore note. Please try again.", "error")
    }
  }

  function showToast(message, type = "success") {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function handlePermanentDeleteNote(noteId) {
    console.log('Permanent delete clicked for:', noteId);
    try {
      await API.delete(`/api/notes/${noteId}/permanent`)
      setDeletedNotes(prev => prev.filter(n => n._id !== noteId))
    } catch (error) {
      console.error("Failed to permanently delete note:", error)
    }
  }

  function handleViewChange(view) {
    setCurrentView(view)
    setNotesOpen(false)
  }

  function handleOpenNote(note) {
    setSelectedNote(note)
  }

  function handleSearchSubmit() {
    if (!normalizedSearchQuery) return
    const firstMatch = displayedNotes[0]
    setSelectedNote(firstMatch || null)
  }

  function handleSearchKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault()
      handleSearchSubmit()
    }
  }

  function handleLogout() {
    logout()
    navigate("/signin")
  }

  return (
    <>
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4" style={{ borderBottom: "1px solid #e5e5e5" }}>
        <h2>Write a Note!</h2>
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2">
              <UserAvatar user={user} />
              <span style={{ fontWeight: 600, color: "#4F6EF7", fontSize: "0.95rem" }}>
                {user.username}
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm font-medium transition-all duration-200"
            style={{
              border: "1.5px solid #4F6EF7",
              color: "#4F6EF7",
              background: "transparent",
              borderRadius: 8,
              padding: "6px 16px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#4F6EF7"
              e.currentTarget.style.color = "#fff"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent"
              e.currentTarget.style.color = "#4F6EF7"
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* ── Toolbar ────────────────────────────────────── */}
      <div className="w-full px-6 py-5">
        <div className="flex w-full items-center gap-4">
          {/* Notes dropdown */}
          <div className="relative" ref={notesMenuRef}>
            <button
              type="button"
              onClick={() => setNotesOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={notesOpen}
              className="h-10 text-sm font-medium transition-all duration-150"
              style={{
                background: "#fff",
                border: "1.5px solid #e0e0e0",
                borderRadius: 10,
                padding: "0 20px",
                color: "#333",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#4F6EF7" }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e0e0e0" }}
            >
              <span className="inline-flex items-center gap-2">
                <NotesIcon />
                <span>Notes</span>
                <span
                  className="text-[10px] leading-none transition-transform duration-200"
                  style={{
                    color: "#9ca3af",
                    transform: notesOpen ? "rotate(180deg)" : "rotate(0deg)",
                    display: "inline-block"
                  }}
                >
                  ▼
                </span>
              </span>
            </button>

            {notesOpen && (
              <div
                className="absolute left-0 top-full z-30 mt-3 overflow-hidden"
                style={{
                  width: 360,
                  maxWidth: "calc(100vw - 3rem)",
                  borderRadius: 16,
                  border: "1px solid #ececec",
                  background: "#fff",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
                }}
              >
                <div className="divide-y divide-gray-100">
                  {noteMenuItems.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleViewChange(item.view)}
                      className="flex w-full items-center gap-3 px-4 py-[14px] text-left transition-colors hover:bg-gray-50"
                    >
                      <NotesPanelIcon type={item.key} />
                      <span className="flex-1 text-[15px]" style={{ color: "#1a1a2e" }}>{item.label}</span>
                      <span className="text-[15px] font-medium" style={{ color: "#9ca3af" }}>{item.count}</span>
                    </button>
                  ))}
                </div>

                <div style={{ borderTop: "1px solid #ececec", padding: 16 }}>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[15px] font-medium" style={{ color: "#9ca3af" }}>Folders</span>
                    <button type="button" className="text-3xl leading-none hover:text-gray-950" style={{ color: "#333" }} aria-label="Add folder">+</button>
                  </div>
                  <div className="flex min-h-[150px] flex-col items-center justify-center gap-3 text-center" style={{ color: "#9ca3af" }}>
                    <FolderPlaceholderIcon />
                    <span className="text-[15px]">No folders</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <AddNote onSave={handleSaveNote} />

          {/* Search bar */}
          <div className="ml-auto flex min-w-0 items-center justify-end">
            <div className="relative flex h-10 items-center overflow-hidden"
              style={{ border: "1.5px solid #e0e0e0", borderRadius: 10, background: "#fff" }}>
              <div className="flex h-10 w-10 items-center justify-center" style={{ borderRight: "1px solid #e0e0e0" }}>
                <svg viewBox="0 0 20 20" aria-hidden="true" className="pointer-events-none w-5 fill-gray-400 transition">
                  <path d="M16.72 17.78a.75.75 0 1 0 1.06-1.06l-1.06 1.06ZM9 14.5A5.5 5.5 0 0 1 3.5 9H2a7 7 0 0 0 7 7v-1.5ZM3.5 9A5.5 5.5 0 0 1 9 3.5V2a7 7 0 0 0-7 7h1.5ZM9 3.5A5.5 5.5 0 0 1 14.5 9H16a7 7 0 0 0-7-7v1.5Zm3.89 10.45 3.83 3.83 1.06-1.06-3.83-3.83-1.06 1.06ZM14.5 9a5.48 5.48 0 0 1-1.61 3.89l1.06 1.06A6.98 6.98 0 0 0 16 9h-1.5Zm-1.61 3.89A5.48 5.48 0 0 1 9 14.5V16a6.98 6.98 0 0 0 4.95-2.05l-1.06-1.06Z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="h-10 w-[380px] max-w-full bg-white px-3 pr-10 outline-0"
                style={{ fontSize: "0.9rem", fontFamily: "inherit" }}
                placeholder="Search your note titles..."
              />
              {normalizedSearchQuery ? (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-[72px] flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
                  style={{ color: "#9ca3af" }}
                >
                  ✕
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleSearchSubmit}
                className="h-10 px-5 text-white font-semibold text-sm transition-all duration-200"
                style={{
                  background: "#4F6EF7",
                  borderTopRightRadius: 8,
                  borderBottomRightRadius: 8,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#3d5bdb" }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#4F6EF7" }}
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────── */}
      {isLoading ? (
        <div className="px-6 py-10 text-center text-sm" style={{ color: "#9ca3af" }}>
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-[3px] border-[#4F6EF7] border-t-transparent mb-3" />
          <p>Loading notes...</p>
        </div>
      ) : noResultsFound ? (
        <div className="px-6 text-left text-sm" style={{ color: "#6b7280" }}>No results found</div>
      ) : null}

      {!isLoading && currentView === "deleted" ? (
        <RecentlyDeleted
          deletedNotes={displayedNotes}
          onOpenNote={handleOpenNote}
          onRestore={handleRestoreNote}
          onPermanentDelete={handlePermanentDeleteNote}
          highlightTitle={highlightTitle}
        />
      ) : !isLoading && currentView === "locked" ? (
        <Locked
          lockedNotes={displayedNotes}
          onOpenNote={handleOpenNote}
          onLock={handleLockNote}
          highlightTitle={highlightTitle}
        />
      ) : !isLoading ? (
        <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5 px-6 pb-6">
          {displayedNotes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              onDelete={handleDeleteNote}
              onLock={handleLockNote}
              onOpen={handleOpenNote}
              highlightTitle={highlightTitle}
            />
          ))}
        </div>
      ) : null}

      {selectedNote ? <NoteDetailModal note={selectedNote} onClose={() => setSelectedNote(null)} /> : null}

      {/* ── Toast Notification ────────────────────────── */}
      {toast && (
        <div 
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-2xl animate-in slide-in-from-right-full duration-300"
          style={{ 
            background: "#fff", 
            border: `1.5px solid ${toast.type === "success" ? "#dcfce7" : "#fee2e2"}`,
            borderLeft: `5px solid ${toast.type === "success" ? "#22c55e" : "#ef4444"}`
          }}
        >
          {toast.type === "success" ? (
            <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className="text-[14px] font-semibold text-gray-800">{toast.message}</span>
        </div>
      )}
    </>
  )
}

export default HomePage