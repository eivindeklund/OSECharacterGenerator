import { useState } from 'react';
import Modal from '../../components/general/Modal';
import share_icon from '../../img/share.svg';
import type { StoredCharacterData } from '../../types';
import { exportPartyAsPDF, SHEET_FORMAT_LABELS, SheetFormat } from '../../utilities/batchPDFExport';
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sheetFormat, setSheetFormat] = useState<SheetFormat>(SheetFormat.PuristAAC);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExportParty = async () => {
    const selected = storedCharacters.filter(c => c.character.id != null && selectedIds.has(c.character.id));
    await exportPartyAsPDF(selected, sheetFormat);
  };

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

    const charId = char.character.id
    const isSelected = charId != null && selectedIds.has(charId)

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
          {!isPartial && charId != null && (
            <input
              type='checkbox'
              className='character-button--select'
              checked={isSelected}
              aria-label={`Select ${label}`}
              onClick={(e) => e.stopPropagation()}
              onChange={() => toggleSelection(charId)}
            />
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
      {storedCharacters.length > 0 && (
        <fieldset className='print-party'>
          <legend className='print-party--legend'>Print Party</legend>
          <label className='print-party--format-label' htmlFor='print-party-format'>
            Sheet Format
          </label>
          <select
            id='print-party-format'
            className='print-party--format-select'
            value={sheetFormat}
            onChange={(e) => setSheetFormat(e.target.value as SheetFormat)}
          >
            {(Object.values(SheetFormat) as SheetFormat[]).map(fmt => (
              <option key={fmt} value={fmt}>{SHEET_FORMAT_LABELS[fmt]}</option>
            ))}
          </select>
          <button
            className='print-party--export-button'
            disabled={selectedIds.size === 0}
            onClick={handleExportParty}
          >
            Export as PDF
          </button>
        </fieldset>
      )}
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
