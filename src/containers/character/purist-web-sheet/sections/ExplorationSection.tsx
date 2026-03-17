type ExplorationSectionProps = {
  listenAtDoor: string
  openDoor: string
  findSecretDoor: string
  findRoomTrap: string
}

const ROWS = [
  { lbl: 'LD', value: 'listenAtDoor' as const, help: 'Listen at door\n(1-in-6 or by class)' },
  { lbl: 'OD', value: 'openDoor' as const, help: 'Open stuck door\n(based on STR)' },
  { lbl: 'SD', value: 'findSecretDoor' as const, help: 'Find secret door\n(1-in-6 or by class)' },
  { lbl: 'FT', value: 'findRoomTrap' as const, help: 'Find room trap\n(1-in-6 or by class)' },
]

export default function ExplorationSection(props: ExplorationSectionProps) {
  return (
    <>
      <div className="ps-sec-hdr" style={{ left: 'var(--ps-col3)', top: 'calc(var(--ps-explr-top) - var(--ps-hdr-gap))' }}>
        Exploration
      </div>

      {ROWS.map(({ lbl, value, help }, i) => (
        <span key={lbl}>
          <div className="ps-row" style={{ left: 'var(--ps-col3)', top: `calc(var(--ps-explr-top) + ${i} * var(--ps-stride))` }}>
            <div className="ps-lbl">{lbl}</div>
            <div className="ps-inp" style={{ width: 'var(--ps-inp-sm)' }}>
              <input type="text" defaultValue={props[value]} />
            </div>
          </div>
          <div className="ps-help" style={{ left: 'var(--ps-c3-help)', top: `calc(var(--ps-explr-top) + ${i} * var(--ps-stride))`, width: 'var(--ps-c3-help-w)' }}>
            {help.split('\n').map((line, j, arr) => (
              <span key={j}>{line}{j < arr.length - 1 && <br />}</span>
            ))}
          </div>
        </span>
      ))}
    </>
  )
}
