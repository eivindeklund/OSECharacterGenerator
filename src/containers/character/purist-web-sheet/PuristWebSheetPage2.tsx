import type { ReactNode } from 'react'

type PuristWebSheetPage2Props = {
  children: ReactNode
}

export default function PuristWebSheetPage2({ children }: PuristWebSheetPage2Props) {
  return (
    <div className="ps-page">
      {children}
      <div className="ps-copyright">© 2019 Gavin Norman — necroticgnome.com</div>
    </div>
  )
}
