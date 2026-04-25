import NoteCard from "./NoteCard"

export default function Locked({ lockedNotes, onOpenNote, onLock, highlightTitle }) {
  return (
    <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 px-6 pb-6">
      {lockedNotes.length === 0 ? (
        <div
          className="col-span-full flex flex-col items-center justify-center py-16 text-center"
          style={{ color: "#9ca3af" }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-16 w-16 mb-3" style={{ color: "#d1d5db" }}>
            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6"
              d="M7.5 11V8.5a4.5 4.5 0 1 1 9 0V11m-10.5 0h12A1.75 1.75 0 0 1 19.75 12.75v5.5A1.75 1.75 0 0 1 18 20H6A1.75 1.75 0 0 1 4.25 18.25v-5.5A1.75 1.75 0 0 1 6 11Zm4.5 3.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
          </svg>
          <span className="text-[15px]">No locked notes</span>
        </div>
      ) : (
        lockedNotes.map((note) => (
          <NoteCard
            key={note._id}
            note={note}
            onLock={onLock}
            onOpen={onOpenNote}
            highlightTitle={highlightTitle}
            showActions={true}
            hideDelete={true}
          />
        ))
      )}
    </div>
  )
}
