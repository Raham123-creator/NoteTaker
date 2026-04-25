import { useEffect, useRef, useState } from "react"

export default function AddNote({ onSave }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const modalRef = useRef(null)

  useEffect(() => {
    if (!open) {
      return undefined
    }

    function handleOutsideClick(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    document.addEventListener("touchstart", handleOutsideClick)

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
      document.removeEventListener("touchstart", handleOutsideClick)
    }
  }, [open])

  function closeModal() {
    setOpen(false)
  }

  function handleSave(event) {
    event.preventDefault()

    onSave({
      title: title.trim(),
      description: description.trim(),
    })

    setTitle("")
    setDescription("")
    setOpen(false)
  }

  return (
    <>
      {/* + Add button — redesigned */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-semibold text-white transition-all duration-200"
        style={{
          background: "#4F6EF7",
          borderRadius: 10,
          padding: "10px 20px",
          boxShadow: "0 4px 14px rgba(79,110,247,0.35)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#3d5bdb"
          e.currentTarget.style.transform = "translateY(-1px)"
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(79,110,247,0.45)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#4F6EF7"
          e.currentTarget.style.transform = "translateY(0)"
          e.currentTarget.style.boxShadow = "0 4px 14px rgba(79,110,247,0.35)"
        }}
      >
        + Add
      </button>

      {/* Modal — redesigned with backdrop blur */}
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }}>
          <div
            ref={modalRef}
            className="w-full bg-white shadow-2xl"
            style={{ maxWidth: 480, borderRadius: 16, padding: 32 }}
          >
            <h3 className="mb-5 text-lg font-bold" style={{ color: "#1a1a2e" }}>Add New Note</h3>

            <form className="space-y-4" onSubmit={handleSave}>
              <div>
                <label className="mb-2 block text-sm font-medium" style={{ color: "#6b7280" }} htmlFor="note-title">
                  Title
                </label>
                <input
                  id="note-title"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="w-full text-sm outline-none"
                  style={{
                    border: "1.5px solid #e0e0e0",
                    borderRadius: 10,
                    padding: "10px 14px",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#4F6EF7"
                    e.target.style.boxShadow = "0 0 0 3px rgba(79,110,247,0.1)"
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e0e0e0"
                    e.target.style.boxShadow = "none"
                  }}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium" style={{ color: "#6b7280" }} htmlFor="note-description">
                  Description
                </label>
                <textarea
                  id="note-description"
                  rows={4}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="w-full text-sm outline-none resize-none"
                  style={{
                    border: "1.5px solid #e0e0e0",
                    borderRadius: 10,
                    padding: "10px 14px",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#4F6EF7"
                    e.target.style.boxShadow = "0 0 0 3px rgba(79,110,247,0.1)"
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e0e0e0"
                    e.target.style.boxShadow = "none"
                  }}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-sm font-medium transition-colors duration-150"
                  style={{
                    border: "1.5px solid #e0e0e0",
                    borderRadius: 10,
                    padding: "8px 18px",
                    color: "#6b7280",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#f9fafb" }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-sm font-semibold text-white transition-all duration-200"
                  style={{
                    background: "#4F6EF7",
                    borderRadius: 10,
                    padding: "8px 22px",
                    boxShadow: "0 4px 14px rgba(79,110,247,0.35)",
                    border: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#3d5bdb"
                    e.currentTarget.style.transform = "translateY(-1px)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#4F6EF7"
                    e.currentTarget.style.transform = "translateY(0)"
                  }}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}
