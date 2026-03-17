type XPSectionProps = {
  xpForNextLevel: string
  xpBonus: string
}

export default function XPSection({ xpForNextLevel, xpBonus }: XPSectionProps) {
  return (
    <>
      {/* XP big box (col1, p2-xp-top) — blank at character creation */}
      <div className="ps-row" style={{ left: 'var(--ps-col1)', top: 'var(--ps-p2-xp-top)', height: 'var(--ps-big-h)' }}>
        <div className="ps-lbl" style={{ fontSize: '13pt' }}>XP</div>
        <div className="ps-inp ps-big-inp" style={{ width: 'var(--ps-inp-wd)' }}>
          <div className="ps-inner-lbl">Experience points</div>
          <input type="text" />
        </div>
      </div>

      {/* Next — XP for next level (col2, row 0 from p2-xp-top) */}
      <div className="ps-row" style={{ left: 'var(--ps-col2)', top: 'var(--ps-p2-xp-top)' }}>
        <div className="ps-lbl">Next</div>
        <div className="ps-inp" style={{ width: 'var(--ps-inp-sm)' }}>
          <input type="text" defaultValue={xpForNextLevel} />
        </div>
      </div>
      <div className="ps-help" style={{ left: 'var(--ps-c2-help)', top: 'var(--ps-p2-xp-top)', width: 'var(--ps-c2-help-w)' }}>
        <span>Experience points for next level</span>
      </div>

      {/* % — prime requisite XP bonus (col2, row 1 from p2-xp-top) */}
      <div className="ps-row" style={{ left: 'var(--ps-col2)', top: 'calc(var(--ps-p2-xp-top) + var(--ps-stride))' }}>
        <div className="ps-lbl">%</div>
        <div className="ps-inp" style={{ width: 'var(--ps-inp-sm)' }}>
          <input type="text" defaultValue={xpBonus} />
        </div>
      </div>
      <div className="ps-help" style={{ left: 'var(--ps-c2-help)', top: 'calc(var(--ps-p2-xp-top) + var(--ps-stride))', width: 'var(--ps-c2-help-w)' }}>
        <span>Prime requisite modifier to XP</span>
      </div>
    </>
  )
}
