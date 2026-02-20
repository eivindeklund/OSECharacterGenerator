import type { AbilityScores, ClassOptionsData } from '../../types';

interface ClassOptionsButtonProps {
  characterClass: ClassOptionsData;
  abilityScores: AbilityScores;
  changeCharacterClass: React.MouseEventHandler<HTMLButtonElement>;
  selected?: boolean;
}

export default function ClassOptionsButton(props: ClassOptionsButtonProps) {
  const { characterClass, abilityScores, changeCharacterClass, selected } = props

  return (
    <button
      className={`button button-class-option ${selected ? 'button--selected' : ''}`}
      value={characterClass.name}
      key={characterClass.name}
      onClick={changeCharacterClass}
      disabled={!characterClass.checkAbilityScoreRequirements(abilityScores)}
    >
      {characterClass.name}
    </button>
  )
}
