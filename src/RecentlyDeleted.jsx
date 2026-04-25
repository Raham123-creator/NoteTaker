import { useState } from "react"

function RestoreIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  )
}

function TrashForeverIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

export default function RecentlyDeleted({ deletedNotes, onRestore, onPermanentDelete, highlightTitle }) {
  const [confirmId, setConfirmId] = useState(null)

  function handleDeleteForever(noteId) {
    setConfirmId(noteId)
  }

  function handleConfirmDelete(noteId) {
    onPermanentDelete?.(noteId)
    setConfirmId(null)
  }

  return (
    <div className="px-6 pb-6">
      {/* 30-day warning banner */}
      <div
        className="mb-4 mt-4 rounded-lg px-4 py-2.5 text-sm"
        style={{ background: "#fefce8", border: "1px solid #fde68a", color: "#92400e" }}
      >
        ⏳ Notes in this folder will be permanently deleted after <strong>30 days</strong>.
      </div>

      {deletedNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center" style={{ color: "#9ca3af" }}>
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-16 w-16 mb-3" style={{ color: "#d1d5db" }}>
            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6"
              d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3-2V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1m-9 2h14" />
          </svg>
          <span className="text-[15px]">Recently Deleted is empty</span>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
          {deletedNotes.map((note) => (
            <div
              key={note._id}
              className="card relative overflow-hidden"
              style={{ opacity: 0.72, filter: "grayscale(0.35)" }}
            >
              {/* Confirmation overlay */}
              {confirmId === note._id && (
                <div
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-[inherit] px-5 text-center"
                  style={{ background: "rgba(255,255,255,0.97)" }}
                >
                  <p className="text-sm font-medium" style={{ color: "#374151" }}>
                    Permanently delete this note?<br />
                    <span style={{ color: "#9ca3af", fontWeight: 400 }}>This cannot be undone.</span>
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmId(null)}
                      className="rounded-lg px-4 py-1.5 text-sm font-medium transition-colors"
                      style={{ border: "1.5px solid #e0e0e0", color: "#6b7280", background: "#fff" }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConfirmDelete(note._id)}
                      className="rounded-lg px-4 py-1.5 text-sm font-medium text-white transition-colors"
                      style={{ background: "#ef4444" }}
                    >
                      Delete Forever
                    </button>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="absolute right-[12px] top-[12px] flex gap-[6px]">
                {/* Restore button */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onRestore?.(note._id) }}
                  aria-label="Restore note"
                  title="Restore note"
                  className="flex items-center justify-center rounded-full transition-all duration-150"
                  style={{ width: 28, height: 28, background: "#dcfce7", color: "#16a34a" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#16a34a"; e.currentTarget.style.color = "#fff" }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#dcfce7"; e.currentTarget.style.color = "#16a34a" }}
                >
                  <RestoreIcon />
                </button>

                {/* Delete Forever button */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleDeleteForever(note._id) }}
                  aria-label="Delete forever"
                  title="Delete forever"
                  className="flex items-center justify-center rounded-full transition-all duration-150"
                  style={{ width: 28, height: 28, background: "#fee2e2", color: "#ef4444" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#ef4444"; e.currentTarget.style.color = "#fff" }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#ef4444" }}
                >
                  <TrashForeverIcon />
                </button>
              </div>

              {/* Note content */}
              <div className="header">
                <span className="icon">
                  <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path clipRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" fillRule="evenodd"></path>
                  </svg>
                </span>
                <p className="alert pr-20">{highlightTitle ? highlightTitle(note.title) : note.title}</p>
              </div>
              <p className="message">{note.content || note.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
