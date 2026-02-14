import PropTypes from "prop-types";
import React from "react";

export default function HPRoller(props) {
  const {
    characterClass,
    characterStatistics,
    characterModifiers,
    rollHP,
  } = props;

  const hitPoints = characterStatistics.hitPoints;
  const HPResult = characterStatistics.hpResult;
  const HPRolls = characterStatistics.hpRolls || 0;

  const canReroll =
    HPRolls < 2 && (HPResult === null || HPResult <= 2);


  return (
    <React.Fragment>
      <button
        className={`button button-primary button--hp ${
          canReroll ? "" : "opacity-0"
        }`}
        onClick={() => setTimeout(() => rollHP(), 200)}
        disabled={!canReroll}
        style={{
          fontSize: canReroll ? "" : "4rem",
        }}
      >
        {canReroll && `${HPRolls === 0 ? "Roll HP" : "Reroll?"}`}
        {!canReroll && hitPoints}
      </button>

      <div className="hp-container container">
        <div className="hp-container--hit-die">
          {hitPoints && <span>{HPResult}</span>}
          {!hitPoints && <span>d{characterClass.hd}</span>}

          {!hitPoints && (
            <div className="hp-container--hit-die-name">Hit Die</div>
          )}
          {hitPoints && (
            <div className="hp-container--hit-die-name">Rolled</div>
          )}
        </div>

        <div className="hp-container--math">+</div>

        <div className="hp-container--con-mod">
          {characterModifiers.constitutionMod}
          <div className="hp-container--con-mod-name">Con Mod</div>
        </div>

        <div className="hp-container--math">=</div>

        <div className="hp-container--hit-points">
          {hitPoints}
          <div className="hp-container--hit-points-name">Hit Points</div>
        </div>
      </div>
    </React.Fragment>
  );
}

HPRoller.propTypes = {
  diceEnabled: PropTypes.bool,
  screen: PropTypes.objectOf(PropTypes.bool),
  setScreen: PropTypes.func,
  characterClass: PropTypes.object,
  character: PropTypes.object,
  setCharacter: PropTypes.func,
  characterStatistics: PropTypes.shape({
    hitPoints: PropTypes.number,
    armourClass: PropTypes.number,
    spell: PropTypes.string,
    hasSpells: PropTypes.bool,
    unarmouredAC: PropTypes.number,
  }),
  setCharacterStatistics: PropTypes.func,
  characterModifiers: PropTypes.object,
  rollHP: PropTypes.func,
};
