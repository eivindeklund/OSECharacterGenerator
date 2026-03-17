type EncounterSectionProps = {
  initDexMod: string
  chaReactionMod: string
}

export default function EncounterSection({ initDexMod, chaReactionMod }: EncounterSectionProps) {
  return (
    <>
      <div className="ps-sec-hdr" style={{ left: 'var(--ps-col3)', top: 'calc(var(--ps-combat-top) - var(--ps-hdr-gap))' }}>
        Encounters
      </div>

      {/* Init — DEX initiative mod (col3, row 0 from combat-top) */}
      <div className="ps-row" style={{ left: 'var(--ps-col3)', top: 'var(--ps-combat-top)' }}>
        <div className="ps-lbl">Init</div>
        <div className="ps-inp" style={{ width: 'var(--ps-inp-sm)' }}>
          <input type="text" defaultValue={initDexMod} />
        </div>
      </div>
      <div className="ps-help" style={{ left: 'var(--ps-c3-help)', top: 'var(--ps-combat-top)', width: 'var(--ps-c3-help-w)' }}>
        <span>DEX modifier to<br />initiative (optional)</span>
      </div>

      {/* ± CHA reaction mod (col3, row 1 from combat-top) */}
      <div className="ps-row" style={{ left: 'var(--ps-col3)', top: 'calc(var(--ps-combat-top) + var(--ps-stride))' }}>
        <div className="ps-lbl">±</div>
        <div className="ps-inp" style={{ width: 'var(--ps-inp-sm)' }}>
          <input type="text" defaultValue={chaReactionMod} />
        </div>
      </div>
      <div className="ps-help" style={{ left: 'var(--ps-c3-help)', top: 'calc(var(--ps-combat-top) + var(--ps-stride))', width: 'var(--ps-c3-help-w)' }}>
        <span>CHA modifier to<br />reaction rolls</span>
      </div>
    </>
  )
}
