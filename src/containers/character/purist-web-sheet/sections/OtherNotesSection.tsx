type OtherNotesSectionProps = {
  notes: string
}

export default function OtherNotesSection({ notes }: OtherNotesSectionProps) {
  return (
    <>
      <div className="ps-sec-hdr" style={{ left: 'var(--ps-col1)', top: 'calc(var(--ps-p2-bot-top) - var(--ps-hdr-gap))' }}>
        Other Notes
      </div>
      {/* Hint text — right-aligned over the section header */}
      <div
        className="ps-notes-hint"
        style={{
          left: 'var(--ps-col1)',
          top: 'calc(var(--ps-p2-bot-top) - var(--ps-hdr-gap))',
          width: 'var(--ps-box-lft-w)',
        }}
      >
        Spells, mounts, retainers,<br />areas explored, clues
      </div>
      <div
        className="ps-box"
        style={{
          left: 'var(--ps-col1)',
          top: 'var(--ps-p2-bot-top)',
          width: 'var(--ps-box-lft-w)',
          height: 'var(--ps-p2-notes-h)',
        }}
      >
        <textarea className="ps-box-textarea" defaultValue={notes} />
      </div>
    </>
  )
}
