import type { ChangeEvent, MouseEventHandler } from 'react'
import Arrow from '../../components/abilities/Arrow'
import { greenSuccess, redFail } from '../../constants/constants'
import type { ClassOptionsData } from '../../types'

type ScoreBoxProps = {
  abilityScoreName: string
  abilityScoreValue: number
  abilityScoreValueOriginal: number
  characterClass: Pick<ClassOptionsData, 'name' | 'primeReqs'>
  scoreIncrease: (name: string) => void
  scoreDecrease: (name: string) => void
  canDecrease: boolean
  pointBuy: number
  rollAttribute: (attrOrEvent: string | ChangeEvent<HTMLInputElement>, optionalInput?: string) => void
}

export default function ScoreBox(props: ScoreBoxProps) {
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
        onClick={rollAttribute as unknown as MouseEventHandler<HTMLButtonElement>}
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


