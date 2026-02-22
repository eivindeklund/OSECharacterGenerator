import React from 'react'

type DetailsResultProps = {
  name: string
  value: string
  callback: () => void
}

export default function DetailsResult({name, value, callback}: DetailsResultProps) {
  return (
    <div className='details-result'>
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


