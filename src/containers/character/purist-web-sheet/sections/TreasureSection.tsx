export default function TreasureSection() {
  return (
    <>
      <div className="ps-sec-hdr" style={{ left: 'var(--ps-col3)', top: 'calc(var(--ps-p2-mid-top) - var(--ps-hdr-gap))' }}>
        Treasure
      </div>
      <div
        className="ps-box"
        style={{
          left: 'var(--ps-col3)',
          top: 'var(--ps-p2-mid-top)',
          width: 'var(--ps-box-rgt-w)',
          height: 'var(--ps-p2-mid-h)',
        }}
      >
        <textarea className="ps-box-textarea" />
      </div>
    </>
  )
}
