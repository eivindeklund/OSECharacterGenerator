type DescriptionSectionProps = {
  descriptionText: string
}

export default function DescriptionSection({ descriptionText }: DescriptionSectionProps) {
  return (
    <>
      <div
        className="ps-box"
        style={{
          left: 'var(--ps-col3)',
          top: 'var(--ps-desc-top)',
          width: 'var(--ps-box-rgt-w)',
          height: 'var(--ps-desc-h)',
        }}
      >
        <textarea className="ps-box-textarea" defaultValue={descriptionText} />
      </div>
      <div
        className="ps-caption"
        style={{
          left: 'var(--ps-col3)',
          top: 'calc(var(--ps-abil-bot) + 2pt)',
          width: 'var(--ps-box-rgt-w)',
        }}
      >
        Character portrait, symbol, description
      </div>
    </>
  )
}
