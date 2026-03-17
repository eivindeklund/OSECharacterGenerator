type EncumbranceSectionProps = {
  equipmentEncumbrance: string
}

export default function EncumbranceSection({ equipmentEncumbrance }: EncumbranceSectionProps) {
  return (
    <>
      <div className="ps-sec-hdr" style={{ left: 'var(--ps-col3)', top: 'calc(var(--ps-p2-enc-top) - var(--ps-hdr-gap))' }}>
        Encumbrance
      </div>
      <div
        className="ps-enc-optional"
        style={{ left: 'var(--ps-c3-help)', top: 'calc(var(--ps-p2-enc-top) - var(--ps-hdr-gap))' }}
      >
        (Optional rule)
      </div>

      {/* TR — weight of treasure & coins (row 0 from enc-top; blank at creation) */}
      <div className="ps-row" style={{ left: 'var(--ps-col3)', top: 'var(--ps-p2-enc-top)' }}>
        <div className="ps-lbl">TR</div>
        <div className="ps-inp" style={{ width: 'var(--ps-inp-sm)' }}>
          <input type="text" />
        </div>
      </div>
      <div className="ps-help" style={{ left: 'var(--ps-c3-help)', top: 'var(--ps-p2-enc-top)', width: 'var(--ps-c3-help-w)' }}>
        <span>Weight of treasure &amp; coins</span>
      </div>

      {/* EQ — weight of weapons, armour & gear (shares top with XP section) */}
      <div className="ps-row" style={{ left: 'var(--ps-col3)', top: 'var(--ps-p2-xp-top)' }}>
        <div className="ps-lbl">EQ</div>
        <div className="ps-inp" style={{ width: 'var(--ps-inp-sm)' }}>
          <input type="text" defaultValue={equipmentEncumbrance} />
        </div>
      </div>
      <div className="ps-help" style={{ left: 'var(--ps-c3-help)', top: 'var(--ps-p2-xp-top)', width: 'var(--ps-c3-help-w)' }}>
        <span>Weight of weapons, armour &amp; gear</span>
      </div>

      {/* + — total weight (shares top with XP+stride) */}
      <div className="ps-row" style={{ left: 'var(--ps-col3)', top: 'calc(var(--ps-p2-xp-top) + var(--ps-stride))' }}>
        <div className="ps-lbl">+</div>
        <div className="ps-inp" style={{ width: 'var(--ps-inp-sm)' }}>
          <input type="text" />
        </div>
      </div>
      <div className="ps-help" style={{ left: 'var(--ps-c3-help)', top: 'calc(var(--ps-p2-xp-top) + var(--ps-stride))', width: 'var(--ps-c3-help-w)' }}>
        <span>Total weight carried (max=1,600cn)</span>
      </div>
    </>
  )
}
