import React from 'react'

type AbilityScoreModProps = {
  modArray: Array<{ text: string; value: string | number }>
}

export default function AbilityScoreMod({ modArray }: AbilityScoreModProps) {
  return (
    <div className='ability-mod'>
      {modArray.map((item, index) => {
        return (
          <span key={index}>
            {item.text}: {item.value}
          </span>
        )
      })}
    </div>
  )
}


