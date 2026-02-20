import share_icon from '../../img/share.svg';
import type { CharacterSetters, ScreenState, StoredCharacterData } from '../../types';
import ShareService from '../../utilities/ShareService';

interface CharacterStorageProps {
  screen: ScreenState;
  setScreen: (screen: ScreenState) => void;
  characterSetters: CharacterSetters;
  storedCharacters: StoredCharacterData[];
  deleteStoredCharacter: (id: string | null) => void;
}

export default function CharacterStorage(props: CharacterStorageProps) {
  const {
    screen,
    setScreen,
    characterSetters,
    storedCharacters,
    deleteStoredCharacter
  } = props

  const {
    setCharacter,
    setAbilityScores,
    setCharacterStatistics,
    setCharacterClass,
    setCharacterEquipment,
    setCharacterModifiers,
    setCharacterRolled,
  } = characterSetters

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

      case 'shareCharacter':
        const url = ShareService.generateShareUrl(characterObject)
        if (url) {
          navigator.clipboard.writeText(url).then(() => {
            alert('Character URL copied to clipboard!')
          }, (err) => {
            console.error('Could not copy text: ', err)
            alert('Failed to copy URL to clipboard.')
          })
        }
        break

      default:
    }
  }

  const characterButton = (char, index) => {
    const characterStorageName = char.character.name

    return (
        <div
          className='character-button button'
          onClick={(e) => handleCharacter(e, index, 'setActiveCharacter')}
          value={index}
          name='setActiveCharacter'
          style={{ cursor: 'pointer' }}
        >
          <div className='character-button--name' value={index}>
            {characterStorageName}
          </div>
          <div className='character-button--level' value={index}>
            {char.characterClass.name}
          </div>
        <button
          onClick={(e) => handleCharacter(e, index, 'shareCharacter')}
          className='character-button--share'
          style={{ right: '25px', color:'black', borderColor: 'transparent', padding: '4px', margin: '0px', background: 'transparent' }}
          title="Share"
        >
          <img src={share_icon} width="15px" alt="Share Character" className="share-icon" />
        </button>
        <button
          onClick={(e) => handleCharacter(e, index, 'deleteCharacter')}
          className='character-button--delete'
          value={index}
          name='deleteCharacter'
        >
          x
        </button>
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
