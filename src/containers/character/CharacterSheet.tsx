import React from 'react';
import { Trans } from 'react-i18next';
import type {
  AbilityScores,
  Character,
  CharacterEquipment,
  CharacterModifiers,
  CharacterStatistics,
  ClassOptionsData,
  SpellSlotTable,
} from '../../types';
import { getAbilitiesForLevel } from '../../utilities/classAbilities';
import { allItemsById } from '../../utilities/PackUtils';
import { consolidateDuplicates } from '../../utilities/utilities';

interface CharacterSheetProps {
  abilityScores: AbilityScores;
  character: Character;
  characterStatistics: CharacterStatistics;
  characterClass: ClassOptionsData;
  characterEquipment: CharacterEquipment;
  characterModifiers: CharacterModifiers;
  spellSlotTables: SpellSlotTable[];
}

const CharacterSheet = React.forwardRef<HTMLDivElement, CharacterSheetProps>((props, ref) => {
  const {
    abilityScores,
    character,
    characterStatistics,
    characterClass,
    characterEquipment,
    characterModifiers,
    spellSlotTables,
  } = props

  const alignmentCapitalized = character.alignment
    ? character.alignment.charAt(0).toUpperCase() + character.alignment.slice(1)
    : 'Alignment'

  const languageText = character.hasLanguages
    ? `${alignmentCapitalized}, Common, ${character.languages.join(', ')}`
    : `${alignmentCapitalized}, Common`

  const characterFields: [string, string, string | null | undefined][] = [
    ['Description', 'description', character.description],
    ['Background Skill', 'background-skill', character.background],
    ['Appearance', 'appearance', character.appearance],
    ['Personality', 'personality', character.personality],
    ['Misfortune', 'misfortune', character.misfortune],
    ['Languages', 'languages', languageText]
  ]

  const getCharacterFields = () => {
    return characterFields
      .filter(([, , fieldValue]) => fieldValue)
      .map(([fieldDescription, fieldName, fieldValue]) => {
        return (
          <div
            key={fieldDescription}
            className={`character-container character-container-${fieldName}`}
          >
            <span className='charsheet-value-name'>{fieldDescription}</span>
            <span className='charsheet-value'>{fieldValue}</span>{' '}
          </div>
        )
      })
  }


  // TODO: There are "?? 1" below; these are a buggy band-aid for the fact that
  // some code paths possibly allow characterStatistics.level to be undefined.
  // We should fix those code paths and remove the need for this
  // default.
  return (
    <div ref={ref} className='character-sheet-component'>
      {/* <h3 className="header-default">
        <Trans i18nKey={"characterSheet"}></Trans>
      </h3> */}
      <h3 className='character--name'>{character.name}</h3>
      <h4 className='character--subheader'> Level {characterStatistics.level ?? 1} {characterClass.name}</h4>
      <div className='character-sheet'>
        <div className='character-top-container'>{getCharacterFields()}</div>

        <div className='ability-scores-container'>
          <div className='strength character-container'>
            <span className='charsheet-value-name'>
              <Trans i18nKey={'abilityScoreNames.strength'}>Strength</Trans>
            </span>
            <span className='charsheet-value'>
              {' '}
              {abilityScores.strength}
              {characterModifiers.strengthModMelee !== '0' && (
                <span> ({characterModifiers.strengthModMelee})</span>
              )}
            </span>
          </div>

          <div className='intelligence character-container'>
            <span className='charsheet-value-name'>
              <Trans i18nKey={'abilityScoreNames.intelligence'}>
                Intelligence
              </Trans>
            </span>
            <span className='charsheet-value'>
              {' '}
              {abilityScores.intelligence}{' '}
            </span>
          </div>

          <div className='wisdom character-container'>
            <span className='charsheet-value-name'>
              <Trans i18nKey={'abilityScoreNames.wisdom'}>Wisdom</Trans>
            </span>
            <span className='charsheet-value'>
              {' '}
              {abilityScores.wisdom}
              {characterModifiers.wisdomMod !== '0' && (
                <span> ({characterModifiers.wisdomMod})</span>
              )}
            </span>
          </div>

          <div className='dexterity character-container'>
            <span className='charsheet-value-name'>
              <Trans i18nKey={'abilityScoreNames.dexterity'}>Dexterity</Trans>
            </span>
            <span className='charsheet-value'>
              {' '}
              {abilityScores.dexterity}
              {characterModifiers.dexterityModMissiles !== '0' && (
                <span> ({characterModifiers.dexterityModMissiles})</span>
              )}
            </span>
          </div>

          <div className='constitution character-container'>
            <span className='charsheet-value-name'>
              <Trans i18nKey={'abilityScoreNames.constitution'}>
                Constitution
              </Trans>
            </span>
            <span className='charsheet-value'>
              {' '}
              {abilityScores.constitution}
              {characterModifiers.constitutionMod !== '0' && (
                <span> ({characterModifiers.constitutionMod})</span>
              )}
            </span>
          </div>

          <div className='charisma character-container'>
            <span className='charsheet-value-name'>
              <Trans i18nKey={'abilityScoreNames.charisma'}>Charisma</Trans>
            </span>
            <span className='charsheet-value'>
              {' '}
              {abilityScores.charisma}
              {characterModifiers.charismaModNPCReactions !== '0' && (
                <span> ({characterModifiers.charismaModNPCReactions})</span>
              )}
            </span>
          </div>
        </div>

        <div className='charsheet-saving-throws-container'>
          <div className='character-container'>
            <span className='charsheet-value-name'>THAC0</span>
            <span className='charsheet-value'>
              {characterClass.getThac0AtLevel(characterStatistics.level ?? 1)}
            </span>
          </div>

          <div className='character-container'>
            <span className='charsheet-value-name'>Saving Throws</span>
            <span className='charsheet-value charsheet-value--saving-throws'>
              {(() => {
                // TODO: The ?? 1 below is a buggy band-aid for the fact that some code
                // paths possibly allow characterStatistics.level to be undefined.
                // We should fix those code paths and remove the need for this
                // default.
                const saves = characterClass.getSavingThrowsAtLevel(characterStatistics.level ?? 1);
                return (
                  <>
                    <div>
                      <span>Death</span> <span>{saves[0]}</span>
                    </div>
                    <div>
                      <span>Wands</span> <span>{saves[1]}</span>
                    </div>
                    <div>
                      <span>Paralysis</span>{' '}
                      <span>{saves[2]}</span>
                    </div>
                    <div>
                      <span>Breath</span>{' '}
                      <span>{saves[3]}</span>
                    </div>
                    <div>
                      <span>Spells</span>{' '}
                      <span>{saves[4]}</span>
                    </div>
                  </>
                );
              })()}
            </span>
          </div>

          <div className='character-container'>
            <span className='charsheet-value-name'>Abilities</span>
            <span className='charsheet-value character-sheet--class-ability'>
              <ul>
                {getAbilitiesForLevel(characterClass.abilities, characterStatistics.level ?? 1).map((ability) => {
                  // TODO: The ?? 1 above is a buggy band-aid for the fact that some code
                  // paths possibly allow characterStatistics.level to be undefined.
                  // We should fix those code paths and remove the need for this
                  // default.
                  return (
                    <li key={ability.name} className='character-sheet--class-ability'>
                      {' '}
                      <strong>{ability.name}</strong>
                      {ability.description && `: ${ability.description}`}
                      {' '}
                    </li>
                  )
                })}
              </ul>
            </span>
          </div>

          {(() => {
            // TODO: The ?? 1 below is a buggy band-aid for the fact that some code
            // paths possibly allow characterStatistics.level to be undefined.
            // We should fix those code paths and remove the need for this
            // default.
            const slots = characterClass.getSpellSlotsAtLevel(characterStatistics.level ?? 1, spellSlotTables);
            const hasAnySlot = slots.some((s) => s > 0);
            if (!hasAnySlot) return null;
            const SLOT_LABELS = ['1st', '2nd', '3rd', '4th', '5th', '6th'];
            return (
              <div className='character-container'>
                <span className='charsheet-value-name'>Spell Slots</span>
                <span className='charsheet-value charsheet-value--spell-slots'>
                  {slots.map((count, i) =>
                    count > 0 ? (
                      <div key={i}>
                        <span>{SLOT_LABELS[i]}</span> <span>{count}</span>
                      </div>
                    ) : null
                  )}
                </span>
              </div>
            );
          })()}

          {characterStatistics.hasSpells && (
            <div className='character-container'>
              <span className='charsheet-value-name'>Spells</span>
              <span className='charsheet-value character-sheet--class-ability'>
                {characterStatistics.spells && characterStatistics.spells.length > 0
                  ? characterStatistics.spells.join(', ')
                  : ''}
              </span>
            </div>
          )}
        </div>

        <div className='character-sheet-ability-list'>
          <div className='hit-points character-container'>
            <span className='charsheet-value-name'>Hit Points</span>{' '}
            <span className='charsheet-value'>
              {characterStatistics.hitPoints}
            </span>
          </div>
          <div className='armor-class character-container'>
            <span className='charsheet-value-name'>Armour Class</span>{' '}
            <span className='charsheet-value'>
              {characterStatistics.armourClass}
            </span>
          </div>
          <div className='character-container'>
            <span className='charsheet-value-name'>Weapons</span>

            <span className='charsheet-value charsheet--weapons'>
              {consolidateDuplicates(characterEquipment.weapons).map(({ id, count }, index) => {
                // TODO: If id does not exist, that should ideally be reported to some kind of monitoring service
                // TODO: The only non-bug case where an id might not exist is if
                // the data was loaded and our available ids has changed.  We
                // should scrub the data on load rather than being tolerant
                // here.
                const name = allItemsById[id]?.name ?? id
                const label = count > 1 ? `${name} (x${count})` : name
                return (
                  <span key={index} className='charsheet--weapon-item'>
                    {' '}
                    {label}{' '}
                  </span>
                )
              })}
            </span>
          </div>

          <div className='character-container'>
            <span className='charsheet-value-name'>Armour</span>

            <span className='charsheet-value charsheet--armour'>
              {characterEquipment.armour.map((id, index) => {
                // TODO: If id does not exist, that should ideally be reported to some kind of monitoring service
                // TODO: The only non-bug case where an id might not exist is if
                // the data was loaded and our available ids has changed.  We
                // should scrub the data on load rather than being tolerant
                // here.
                const name = allItemsById[id]?.name ?? id
                return (
                  <span key={index} className='charsheet--armour-item'>
                    {' '}
                    {name}{' '}
                  </span>
                )
              })}
            </span>
          </div>

          <div className='character-container'>
            <span className='charsheet-value-name'>Gear</span>

            <span className='charsheet-value charsheet--gear'>
              {consolidateDuplicates(characterEquipment.adventuringGear).map(
                ({ id, count }, index) => {
                  // TODO: If id does not exist, that should ideally be reported to some kind of monitoring service
                  // TODO: The only non-bug case where an id might not exist is if
                  // the data was loaded and our available ids has changed.  We
                  // should scrub the data on load rather than being tolerant
                  // here.
                  const name = allItemsById[id]?.name ?? id
                  const label = count > 1 ? `${name} (x${count})` : name
                  return (
                    <span key={index} className='charsheet--gear-item'>
                      {' '}
                      {label}{' '}
                    </span>
                  )
                }
              )}
            </span>
          </div>

          <div className='character-container'>
            <span className='charsheet-value-name'>Gold</span>

            <span className='charsheet-value charsheet--gold'>
              {characterEquipment.gold}gp
            </span>
          </div>
        </div>
      </div>
    </div>
  )
})

CharacterSheet.displayName = 'Character Sheet'

export default CharacterSheet
