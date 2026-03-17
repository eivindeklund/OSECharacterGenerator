import type { FieldData } from '../buildFieldData'
import './PuristWebSheet.css'
import PuristWebSheetPage1 from './PuristWebSheetPage1'
import PuristWebSheetPage2 from './PuristWebSheetPage2'
import AbilitiesBox from './sections/AbilitiesBox'
import AbilityScoresSection from './sections/AbilityScoresSection'
import CoinsSection from './sections/CoinsSection'
import CombatSection from './sections/CombatSection'
import DescriptionSection from './sections/DescriptionSection'
import EncounterSection from './sections/EncounterSection'
import EncumbranceSection from './sections/EncumbranceSection'
import EquipmentSection from './sections/EquipmentSection'
import ExplorationSection from './sections/ExplorationSection'
import IdentitySection from './sections/IdentitySection'
import LanguagesSection from './sections/LanguagesSection'
import MagicItemsSection from './sections/MagicItemsSection'
import MovementSection from './sections/MovementSection'
import OtherNotesSection from './sections/OtherNotesSection'
import SavingThrowsSection from './sections/SavingThrowsSection'
import TreasureSection from './sections/TreasureSection'
import WeaponsArmourSection from './sections/WeaponsArmourSection'
import XPSection from './sections/XPSection'

type PuristWebSheetProps = {
  data: FieldData
}

export default function PuristWebSheet({ data }: PuristWebSheetProps) {
  const s = (key: string) => String(data[key] ?? '')
  const b = (key: string) => Boolean(data[key])

  return (
    <div className="ps-screen">
      <PuristWebSheetPage1>
        <IdentitySection
          name={s('Name')}
          characterClass={s('Character Class')}
          alignment={s('Alignment')}
          level={s('Level')}
        />
        <AbilityScoresSection
          str={s('STR')}
          int={s('INT')}
          wis={s('WIS')}
          dex={s('DEX')}
          con={s('CON')}
          cha={s('CHA')}
        />
        <SavingThrowsSection
          death={s('Death Save')}
          wands={s('Wands Save')}
          paralysis={s('Paralysis Save')}
          breath={s('Breath Save')}
          spells={s('Spells Save')}
          wisMod={s('Magic Save Mod')}
        />
        <DescriptionSection descriptionText={s('Description')} />
        <CombatSection
          hp={s('HP')}
          maxHp={s('Max HP')}
          conMod={s('CON HP Mod')}
          ac={s('Ascending AC')}
          unarmouredAc={s('Ascending Unarmoured AC')}
          dexAcMod={s('DEX AC Mod')}
          attackBonus={s('Attack Bonus')}
          strMeleeMod={s('STR Melee Mod')}
          dexMissileMod={s('DEX Missile Mod')}
        />
        <EncounterSection
          initDexMod={s('Initiative DEX Mod')}
          chaReactionMod={s('Reactions CHA Mod')}
        />
        <ExplorationSection
          listenAtDoor={s('Listen at Door')}
          openDoor={s('Open Stuck Door')}
          findSecretDoor={s('Find Secret Door')}
          findRoomTrap={s('Find Room Trap')}
        />
        <AbilitiesBox abilitiesText={s('Abilities, Skills, Weapons')} />
        <MovementSection
          overland={s('Overland Movement')}
          exploration={s('Exploration Movement')}
          encounter={s('Encounter Movement')}
        />
        <LanguagesSection
          languages={s('Languages')}
          literate={b('Literacy')}
        />
      </PuristWebSheetPage1>
      <PuristWebSheetPage2>
        <EquipmentSection equipment={s('Equipment')} />
        <WeaponsArmourSection weaponsArmour={s('Weapons and Armour')} />
        <MagicItemsSection />
        <TreasureSection />
        <OtherNotesSection notes={s('Notes')} />
        <CoinsSection gp={s('GP')} />
        <EncumbranceSection equipmentEncumbrance={s('Equipment Encumbrance')} />
        <XPSection
          xpForNextLevel={s('XP for Next Level')}
          xpBonus={s('PR XP Bonus')}
        />
      </PuristWebSheetPage2>
    </div>
  )
}
