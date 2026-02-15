import PropTypes from 'prop-types';

export default function ClassOptionsButton(props) {
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

ClassOptionsButton.propTypes = {
  characterClass: PropTypes.object,
  abilityScores: PropTypes.shape({
    strength: PropTypes.number,
    strengthOriginal: PropTypes.number,
    intelligence: PropTypes.number,
    intelligenceOriginal: PropTypes.number,
    wisdom: PropTypes.number,
    wisdomOriginal: PropTypes.number,
    dexterity: PropTypes.number,
    dexterityOriginal: PropTypes.number,
    constitution: PropTypes.number,
    constitutionOriginal: PropTypes.number,
    charisma: PropTypes.number,
    charismaOriginal: PropTypes.number
  }),
  changeCharacterClass: PropTypes.func
}
