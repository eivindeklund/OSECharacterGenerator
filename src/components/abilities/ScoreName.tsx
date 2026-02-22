import { Trans } from 'react-i18next'

type ScoreNameProps = {
  abilityScoreName: string
  xpModifierPercentage?: string
  showXPModifier?: boolean
}

export default function ScoreName(props: ScoreNameProps) {
  const { abilityScoreName, xpModifierPercentage, showXPModifier } = props

  return (
    <div className='ability-score-name'>
      <h2>
        <Trans i18nKey={`abilityScoreNames.${abilityScoreName}`}></Trans>
      </h2>

      {showXPModifier && <div className='prime-req'>XP modifier: {xpModifierPercentage}</div>}
    </div>
  )
}


