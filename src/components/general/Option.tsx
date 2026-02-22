import React from 'react'

type OptionProps = {
  value: string
}

export default function Option({ value }: OptionProps) {
  return (
    <option className={`option option--${value}`} value={value}>
      {value}
    </option>
  )
}


