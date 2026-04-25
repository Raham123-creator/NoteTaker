export default function NoteCard({ note, onDelete, onLock, onOpen, highlightTitle, showActions = true, hideDelete = false }) {
  function handleCardKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      onOpen?.(note)
    }
  }

  const isLocked = note.isLocked

  return (
    <div
      className="card relative overflow-hidden cursor-pointer"
      onClick={() => onOpen?.(note)}
      onKeyDown={handleCardKeyDown}
      role="button"
      tabIndex={0}
    >
      {showActions ? (
        <div className="absolute right-[12px] top-[12px] flex gap-[6px]">
          {/* Delete button */}
          {!hideDelete && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                // Using _id as per requirement
                onDelete?.(note._id)
              }}
              aria-label="Delete note"
              title="Delete"
              className="flex items-center justify-center rounded-full transition-all duration-150"
              style={{
                width: 28,
                height: 28,
                background: "#fee2e2",
                color: "#ef4444",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#ef4444"
                e.currentTarget.style.color = "#fff"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fee2e2"
                e.currentTarget.style.color = "#ef4444"
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}

          {/* Lock button — visually reflects DB state */}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              // Using _id as per requirement
              onLock?.(note._id)
            }}
            aria-label={isLocked ? "Unlock note" : "Lock note"}
            title={isLocked ? "Click to unlock" : "Lock"}
            className="flex items-center justify-center rounded-full transition-all duration-150"
            style={{
              width: 28,
              height: 28,
              background: isLocked ? "#dcfce7" : "#f3f4f6",
              color: isLocked ? "#16a34a" : "#9ca3af",
            }}
            onMouseEnter={(e) => {
              if (isLocked) {
                e.currentTarget.style.background = "#16a34a"
                e.currentTarget.style.color = "#fff"
              } else {
                e.currentTarget.style.background = "#e5e7eb"
                e.currentTarget.style.color = "#6b7280"
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isLocked ? "#dcfce7" : "#f3f4f6"
              e.currentTarget.style.color = isLocked ? "#16a34a" : "#9ca3af"
            }}
          >
            {isLocked ? (
              /* Locked icon (filled) */
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M12 2C9.24 2 7 4.24 7 7v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7c0-2.76-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3v3H9V7c0-1.66 1.34-3 3-3zm0 10a2 2 0 110 4 2 2 0 010-4z"/>
              </svg>
            ) : (
              /* Unlocked icon (open) */
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 9.9-1" />
              </svg>
            )}
          </button>
        </div>
      ) : null}

      <div className="header">
        <span className="icon">
          <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path clipRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" fillRule="evenodd"></path>
          </svg>
        </span>
        <p className="alert pr-20">{highlightTitle ? highlightTitle(note.title) : note.title}</p>
      </div>

      <p className="message">{note.content || note.description}</p>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          onOpen?.(note)
        }}
        className="mt-3 text-[13px] font-medium hover:underline"
        style={{ color: "#4F6EF7" }}
      >
        See more
      </button>
    </div>
  )
}
