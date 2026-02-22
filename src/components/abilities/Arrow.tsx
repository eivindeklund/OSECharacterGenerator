import React from 'react'

type ArrowProps = {
  abilityScoreName: string
  direction: string
  callBack: (name: string) => void
}

export default function Arrow(props: ArrowProps) {
  const { abilityScoreName, direction, callBack } = props

  let classDirection

  if (direction === 'up') {
    classDirection = 'increase'
  } else {
    classDirection = 'decrease'
  }

  return (
    <div
      className={`button button--ability button--ability--${classDirection}`}
      onClick={(e) => {
        e.stopPropagation()
        callBack(abilityScoreName)
      }}
    >
      <div className={`arrow-${direction}`}></div>
    </div>
  )
}


