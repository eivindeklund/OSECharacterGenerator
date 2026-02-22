import React from 'react'
import { Trans } from 'react-i18next'

type HeaderProps = {
  name?: string
  text?: string
  translation?: string
}

export default function Header({ name, text, translation }: HeaderProps) {
  return (
    <h2 className={`header header-default header--${name}`}>
      {text}
      {translation ? <Trans i18nKey={`${translation}`}></Trans> : ''}
    </h2>
  )
}


