import React from 'react'
import type { ClassOptionsData } from '../../types'

type ClassAbilitiesListProps = {
  characterClass: ClassOptionsData
}

export default function ClassAbilitiesList({ characterClass }: ClassAbilitiesListProps) {
  return (
    <div className='class-ability-menu--abilities'>
      <ul className='class-ability-list'>
        {characterClass.abilities.map((item) => {
          return (
            <li key={item} className='class-ability'>
              {item}
            </li>
          )
        })}
      </ul>
    </div>
  )
}


