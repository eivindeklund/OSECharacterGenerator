import React from 'react'
import { consolidateDuplicates } from '../../utilities/utilities'

type BackpackProps = {
  itemType: string
  items: string[]
  onItemAction: (item: string, action: string, itemType: string) => void
}

export default function Backpack(props: BackpackProps) {
  const { onItemAction, items, itemType } = props
  return (
    <div className={`backpack backpack--${itemType}`}>
      {consolidateDuplicates(items).map((item, index) => {
        return (
          <li
            className={`backpack-item backpack-item--${itemType}`}
            value={item}
            key={index}
          >
            {item}
            <button
              className={`button button--equipment button--${itemType}`}
              value={item}
              onClick={() => onItemAction(item, 'sell', itemType)}
            >
              Sell
            </button>
          </li>
        )
      })}
    </div>
  )
}


