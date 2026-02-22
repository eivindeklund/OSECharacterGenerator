import { Dispatch, SetStateAction } from 'react';
import AbilityScoresRow from '../../components/abilities/AbilityScoresRow';
import Button from "../../components/general/Button";
import { abilityScoreNames } from '../../constants/constants';
import type {
  AbilityScores as AbilityScoresType,
  CharacterModifiers,
  ClassOptionsData,
  ScoreActions
} from '../../types';

interface AbilityScoresProps {
  abilityScores: AbilityScoresType;
  originalAbilityScores: AbilityScoresType;
  setAbilityScores: Dispatch<SetStateAction<AbilityScoresType>>;
  characterClass: Pick<ClassOptionsData, 'name' | 'primeReqs'>;
  pointBuy: number;
  setPointBuy: Dispatch<SetStateAction<number>>;
  characterModifiers: CharacterModifiers;
  scoreActions: ScoreActions;
  abilityScoresCanDecrease: AbilityScoresType;
}

export default function AbilityScores(props: AbilityScoresProps) {
  const {
    abilityScores,
    originalAbilityScores,
    characterClass,
    pointBuy,
    characterModifiers,
    scoreActions,
    abilityScoresCanDecrease
  } = props;
  const { rollAttribute, scoreIncrease, scoreDecrease } = scoreActions;
  const {
    xpModifierPercentage,
    strengthModMelee,
    strengthModDoors,
    intelligenceModLanguages,
    intelligenceModLiteracy,
    wisdomMod,
    dexterityModAC,
    dexterityModMissiles,
    dexterityModInitiative,
    constitutionMod,
    charismaModNPCReactions,
    charismaModRetainersMax,
    charismaModLoyalty
  } = characterModifiers

  const abilityScoreModDescriptions = {
    strength: [
      { text: 'Melee Attacks', value: strengthModMelee },
      { text: 'Doors', value: strengthModDoors }
    ],
    intelligence: [
      { text: 'Languages', value: intelligenceModLanguages },
      { text: 'Literacy', value: intelligenceModLiteracy }
    ],
    wisdom: [{ text: 'Magic Saves', value: wisdomMod }],
    dexterity: [
      { text: 'AC', value: dexterityModAC },
      { text: 'Missiles', value: dexterityModMissiles },
      { text: 'Initiative', value: dexterityModInitiative }
    ],
    constitution: [{ text: 'Hit Points', value: constitutionMod }],
    charisma: [
      { text: 'Reactions', value: charismaModNPCReactions },
      { text: 'Max Retainers', value: charismaModRetainersMax },
      { text: 'Loyalty', value: charismaModLoyalty }
    ]
  }

  return (
    <><div className="ability-score-roll-all-container">
      <Button name="reroll" value={"all"} callback={rollAttribute}>
        Roll All
      </Button>
    </div><div className='container ability-score-container'>
        {pointBuy > 0 && <div className='point-buy'>Point Buy: {pointBuy}</div>}

        {abilityScoreNames.map((abilityScoreName, index) => {
          return (
            <AbilityScoresRow
              key={index}
              abilityScoreName={abilityScoreName}
              xpModifierPercentage={xpModifierPercentage}
              abilityScoreValue={abilityScores[abilityScoreName]}
              abilityScoreValueOriginal={originalAbilityScores[abilityScoreName]}
              scoreIncrease={scoreIncrease}
              scoreDecrease={scoreDecrease}
              canDecrease={abilityScoresCanDecrease[abilityScoreName]}
              characterClass={characterClass}
              pointBuy={pointBuy}
              modArray={abilityScoreModDescriptions[abilityScoreName]}
              rollAttribute={rollAttribute}
            ></AbilityScoresRow>
          );
        })}

      </div></>
  )
}
