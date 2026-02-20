import React from 'react'
import ScoreBox from '../../containers/abilties/ScoreBox'
import AbilityScoreMod from './AbilityScoreMod'
import ScoreName from './ScoreName'

import type {
  ClassOptionsData
} from '../../types'

export interface AbilityScoresRowProps {
  abilityScoreName: string;
  abilityScoreValue: number | null;
  abilityScoreValueOriginal: number | null;
  scoreIncrease: (key: string) => void;
  scoreDecrease: (key: string) => void;
  canDecrease: boolean;
  characterClass: Pick<ClassOptionsData, 'name' | 'primeReqs'>; // TODO: See if we can get rid of name | primeReqs and just pass the whole class here
  pointBuy: number;
  primeReq: string;
  modArray: { text: string; value: string }[];  // TODO: Maybe import type from character modifiers instead of defining here
  rollAttribute: (attrOrEvent: string | React.ChangeEvent<HTMLInputElement>, optionalInput?: string) => void;
}

export default function AbilityScoresRow(props: AbilityScoresRowProps) {
  const {
    abilityScoreName,
    abilityScoreValue,
    abilityScoreValueOriginal,
    scoreIncrease,
    scoreDecrease,
    canDecrease,
    characterClass,
    pointBuy,
    primeReq,
    modArray,
    rollAttribute
  } = props

  const showPrimeReq = !!characterClass.primeReqs?.includes(abilityScoreName)

  return (
    <React.Fragment>
      <ScoreName
        abilityScoreName={abilityScoreName}
        primeReq={primeReq}
        showPrimeReq={showPrimeReq}
      ></ScoreName>

      <ScoreBox
        abilityScoreValue={abilityScoreValue}
        abilityScoreValueOriginal={abilityScoreValueOriginal}
        abilityScoreName={abilityScoreName}
        scoreIncrease={scoreIncrease}
        scoreDecrease={scoreDecrease}
        canDecrease={canDecrease}
        characterClass={characterClass}
        pointBuy={pointBuy}
        rollAttribute={rollAttribute}
      ></ScoreBox>

      <AbilityScoreMod modArray={modArray}></AbilityScoreMod>
    </React.Fragment>
  )
}
