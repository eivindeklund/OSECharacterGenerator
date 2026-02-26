import { useState } from 'react';
import Modal from '../../components/general/Modal';
import share_icon from '../../img/share.svg';
import type { StoredCharacterData } from '../../types';
import ShareService from '../../utilities/ShareService';

interface CharacterStorageProps {
  loadCharacter: (data: StoredCharacterData) => void;
  storedCharacters: StoredCharacterData[];
  deleteStoredCharacter: (id: string | null) => void;
  partialCharacter?: StoredCharacterData | null;
  clearPartialCharacter?: () => void;
}

export default function CharacterStorage(props: CharacterStorageProps) {
  const {
    loadCharacter,
    storedCharacters,
    deleteStoredCharacter,
    partialCharacter,
    clearPartialCharacter,
  } = props

  const [pendingLoad, setPendingLoad] = useState<StoredCharacterData | null>(null);

  const handleCharacter = (e, index, action) => {
    e.stopPropagation()

    const characterObject = storedCharacters[index]
    switch (action) {
      case 'setActiveCharacter':
        loadCharacter(characterObject)
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

  const characterButton = (char: StoredCharacterData, index: number, isPartial = false) => {
    const characterStorageName = char.character.name
    const label = characterStorageName
      || (char.characterClass?.name ? char.characterClass.name : 'Unnamed')

    return (
        <div
          key={isPartial ? 'partial' : index}
          className={`character-button button${isPartial ? ' character-button--partial' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            if (!isPartial && partialCharacter) {
              setPendingLoad(char);
            } else {
              loadCharacter(char);
            }
          }}
          style={{ cursor: 'pointer' }}
        >
          {isPartial && (
            <span className='character-button--partial-badge'>In Progress</span>
          )}
          <div className='character-button--name'>
            {label}
          </div>
          <div className='character-button--level'>
            {char.characterClass.name || 'No class selected'}
          </div>
          {!isPartial && (
            <button
              onClick={(e) => handleCharacter(e, index, 'shareCharacter')}
              className='character-button--share'
              style={{ right: '25px', color:'black', borderColor: 'transparent', padding: '4px', margin: '0px', background: 'transparent' }}
              title="Share"
            >
              <img src={share_icon} width="15px" alt="Share Character" className="share-icon" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isPartial) {
                clearPartialCharacter?.();
              } else {
                deleteStoredCharacter(char.character.id);
              }
            }}
            className='character-button--delete'
          >
            x
          </button>
        </div>
    )
  }

  return (
    <>
      <div className='character-storage'>
        {partialCharacter && characterButton(partialCharacter, -1, true)}
        {storedCharacters
          ? storedCharacters.map((item, index) => characterButton(item, index))
          : ''}
      </div>
      <Modal
        isOpen={pendingLoad !== null}
        onClose={() => setPendingLoad(null)}
        title="Load Character?"
      >
        <p>You have an in-progress character. Loading this character will discard it.</p>
        <button
          onClick={() => {
            clearPartialCharacter?.();
            loadCharacter(pendingLoad!);
            setPendingLoad(null);
          }}
        >
          Load Character
        </button>
        <button onClick={() => setPendingLoad(null)}>Cancel</button>
      </Modal>
    </>
  )
}
