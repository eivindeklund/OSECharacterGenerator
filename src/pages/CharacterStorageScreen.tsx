import PropTypes from 'prop-types'
import Header from '../components/general/Header'
import CharacterStorage from '../containers/storage/CharacterStorage'

export default function CharacterStorageScreen (props) {
  const {
    screen,
    setScreen,
    characterSetters,
    storedCharacters,
    deleteStoredCharacter
  } = props

  const { setCharacterRolled } = characterSetters

  return (
    <div className='character-storage-screen'>
      <Header name='tavern' text='tavern'></Header>
      <CharacterStorage
        screen={screen}
        setScreen={setScreen}
        characterSetters={characterSetters}
        storedCharacters={storedCharacters}
        deleteStoredCharacter={deleteStoredCharacter}
      ></CharacterStorage>

      <button
        className='button--new-character'
        onClick={() => {
          setScreen({
            ...screen,
            abilityScreen: true,
            characterStorageScreen: false
          })
          setCharacterRolled(false)
        }}
      >
        Back to Main
      </button>
    </div>
  )
}

CharacterStorageScreen.propTypes = {
  screen: PropTypes.objectOf(PropTypes.bool),
  setScreen: PropTypes.func,
  characterSetters: PropTypes.shape({
    setCharacter: PropTypes.func,
    setAbilityScores: PropTypes.func,
    setCharacterStatistics: PropTypes.func,
    setCharacterClass: PropTypes.func,
    setCharacterEquipment: PropTypes.func,
    setCharacterModifiers: PropTypes.func,
    setCharacterRolled: PropTypes.func,
  }),
  storedCharacters: PropTypes.arrayOf(PropTypes.object),
  deleteStoredCharacter: PropTypes.func
}
