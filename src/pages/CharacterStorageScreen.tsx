import type { Dispatch, SetStateAction } from 'react'
import Header from '../components/general/Header'
import CharacterStorage from '../containers/storage/CharacterStorage'
import type {
  ScreenState,
  StoredCharacterData,
} from '../types'

type CharacterStorageScreenProps = {
  screen: ScreenState
  setScreen: Dispatch<SetStateAction<ScreenState>>
  loadCharacter: (data: StoredCharacterData) => void
  setCharacterRolled: Dispatch<SetStateAction<boolean>>
  storedCharacters: StoredCharacterData[]
  deleteStoredCharacter: (id: string) => void
}

export default function CharacterStorageScreen (props: CharacterStorageScreenProps) {
  const {
    screen,
    setScreen,
    loadCharacter,
    setCharacterRolled,
    storedCharacters,
    deleteStoredCharacter
  } = props

  return (
    <div className='character-storage-screen'>
      <Header name='tavern' text='tavern'></Header>
      <CharacterStorage
        screen={screen}
        setScreen={setScreen}
        loadCharacter={loadCharacter}
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


