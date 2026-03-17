type AbilitiesBoxProps = {
  abilitiesText: string
}

export default function AbilitiesBox({ abilitiesText }: AbilitiesBoxProps) {
  return (
    <>
      <div className="ps-sec-hdr" style={{ left: 'var(--ps-col1)', top: 'calc(var(--ps-abil-box-top) - var(--ps-hdr-gap))' }}>
        Abilities, Skills, Weapons
      </div>
      <div
        className="ps-box"
        style={{
          left: 'var(--ps-col1)',
          top: 'var(--ps-abil-box-top)',
          width: 'var(--ps-box-lft-w)',
          height: 'var(--ps-abil-box-h)',
        }}
      >
        <textarea className="ps-box-textarea" defaultValue={abilitiesText} />
      </div>
    </>
  )
}
