type MovementSectionProps = {
  overland: string
  exploration: string
  encounter: string
}

const ROWS = [
  { lbl: 'Ov', value: 'overland' as const, help: 'Overland travel: miles/day' },
  { lbl: 'Ex', value: 'exploration' as const, help: 'Exploration: feet/turn' },
  { lbl: 'En', value: 'encounter' as const, help: 'Encounters: feet/round' },
]

export default function MovementSection(props: MovementSectionProps) {
  return (
    <>
      <div className="ps-sec-hdr" style={{ left: 'var(--ps-col3)', top: 'calc(var(--ps-move-top) - var(--ps-hdr-gap))' }}>
        Movement
      </div>

      {ROWS.map(({ lbl, value, help }, i) => (
        <span key={lbl}>
          <div className="ps-row" style={{ left: 'var(--ps-col3)', top: `calc(var(--ps-move-top) + ${i} * var(--ps-stride))` }}>
            <div className="ps-lbl">{lbl}</div>
            <div className="ps-inp" style={{ width: 'var(--ps-inp-sm)' }}>
              <input type="text" defaultValue={props[value]} />
            </div>
          </div>
          <div className="ps-help" style={{ left: 'var(--ps-c3-help)', top: `calc(var(--ps-move-top) + ${i} * var(--ps-stride))`, width: 'var(--ps-c3-help-w)' }}>
            <span>{help}</span>
          </div>
        </span>
      ))}
    </>
  )
}
