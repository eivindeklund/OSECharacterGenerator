import React from 'react';
import ListItem from '../../components/general/ListItem';
import type { AbilityScores, ClassOptionsData } from '../../types';
import { formatXpBonusRuleClauses, type XpBonusClauseDisplay } from '../../utilities/XpBonusFormatter';

type ClassDescriptionProps = {
  characterClass: ClassOptionsData;
  abilityScores?: AbilityScores | null;
}

/** Renders a single XP bonus clause, bolding it if active. */
function XpClauseSpan({ clause }: { clause: XpBonusClauseDisplay }) {
  return clause.active
    ? <strong>{clause.text}</strong>
    : <span>{clause.text}</span>;
}

export default function ClassDescription(props: ClassDescriptionProps) {
  const { characterClass, abilityScores } = props

  const primeReqString = characterClass.primeReqs.join(', ')
  const langString = ['Alignment', 'Common'].concat(characterClass.languages).join(', ');
  const saves = characterClass.getSavingThrowsAtLevel(1)
  const classDescriptionValues = {
    'Prime Requisites': primeReqString,
    'Hit Dice': `d${characterClass.hd}`,
    Armour: characterClass.armour,
    Weapons: characterClass.weapons,
    'Special Abilities': characterClass.abilities.map((a) => a.name).join(', '),
    Languages: langString,
    'XP to level 2': characterClass.levelProgression?.levels[1]?.xp ?? 0,
    'Maximum Level': characterClass.maxLevel,
    'Saving Throws': `Death ${saves[0]}, 
    Wands ${saves[1]}, Paralysis ${saves[2]}, 
    Breath Attacks ${saves[3]}, Spells ${saves[4]}`
  }

  return (
    <div className='class-description-container'>
      <ul className='class-description-list'>
        <li className='class-description-list-item'>
          <b>Description:</b>
          <p className='class-description--summary'>
            {characterClass.description}
          </p>
        </li>
        {Object.keys(classDescriptionValues).map((key) => {
          return (
            <ListItem
              type={key}
              key={key}
              value={classDescriptionValues[key].toString()}
            ></ListItem>
          )
        })}
        {characterClass.xpBonusRule && (() => {
          const clauses = formatXpBonusRuleClauses(
            characterClass.xpBonusRule,
            abilityScores ?? null,
          );
          return (
            <li className='class-description-list-item'>
              <b>XP Bonus Rule:</b>
              <p className='class-description--xp-bonus-rule'>
                {clauses.map((clause, i) => (
                  <React.Fragment key={clause.text}>
                    {i > 0 && '; '}
                    <XpClauseSpan clause={clause} />
                  </React.Fragment>
                ))}
              </p>
            </li>
          );
        })()}
        <li className='class-description-list-item'>
          <b>
            <a
              href={characterClass.link}
              target='_blank'
              rel='noopener noreferrer'
            >
              More Details
            </a>
          </b>
        </li>
      </ul>
    </div>
  )
}


