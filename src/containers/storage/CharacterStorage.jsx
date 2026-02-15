import PropTypes from 'prop-types'

export default function CharacterStorage(props) {
  const {
    screen,
    setScreen,
    setCharacter,
    setAbilityScores,
    setCharacterStatistics,
    setCharacterClass,
    setCharacterEquipment,
    setCharacterModifiers,
    setCharacterRolled,
    storedCharacters,
    deleteStoredCharacter
  } = props

  const handleCharacter = (e, index, action) => {
    e.stopPropagation()

    const characterObject = storedCharacters[index]
    switch (action) {
      case 'setActiveCharacter':
        setCharacter(characterObject.character)
        setCharacterStatistics(characterObject.characterStatistics)
        setCharacterClass(characterObject.characterClass)
        setCharacterEquipment(characterObject.characterEquipment)
        setCharacterModifiers(characterObject.characterModifiers)
        setAbilityScores(characterObject.abilityScores)
        setCharacterRolled(true)

        setScreen({
          ...screen,
          characterSheetScreen: true,
          characterStorageScreen: false
        })

        break

      case 'deleteCharacter':
        deleteStoredCharacter(characterObject.character.id)
        break
      default:
    }
  }

  const characterButton = (char, index) => {
    const characterStorageName = char.character.name

    return (
      <div className='character-row' key={index}>
        <button
          className='character-button'
          onClick={(e) => handleCharacter(e, index, 'setActiveCharacter')}
          value={index}
          name='setActiveCharacter'
        >
          <div className='character-button--name' value={index}>
            {characterStorageName}
          </div>
          <div className='character-button--level' value={index}>
            {char.characterClass.name}
          </div>
        </button>

        <div
          onClick={(e) => handleCharacter(e, index, 'deleteCharacter')}
          className='character-button--delete'
          value={index}
          name='deleteCharacter'
        >
          x
        </div>
      </div>
    )
  }

  return (
    <div className='character-storage'>
      {storedCharacters
        ? storedCharacters.map((item, index) => characterButton(item, index))
        : ''}
    </div>
  )
}

CharacterStorage.propTypes = {
  screen: PropTypes.objectOf(PropTypes.bool),
  setScreen: PropTypes.func,
  setCharacter: PropTypes.func,
  setAbilityScores: PropTypes.func,
  setCharacterStatistics: PropTypes.func,
  setCharacterClass: PropTypes.func,
  setCharacterEquipment: PropTypes.func,
  setCharacterModifiers: PropTypes.func,
  setCharacterRolled: PropTypes.func,
  storedCharacters: PropTypes.array,
  deleteStoredCharacter: PropTypes.func
}
