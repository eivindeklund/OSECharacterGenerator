import React from 'react'

type ButtonProps = {
  name?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback?: (...args: any[]) => void
  text?: string
  color?: string
  disabled?: boolean
  children?: React.ReactNode
  value?: string
}

export default function Button({
  name,
  callback,
  text,
  color,
  disabled,
  children,
  value
}: ButtonProps) {
  return (
    <button
      className={`button button--${name}`}
      style={{ 'backgroundColor': color }}
      value={value}
      onClick={callback}
      disabled={disabled}
    >
      {text} {children}
    </button>
  )
}


