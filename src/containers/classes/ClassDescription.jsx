import PropTypes from 'prop-types';
import ListItem from '../../components/general/ListItem';

export default function ClassDescription(props) {
  const { characterClass } = props

  const primeReqString = characterClass.primeReqs.join(', ')
  const langString = ['Alignment', 'Common'].concat(characterClass.languages).join(', ');
  const classDescriptionValues = {
    'Prime Requisites': primeReqString,
    'Hit Dice': `d${characterClass.hd}`,
    Armour: characterClass.armour,
    Weapons: characterClass.weapons,
    'Special Abilities': `${characterClass.abilities.join(', ')}`,
    Languages: langString,
    'XP to level 2': characterClass.nextLevel,
    'Maximum Level': characterClass.maxLevel,
    'Saving Throws': `Death ${characterClass.savingThrows[0]}, 
    Wands ${characterClass.savingThrows[1]}, Paralysis ${characterClass.savingThrows[2]}, 
    Breath Attacks ${characterClass.savingThrows[3]}, Spells ${characterClass.savingThrows[4]}`
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

ClassDescription.propTypes = {
  characterClass: PropTypes.object
}
