type EquipmentSectionProps = {
  equipment: string
}

export default function EquipmentSection({ equipment }: EquipmentSectionProps) {
  return (
    <>
      <div className="ps-sec-hdr" style={{ left: 'var(--ps-col1)', top: 'calc(var(--ps-p2-box-top) - var(--ps-hdr-gap))' }}>
        Equipment
      </div>
      <div
        className="ps-box"
        style={{
          left: 'var(--ps-col1)',
          top: 'var(--ps-p2-box-top)',
          width: 'var(--ps-box-lft-w)',
          height: 'var(--ps-p2-box-top-h)',
        }}
      >
        <textarea className="ps-box-textarea" defaultValue={equipment} />
      </div>
    </>
  )
}
