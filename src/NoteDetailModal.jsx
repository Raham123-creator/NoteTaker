import { useEffect } from "react"

export default function NoteDetailModal({ note, onClose }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose])

  if (!note) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="relative w-full bg-white shadow-2xl"
        style={{ maxWidth: 480, borderRadius: 16, padding: 28 }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close note details"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
          style={{ color: "#9ca3af" }}
        >
          ✕
        </button>

        <h3 className="pr-10 text-xl font-bold" style={{ color: "#1a1a2e" }}>{note.title}</h3>

        <div className="mt-4 max-h-[60vh] overflow-y-auto pr-1 text-sm leading-6" style={{ color: "#6b7280" }}>
          <p className="whitespace-pre-wrap break-words">{note.content || note.description}</p>
        </div>
      </div>
    </div>
  )
}
