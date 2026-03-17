type LanguagesSectionProps = {
  languages: string
  literate: boolean
}

export default function LanguagesSection({ languages, literate }: LanguagesSectionProps) {
  return (
    <>
      <div className="ps-sec-hdr" style={{ left: 'var(--ps-col3)', top: 'calc(var(--ps-lang-top) - var(--ps-hdr-gap))' }}>
        Languages
      </div>
      <div
        className="ps-box"
        style={{
          left: 'var(--ps-col3)',
          top: 'var(--ps-lang-top)',
          width: 'var(--ps-box-rgt-w)',
          height: 'var(--ps-lang-h)',
        }}
      >
        <textarea className="ps-box-textarea" defaultValue={languages} />
      </div>

      {/* Literate checkbox — positioned at the bottom-right of the languages box */}
      <div
        className="ps-literate-row"
        style={{
          top: 'calc(var(--ps-page-bot) - 14pt)',
          right: 'var(--ps-margin)',
        }}
      >
        <span>Literate</span>
        <input type="checkbox" defaultChecked={literate} />
      </div>
    </>
  )
}
