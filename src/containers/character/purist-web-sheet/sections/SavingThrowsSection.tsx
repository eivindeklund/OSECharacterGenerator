type SavingThrowsSectionProps = {
  death: string
  wands: string
  paralysis: string
  breath: string
  spells: string
  wisMod: string
}

const ROWS = [
  { lbl: 'D', value: 'death' as const, help: 'Death, poison' },
  { lbl: 'W', value: 'wands' as const, help: 'Magic wands' },
  { lbl: 'P', value: 'paralysis' as const, help: 'Paralysis, petrification' },
  { lbl: 'B', value: 'breath' as const, help: 'Breath attacks' },
  { lbl: 'S', value: 'spells' as const, help: 'Spells, magic rods, magic staves' },
  { lbl: '±', value: 'wisMod' as const, help: 'WIS modifier to saves vs magic' },
]

export default function SavingThrowsSection(props: SavingThrowsSectionProps) {
  return (
    <>
      <div className="ps-sec-hdr" style={{ left: 'var(--ps-col2)', top: 'calc(var(--ps-abil-top) - var(--ps-hdr-gap))' }}>
        Saving Throws
      </div>

      {ROWS.map(({ lbl, value, help }, i) => (
        <span key={lbl}>
          <div className="ps-row" style={{ left: 'var(--ps-col2)', top: `calc(var(--ps-abil-top) + ${i} * var(--ps-stride))` }}>
            <div className="ps-lbl">{lbl}</div>
            <div className="ps-inp" style={{ width: 'var(--ps-inp-sm)' }}>
              <input type="text" defaultValue={props[value]} />
            </div>
          </div>
          <div className="ps-help" style={{ left: 'var(--ps-c2-help)', top: `calc(var(--ps-abil-top) + ${i} * var(--ps-stride))`, width: 'var(--ps-c2-help-w)' }}>
            <span>{help}</span>
          </div>
        </span>
      ))}

      <div className="ps-footnote" style={{ left: 'var(--ps-col2)', top: 'calc(var(--ps-abil-bot) + 3.5pt)' }}>
        <b>Saving throw:</b> Roll over or equal on 1d20
      </div>
    </>
  )
}
