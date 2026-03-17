import type { ReactNode } from 'react'

type PuristWebSheetPage1Props = {
  children: ReactNode
}

export default function PuristWebSheetPage1({ children }: PuristWebSheetPage1Props) {
  return (
    <div className="ps-page">
      {children}
      <div className="ps-ose-logo">
        <span style={{ fontSize: '22pt', lineHeight: '0.85' }}>OLD-SCHOOL</span>
        <span style={{ fontSize: '22pt' }}>ESSENTIALS</span>
        <span style={{ fontSize: '8pt', letterSpacing: '1.5pt', marginTop: '2pt' }}>CHARACTER RECORD SHEET</span>
      </div>
      <div className="ps-copyright">© 2019 Gavin Norman — necroticgnome.com</div>
    </div>
  )
}
