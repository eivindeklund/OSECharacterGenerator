import React from 'react'

type ListItemProps = {
  type: string
  value: string
}

export default function ListItem({ type, value }: ListItemProps) {
  return (
    <li className={`list-item list-item--${type}`}>
      <b>{type}:</b> {value}
    </li>
  )
}


