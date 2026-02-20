import PropTypes from 'prop-types'
import Arrow from '../../components/abilities/Arrow'
import { greenSuccess, redFail } from '../../constants/constants'
export default function ScoreBox(props) {
  const {
    abilityScoreValue,
    abilityScoreValueOriginal,
    abilityScoreName,
    scoreIncrease,
    scoreDecrease,
    canDecrease,
    characterClass,
    pointBuy,
    rollAttribute
  } = props

  const lowScore = 6
  const highScore = 15
  const maxScore = 18
  const minimumDecrementRequirement = 10

  let showIncrementButton = false

  const hasPointstoIncrease =
    characterClass.primeReqs?.includes(abilityScoreName) ||
    abilityScoreValue < abilityScoreValueOriginal

  if (pointBuy > 0 && hasPointstoIncrease && abilityScoreValue < maxScore) {
    showIncrementButton = true
  }

  const showDecreaseButton =
    abilityScoreValue > minimumDecrementRequirement && canDecrease

  // determine text color for ability score

  let buttonColor

  if (abilityScoreValue > 0 && abilityScoreValue <= lowScore) {
    buttonColor = redFail
  }

  if (abilityScoreValue >= highScore) {
    buttonColor = greenSuccess
  }

  // make whole thing container, remove pieces from it, make them components

  const scoreFontSize = abilityScoreValue > 0 ? '30px' : '20px'

  return (
    <div
      className={`ability-score ${
        abilityScoreValue > highScore ? 'ability-score--high' : ''
      }`}
      style={{ color: buttonColor, fontSize: scoreFontSize }}
    >
      <button
        className="ability-score--value-button"
        value={`${abilityScoreName}`}
        onClick={rollAttribute}
        style={{ color: buttonColor, fontSize: scoreFontSize }}
      >
        {abilityScoreValue > 1 ? abilityScoreValue : '?'}
      </button>

      {showDecreaseButton && (
        <Arrow
          abilityScoreName={abilityScoreName}
          direction={'down'}
          callBack={scoreDecrease}
        ></Arrow>
      )}

      {showIncrementButton && (
        <Arrow
          abilityScoreName={abilityScoreName}
          direction={'up'}
          callBack={scoreIncrease}
        ></Arrow>
      )}
    </div>
  )
}

ScoreBox.propTypes = {
  abilityScoreName: PropTypes.string,
  abilityScoreValueOriginal: PropTypes.number,
  characterClass: PropTypes.object,
  abilityScoreValue: PropTypes.number,
  AbilityScoreValueOriginal: PropTypes.number,
  scoreIncrease: PropTypes.func,
  scoreDecrease: PropTypes.func,
  canDecrease: PropTypes.bool,
  pointBuy: PropTypes.number,
  rollAttribute: PropTypes.func
}
