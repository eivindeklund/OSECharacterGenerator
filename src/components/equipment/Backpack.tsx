import React from 'react'
import { joinDuplicates } from '../../utilities/utilities'

type BackpackProps = {
  itemType: string
  items: string[]
  storeHandler: (item: string, action: string, itemType: string) => void
}

export default function Backpack(props: BackpackProps) {
  const { storeHandler, items, itemType } = props
  return (
    <div className={`backpack backpack--${itemType}`}>
      {joinDuplicates(items).map((item, index) => {
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
              onClick={() => storeHandler(item, 'sell', itemType)}
            >
              Sell
            </button>
          </li>
        )
      })}
    </div>
  )
}


