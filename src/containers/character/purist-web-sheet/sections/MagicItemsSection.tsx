export default function MagicItemsSection() {
  return (
    <>
      <div className="ps-sec-hdr" style={{ left: 'var(--ps-col1)', top: 'calc(var(--ps-p2-mid-top) - var(--ps-hdr-gap))' }}>
        Magic Items
      </div>
      <div
        className="ps-box"
        style={{
          left: 'var(--ps-col1)',
          top: 'var(--ps-p2-mid-top)',
          width: 'var(--ps-box-lft-w)',
          height: 'var(--ps-p2-mid-h)',
        }}
      >
        <textarea className="ps-box-textarea" />
      </div>
    </>
  )
}
