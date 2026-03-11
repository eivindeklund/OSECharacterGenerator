import { allItemsById } from '../../utilities/PackUtils'
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
      {consolidateDuplicates(items).map(({ id, count }, index) => {
        // TODO: If id does not exist, that should ideally be reported to some kind of monitoring service
        const name = allItemsById[id]?.name ?? id
        const label = count > 1 ? `${name} (x${count})` : name
        return (
          <li
            className={`backpack-item backpack-item--${itemType}`}
            value={id}
            key={index}
          >
            {label}
            <button
              className={`button button--equipment button--${itemType}`}
              value={id}
              onClick={() => onItemAction(id, 'sell', itemType)}
            >
              Sell
            </button>
          </li>
        )
      })}
    </div>
  )
}


