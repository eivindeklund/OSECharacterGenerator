import { useNavigate } from 'react-router-dom'
import Header from '../components/general/Header'
import CharacterStorage from '../containers/storage/CharacterStorage'
import { useCharacter } from '../contexts/CharacterContext'

export default function CharacterStorageScreen () {
  const {
    loadCharacter,
    setCharacterRolled,
    storedCharacters,
    deleteStoredCharacter,
    partialCharacter,
    clearPartialCharacter,
  } = useCharacter()

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


