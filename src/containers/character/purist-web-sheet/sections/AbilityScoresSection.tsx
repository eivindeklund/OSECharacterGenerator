type AbilityScoresSectionProps = {
  str: string
  int: string
  wis: string
  dex: string
  con: string
  cha: string
}

const ROWS: Array<{ lbl: string; value: keyof AbilityScoresSectionProps; help: string }> = [
  { lbl: 'STR', value: 'str', help: 'Melee att./damage,\nOpen doors' },
  { lbl: 'INT', value: 'int', help: 'Languages, Literacy' },
  { lbl: 'WIS', value: 'wis', help: 'Saves vs magic' },
  { lbl: 'DEX', value: 'dex', help: 'Missile attacks,\nAC, Initiative' },
  { lbl: 'CON', value: 'con', help: 'Hit points' },
  { lbl: 'CHA', value: 'cha', help: 'Reactions,\n#Retainers, Loyalty' },
]

export default function AbilityScoresSection(props: AbilityScoresSectionProps) {
  return (
    <>
      <div className="ps-sec-hdr" style={{ left: 'var(--ps-col1)', top: 'calc(var(--ps-abil-top) - var(--ps-hdr-gap))' }}>
        Ability Scores
      </div>

      {ROWS.map(({ lbl, value, help }, i) => (
        <span key={lbl}>
          <div className="ps-row" style={{ left: 'var(--ps-col1)', top: `calc(var(--ps-abil-top) + ${i} * var(--ps-stride))` }}>
            <div className="ps-lbl">{lbl}</div>
            <div className="ps-inp" style={{ width: 'var(--ps-inp-sm)' }}>
              <input type="text" defaultValue={props[value]} />
            </div>
          </div>
          <div className="ps-help" style={{ left: 'var(--ps-c1-help)', top: `calc(var(--ps-abil-top) + ${i} * var(--ps-stride))`, width: 'var(--ps-c1-help-w)' }}>
            {help.split('\n').map((line, j) => (
              <span key={j}>{line}{j < help.split('\n').length - 1 && <br />}</span>
            ))}
          </div>
        </span>
      ))}

      <div className="ps-footnote" style={{ left: 'var(--ps-col1)', top: 'calc(var(--ps-abil-bot) + 3.5pt)' }}>
        <b>Ability check:</b> Roll under or equal on 1d20
      </div>
    </>
  )
}
