type CombatSectionProps = {
  hp: string
  maxHp: string
  conMod: string
  ac: string
  unarmouredAc: string
  dexAcMod: string
  attackBonus: string
  strMeleeMod: string
  dexMissileMod: string
}

export default function CombatSection({
  hp, maxHp, conMod, ac, unarmouredAc, dexAcMod, attackBonus, strMeleeMod, dexMissileMod,
}: CombatSectionProps) {
  return (
    <>
      <div className="ps-sec-hdr" style={{ left: 'var(--ps-col1)', top: 'calc(var(--ps-combat-top) - var(--ps-hdr-gap))' }}>
        Combat
      </div>

      {/* HP big box */}
      <div className="ps-row" style={{ left: 'var(--ps-col1)', top: 'var(--ps-combat-top)', height: 'var(--ps-big-h)' }}>
        <div className="ps-lbl" style={{ fontSize: '13pt' }}>HP</div>
        <div className="ps-inp ps-big-inp" style={{ width: 'var(--ps-inp-wd)' }}>
          <div className="ps-inner-lbl">Hit points</div>
          <input type="text" defaultValue={hp} />
        </div>
      </div>

      {/* Max HP (col2, row 0) */}
      <div className="ps-row" style={{ left: 'var(--ps-col2)', top: 'var(--ps-combat-top)' }}>
        <div className="ps-lbl">Max</div>
        <div className="ps-inp" style={{ width: 'var(--ps-inp-sm)' }}>
          <input type="text" defaultValue={maxHp} />
        </div>
      </div>
      <div className="ps-help" style={{ left: 'var(--ps-c2-help)', top: 'var(--ps-combat-top)', width: 'var(--ps-c2-help-w)' }}>
        <span>Maximum hit points</span>
      </div>

      {/* ± CON HP mod (col2, row 1) */}
      <div className="ps-row" style={{ left: 'var(--ps-col2)', top: 'calc(var(--ps-combat-top) + var(--ps-stride))' }}>
        <div className="ps-lbl">±</div>
        <div className="ps-inp" style={{ width: 'var(--ps-inp-sm)' }}>
          <input type="text" defaultValue={conMod} />
        </div>
      </div>
      <div className="ps-help" style={{ left: 'var(--ps-c2-help)', top: 'calc(var(--ps-combat-top) + var(--ps-stride))', width: 'var(--ps-c2-help-w)' }}>
        <span>CON modifier to hit points</span>
      </div>

      {/* AC big box */}
      <div className="ps-row" style={{ left: 'var(--ps-col1)', top: 'var(--ps-ac-top)', height: 'var(--ps-big-h)' }}>
        <div className="ps-lbl" style={{ fontSize: '13pt' }}>AC</div>
        <div className="ps-inp ps-big-inp" style={{ width: 'var(--ps-inp-wd)' }}>
          <div className="ps-inner-lbl">Armour Class</div>
          <input type="text" defaultValue={ac} />
        </div>
      </div>

      {/* Un — unarmoured AC (col2, row 0 from ac-top) */}
      <div className="ps-row" style={{ left: 'var(--ps-col2)', top: 'var(--ps-ac-top)' }}>
        <div className="ps-lbl">Un</div>
        <div className="ps-inp" style={{ width: 'var(--ps-inp-sm)' }}>
          <input type="text" defaultValue={unarmouredAc} />
        </div>
      </div>
      <div className="ps-help" style={{ left: 'var(--ps-c2-help)', top: 'var(--ps-ac-top)', width: 'var(--ps-c2-help-w)' }}>
        <span>Unarmoured AC:<br />10 + DEX modifier</span>
      </div>

      {/* ± DEX AC mod (col2, row 1 from ac-top) */}
      <div className="ps-row" style={{ left: 'var(--ps-col2)', top: 'calc(var(--ps-ac-top) + var(--ps-stride))' }}>
        <div className="ps-lbl">±</div>
        <div className="ps-inp" style={{ width: 'var(--ps-inp-sm)' }}>
          <input type="text" defaultValue={dexAcMod} />
        </div>
      </div>
      <div className="ps-help" style={{ left: 'var(--ps-c2-help)', top: 'calc(var(--ps-ac-top) + var(--ps-stride))', width: 'var(--ps-c2-help-w)' }}>
        <span>DEX modifier to Armour Class</span>
      </div>

      {/* Att big box */}
      <div className="ps-row" style={{ left: 'var(--ps-col1)', top: 'var(--ps-att-top)', height: 'var(--ps-big-h)' }}>
        <div className="ps-lbl" style={{ fontSize: '13pt' }}>Att</div>
        <div className="ps-inp ps-big-inp" style={{ width: 'var(--ps-inp-wd)' }}>
          <div className="ps-inner-lbl">Attack bonus</div>
          <input type="text" defaultValue={attackBonus} />
        </div>
      </div>

      {/* Mel — STR melee mod (col2, row 0 from att-top) */}
      <div className="ps-row" style={{ left: 'var(--ps-col2)', top: 'var(--ps-att-top)' }}>
        <div className="ps-lbl">Mel</div>
        <div className="ps-inp" style={{ width: 'var(--ps-inp-sm)' }}>
          <input type="text" defaultValue={strMeleeMod} />
        </div>
      </div>
      <div className="ps-help" style={{ left: 'var(--ps-c2-help)', top: 'var(--ps-att-top)', width: 'var(--ps-c2-help-w)' }}>
        <span>STR modifier to melee att./damage</span>
      </div>

      {/* Mis — DEX missile mod (col2, row 1 from att-top) */}
      <div className="ps-row" style={{ left: 'var(--ps-col2)', top: 'calc(var(--ps-att-top) + var(--ps-stride))' }}>
        <div className="ps-lbl">Mis</div>
        <div className="ps-inp" style={{ width: 'var(--ps-inp-sm)' }}>
          <input type="text" defaultValue={dexMissileMod} />
        </div>
      </div>
      <div className="ps-help" style={{ left: 'var(--ps-c2-help)', top: 'calc(var(--ps-att-top) + var(--ps-stride))', width: 'var(--ps-c2-help-w)' }}>
        <span>DEX modifier to missile attacks</span>
      </div>
    </>
  )
}
