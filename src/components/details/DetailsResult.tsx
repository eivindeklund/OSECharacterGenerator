
type DetailsResultProps = {
  name: string
  value: string
  callback: () => void
  className?: string
}

export default function DetailsResult({name, value, callback, className}: DetailsResultProps) {
  return (
    <div className={`details-result${className ? ` ${className}` : ''}`}>
      <span className='details-result--name'>{name}:</span>
      <span className='details-result--data'>{value}</span>
      <button
        type='button'
        className='button button--details-reroll'
        onClick={callback}
      >
        Reroll
      </button>
    </div>
  )
}


