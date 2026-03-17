type WeaponsArmourSectionProps = {
  weaponsArmour: string
}

export default function WeaponsArmourSection({ weaponsArmour }: WeaponsArmourSectionProps) {
  return (
    <>
      <div className="ps-sec-hdr" style={{ left: 'var(--ps-col3)', top: 'calc(var(--ps-p2-box-top) - var(--ps-hdr-gap))' }}>
        Weapons &amp; Armour
      </div>
      <div
        className="ps-box"
        style={{
          left: 'var(--ps-col3)',
          top: 'var(--ps-p2-box-top)',
          width: 'var(--ps-box-rgt-w)',
          height: 'var(--ps-p2-box-top-h)',
        }}
      >
        <textarea className="ps-box-textarea" defaultValue={weaponsArmour} />
      </div>
    </>
  )
}
