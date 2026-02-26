import type { Dispatch, SetStateAction } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/general/Header'
import CharacterStorage from '../containers/storage/CharacterStorage'
import type {
  StoredCharacterData,
} from '../types'

type CharacterStorageScreenProps = {
  loadCharacter: (data: StoredCharacterData) => void
  setCharacterRolled: Dispatch<SetStateAction<boolean>>
  storedCharacters: StoredCharacterData[]
  deleteStoredCharacter: (id: string) => void
  partialCharacter: StoredCharacterData | null
  clearPartialCharacter: () => void
}

export default function CharacterStorageScreen (props: CharacterStorageScreenProps) {
  const {
    loadCharacter,
    setCharacterRolled,
    storedCharacters,
    deleteStoredCharacter,
    partialCharacter,
    clearPartialCharacter,
  } = props

  const navigate = useNavigate()

  return (
    <div className='character-storage-screen'>
      <Header name='tavern' text='tavern'></Header>
      <CharacterStorage
        loadCharacter={loadCharacter}
        storedCharacters={storedCharacters}
        deleteStoredCharacter={deleteStoredCharacter}
        partialCharacter={partialCharacter}
        clearPartialCharacter={clearPartialCharacter}
      ></CharacterStorage>

      <button
        className='button--new-character'
        onClick={() => {
          setCharacterRolled(false)
          navigate('/')
        }}
      >
        Back to Main
      </button>
    </div>
  )
}


