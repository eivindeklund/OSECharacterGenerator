type IdentitySectionProps = {
  name: string
  characterClass: string
  alignment: string
  level: string
}

export default function IdentitySection({ name, characterClass, alignment, level }: IdentitySectionProps) {
  return (
    <>
      {/* PC / Name */}
      <div className="ps-row" style={{ left: 'var(--ps-col1)', top: 'var(--ps-pc-top)' }}>
        <div className="ps-lbl" style={{ fontSize: '10pt' }}>PC</div>
        <div className="ps-inp" style={{ width: 'var(--ps-inp-pc)' }}>
          <input type="text" defaultValue={name} />
        </div>
      </div>
      <div className="ps-help" style={{ left: 'var(--ps-c2-help)', top: 'var(--ps-pc-top)', width: 'var(--ps-c2-help-w)' }}>
        <span>Character name</span>
      </div>

      {/* Class (col1) + AL (col2) */}
      <div className="ps-row" style={{ left: 'var(--ps-col1)', top: 'var(--ps-class-top)' }}>
        <div className="ps-lbl" style={{ fontSize: '9pt' }}>Class</div>
        <div className="ps-inp" style={{ width: 'var(--ps-inp-wd)' }}>
          <input type="text" defaultValue={characterClass} />
        </div>
      </div>
      <div className="ps-row" style={{ left: 'var(--ps-col2)', top: 'var(--ps-class-top)' }}>
        <div className="ps-lbl" style={{ fontSize: '10pt' }}>AL</div>
        <div className="ps-inp" style={{ width: 'var(--ps-inp-sm)' }}>
          <input type="text" defaultValue={alignment} />
        </div>
      </div>
      <div className="ps-help" style={{ left: 'var(--ps-c2-help)', top: 'var(--ps-class-top)', width: 'var(--ps-c2-help-w)' }}>
        <span>Alignment: Law, Neutrality, Chaos</span>
      </div>

      {/* Title (col1) + Level (col2) */}
      <div className="ps-row" style={{ left: 'var(--ps-col1)', top: 'var(--ps-title-top)' }}>
        <div className="ps-lbl" style={{ fontSize: '9pt' }}>Title</div>
        <div className="ps-inp" style={{ width: 'var(--ps-inp-wd)' }}>
          <input type="text" />
        </div>
      </div>
      <div className="ps-row" style={{ left: 'var(--ps-col2)', top: 'var(--ps-title-top)' }}>
        <div className="ps-lbl" style={{ fontSize: '9pt' }}>Level</div>
        <div className="ps-inp" style={{ width: 'var(--ps-inp-sm)' }}>
          <input type="text" defaultValue={level} />
        </div>
      </div>
      <div className="ps-help" style={{ left: 'var(--ps-c2-help)', top: 'var(--ps-title-top)', width: 'var(--ps-c2-help-w)' }}>
        <span>Experience level</span>
      </div>
    </>
  )
}
