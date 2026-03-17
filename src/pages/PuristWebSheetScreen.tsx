import { useEffect } from 'react'
import { buildFieldData } from '../containers/character/buildFieldData'
import PuristWebSheet from '../containers/character/purist-web-sheet/PuristWebSheet'
import { useCharacter } from '../contexts/CharacterContext'

export default function PuristWebSheetScreen() {
  const {
    character,
    characterStatistics,
    characterClass,
    characterEquipment,
    characterModifiers,
    abilityScores,
    characterRolled,
  } = useCharacter()

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href =
      'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap'
    document.head.appendChild(link)
    return () => {
      document.head.removeChild(link)
    }
  }, [])

  if (!characterRolled) return null

  const fieldData = buildFieldData({
    character,
    characterStatistics,
    characterClass,
    characterEquipment,
    characterModifiers,
    abilityScores,
  })

  return <PuristWebSheet data={fieldData} />
}
