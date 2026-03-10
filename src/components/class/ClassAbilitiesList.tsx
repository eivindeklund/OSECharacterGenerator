import React from 'react'
import type { ClassOptionsData } from '../../types'
import { getAbilitiesForLevel } from '../../utilities/classAbilities'

type ClassAbilitiesListProps = {
  characterClass: ClassOptionsData
  level?: number
}

export default function ClassAbilitiesList({ characterClass, level = 1 }: ClassAbilitiesListProps) {
  const abilities = getAbilitiesForLevel(characterClass.abilities, level)
  return (
    <div className='class-ability-menu--abilities'>
      <ul className='class-ability-list'>
        {abilities.map((ability) => {
          return (
            <li key={ability.name} className='class-ability'>
              <strong>{ability.name}</strong>
              {ability.description && `: ${ability.description}`}
            </li>
          )
        })}
      </ul>
    </div>
  )
}


