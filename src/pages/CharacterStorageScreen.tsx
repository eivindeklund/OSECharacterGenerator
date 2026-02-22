import type { Dispatch, SetStateAction } from 'react'
import type {
  CharacterSetters,
  ScreenState,
  StoredCharacterData,
} from '../types'
import Header from '../components/general/Header'
import CharacterStorage from '../containers/storage/CharacterStorage'

type CharacterStorageScreenProps = {
  screen: ScreenState
  setScreen: Dispatch<SetStateAction<ScreenState>>
  characterSetters: CharacterSetters
  storedCharacters: StoredCharacterData[]
  deleteStoredCharacter: (id: string) => void
}

export default function CharacterStorageScreen (props: CharacterStorageScreenProps) {
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


