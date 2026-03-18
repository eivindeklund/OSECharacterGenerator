import { useMemo, useState } from 'react';
import { useCampaign } from '../../contexts/CampaignContext';
import { allSpellsById } from '../../data/spells';
import type {
  CharacterModifiers,
  CharacterStatistics,
  ClassOptionsData,
} from '../../types';
import { getAbilitiesForLevel } from '../../utilities/classAbilities';
import {
  getAvailableSpellsAtTier,
  getSpellTiersGained,
} from '../../utilities/levelUpSpellUtils';
import { d } from '../../utilities/utilities';
import './LevelUpModal.css';

interface LevelUpModalProps {
  characterClass: ClassOptionsData;
  characterStatistics: CharacterStatistics;
  characterModifiers: CharacterModifiers;
  onConfirm: (hpGained: number, newSpells: string[]) => void;
  onCancel: () => void;
}

type ModalStep = 'hp' | 'spell' | 'summary';


const SAVE_LABELS = ['Death/Poison', 'Wands', 'Paralysis', 'Breath', 'Spells'];
const SPELL_LEVEL_LABELS = ['1st', '2nd', '3rd', '4th', '5th', '6th'];

export default function LevelUpModal({
  characterClass,
  characterStatistics,
  characterModifiers,
  onConfirm,
  onCancel,
}: LevelUpModalProps) {
  const currentLevel = characterStatistics.level ?? 1;
  const newLevel = currentLevel + 1;
  const conMod = parseInt(characterModifiers.constitutionMod) || 0;

  const { getSpellListsForClass, spellSlotTables } = useCampaign();

  const isRollLevel = characterClass.isHdRollLevel(newLevel);
  const fixedBonus   = characterClass.getHpBonusAtLevel(newLevel);

  const prevSaves = characterClass.getSavingThrowsAtLevel(currentLevel);
  const nextSaves = characterClass.getSavingThrowsAtLevel(newLevel);
  const prevThac0 = characterClass.getThac0AtLevel(currentLevel);
  const nextThac0 = characterClass.getThac0AtLevel(newLevel);
  const prevSlots = characterClass.getSpellSlotsAtLevel(currentLevel, spellSlotTables);
  const nextSlots = characterClass.getSpellSlotsAtLevel(newLevel, spellSlotTables);

  // Abilities newly available at newLevel
  const prevAbilities = getAbilitiesForLevel(characterClass.abilities, currentLevel);
  const nextAbilities = getAbilitiesForLevel(characterClass.abilities, newLevel);
  const newAbilities = nextAbilities.filter(
    (a) => !prevAbilities.some((p) => p.name === a.name)
  );

  // Spells that could be picked — one step per gained tier (0-indexed tiers, ascending)
  const spellTiersGained = useMemo(
    () => getSpellTiersGained(characterClass, currentLevel, newLevel, spellSlotTables),
    [characterClass, currentLevel, newLevel, spellSlotTables]
  );
  const needsSpellSelection = characterClass.limitedSpellSelection === true && spellTiersGained.length > 0;

  // Known spells before this level-up
  const knownSpells = characterStatistics.spells;

  // ── Local wizard state ────────────────────────────────────────────────────

  const [step, setStep] = useState<ModalStep>('hp');
  const [hpRoll, setHpRoll] = useState<number | null>(null);
  const [hpRerolls, setHpRerolls] = useState(0);
  // One entry per spell tier gained; null means not yet chosen for that step
  const [spellSelections, setSpellSelections] = useState<(string | null)[]>([]);
  // Which index in spellTiersGained we're currently picking for
  const [spellStepIndex, setSpellStepIndex] = useState(0);

  const currentSpellTier = spellTiersGained[spellStepIndex] ?? -1;
  const currentSpellSelection = spellSelections[spellStepIndex] ?? null;

  const availableSpells = useMemo(
    () => {
      if (currentSpellTier === -1 || !characterClass.limitedSpellSelection) return [];
      const byLevel = getSpellListsForClass(characterClass);
      // Only exclude spells chosen in *earlier* steps so the current step's
      // list stays stable while the player is picking.
      const alreadyPicked = spellSelections
        .slice(0, spellStepIndex)
        .filter((s): s is string => s !== null);
      return getAvailableSpellsAtTier(byLevel, currentSpellTier, [...knownSpells, ...alreadyPicked]);
    },
    [characterClass, currentSpellTier, getSpellListsForClass, knownSpells, spellSelections, spellStepIndex],
  );

  // ── HP calculations ───────────────────────────────────────────────────────

  const rollNewHp = () => {
    const result = d(1, characterClass.hd);
    setHpRoll(result);
    setHpRerolls((n) => n + 1);
  };

  const hpGainedFromRoll = hpRoll !== null
    ? Math.max(1, hpRoll + conMod)
    : null;

  // For fixed-bonus levels (above HD cap), the gain is just the fixed amount
  const hpGained = isRollLevel ? hpGainedFromRoll : fixedBonus;
  const hpGainedKnown = hpGained !== null;

  // ── Navigation ────────────────────────────────────────────────────────────

  const handleHpConfirm = () => {
    if (needsSpellSelection) {
      setSpellStepIndex(0);
      setStep('spell');
    } else {
      setStep('summary');
    }
  };

  const handleSpellConfirm = () => {
    if (spellStepIndex < spellTiersGained.length - 1) {
      setSpellStepIndex(spellStepIndex + 1);
    } else {
      setStep('summary');
    }
  };

  const handleFinalConfirm = () => {
    const chosenSpells = spellSelections.filter((s): s is string => s !== null);
    onConfirm(hpGained as number, chosenSpells);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="level-up-modal-backdrop" role="dialog" aria-modal="true" aria-label={`Level Up to ${newLevel}`}>
      <div className="level-up-modal">
        <h2 className="level-up-modal-title">
          Level Up — {characterClass.name} Level {newLevel}
        </h2>

        {/* ── Step 1: HP ── */}
        {step === 'hp' && (
          <div className="level-up-modal-step">
            <h3 className="level-up-modal-step-title">Hit Points</h3>

            {isRollLevel ? (
              <>
                <p className="level-up-modal-description">
                  Roll 1d{characterClass.hd}
                  {conMod !== 0 && (
                    <span> and add your Constitution modifier ({conMod > 0 ? '+' : ''}{conMod})</span>
                  )}.
                </p>

                {hpRoll === null ? (
                  <button className="level-up-modal-roll-btn" onClick={rollNewHp}>
                    Roll HP
                  </button>
                ) : (
                  <div className="level-up-modal-hp-result">
                    <p>
                      Rolled: <strong>{hpRoll}</strong>
                      {conMod !== 0 && (
                        <span>
                          {' '}({conMod > 0 ? '+' : ''}{conMod} CON) = <strong>{hpGainedFromRoll}</strong>
                        </span>
                      )}
                      {conMod === 0 && <span> HP gained</span>}
                    </p>
                    <button className="level-up-modal-reroll-btn" onClick={rollNewHp}>
                      Re-roll
                      {hpRerolls > 0 && <span className="level-up-modal-reroll-count"> ({hpRerolls})</span>}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="level-up-modal-fixed-hp">
                <p className="level-up-modal-description">
                  Above the hit-die cap — CON modifier no longer applies.
                </p>
                <p className="level-up-modal-hp-fixed-value">
                  + <strong>{fixedBonus}</strong> HP (fixed)
                </p>
              </div>
            )}

            <div className="level-up-modal-actions">
              <button className="level-up-modal-cancel-btn" onClick={onCancel}>
                Cancel
              </button>
              <button
                className="level-up-modal-next-btn"
                onClick={handleHpConfirm}
                disabled={!hpGainedKnown}
              >
                {needsSpellSelection ? 'Next: Spell →' : 'Next: Summary →'}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Spell Selection ── */}
        {step === 'spell' && (
          <div className="level-up-modal-step">
            <h3 className="level-up-modal-step-title">
              New Spell — {SPELL_LEVEL_LABELS[currentSpellTier] ?? ''} Level
            </h3>
            <p className="level-up-modal-description">
              You gain access to {SPELL_LEVEL_LABELS[currentSpellTier] ?? ''}-level spells.
              Choose one new spell to add to your spell book:
            </p>
            <fieldset className="level-up-modal-spell-list">
              <legend className="level-up-modal-spell-legend">Available spells</legend>
              {availableSpells.map((spell) => (
                <label key={spell.id} className="level-up-modal-spell-option">
                  <input
                    type="radio"
                    name="new-spell"
                    value={spell.id}
                    checked={currentSpellSelection === spell.id}
                    onChange={() => setSpellSelections((prev) => {
                      const next = [...prev];
                      next[spellStepIndex] = spell.id;
                      return next;
                    })}
                  />
                  {spell.name}
                </label>
              ))}
              {availableSpells.length === 0 && (
                <p className="level-up-modal-description">
                  No more spells available to learn.
                </p>
              )}
            </fieldset>
            <div className="level-up-modal-actions">
              <button
                className="level-up-modal-cancel-btn"
                onClick={() => {
                  if (spellStepIndex > 0) {
                    setSpellStepIndex(spellStepIndex - 1);
                  } else {
                    setStep('hp');
                  }
                }}
              >
                ← Back
              </button>
              <button
                className="level-up-modal-next-btn"
                onClick={handleSpellConfirm}
                disabled={availableSpells.length > 0 && !currentSpellSelection}
              >
                {spellStepIndex < spellTiersGained.length - 1 ? 'Next: Spell →' : 'Next: Summary →'}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Summary ── */}
        {step === 'summary' && (
          <div className="level-up-modal-step">
            <h3 className="level-up-modal-step-title">Level Up Summary</h3>
            <ul className="level-up-modal-summary-list">
              <li>
                <strong>Level:</strong> {currentLevel} → {newLevel}
              </li>
              <li>
                <strong>Hit Points:</strong> +{hpGained}
                {' '}(new total: {(characterStatistics.hitPoints ?? 0) + (hpGained as number)})
              </li>

              {nextThac0 < prevThac0 && (
                <li>
                  <strong>THAC0:</strong> {prevThac0} → {nextThac0}
                  {' '}(+{prevThac0 - nextThac0} attack bonus)
                </li>
              )}

              {SAVE_LABELS.map((label, i) => {
                if (nextSaves[i] < prevSaves[i]) {
                  return (
                    <li key={label}>
                      <strong>{label} save:</strong> {prevSaves[i]} → {nextSaves[i]}
                    </li>
                  );
                }
                return null;
              })}

              {nextSlots.length > 0 && (
                <li>
                  <strong>Spell slots:</strong>{' '}
                  {nextSlots.map((count, i) => `${SPELL_LEVEL_LABELS[i]}: ${count}`).join(', ')}
                </li>
              )}

              {spellSelections.filter(Boolean).map((s, i) => (
                <li key={i}>
                  <strong>New spell:</strong> {allSpellsById[s as string]?.name ?? s}
                </li>
              ))}

              {newAbilities.map((ability) => (
                <li key={ability.name}>
                  <strong>New ability:</strong> {ability.name}
                  {ability.description && ` — ${ability.description}`}
                </li>
              ))}
            </ul>

            <div className="level-up-modal-actions">
              <button
                className="level-up-modal-cancel-btn"
                onClick={() => {
                  if (spellTiersGained.length > 0) {
                    setSpellStepIndex(spellTiersGained.length - 1);
                    setStep('spell');
                  } else {
                    setStep('hp');
                  }
                }}
              >
                ← Back
              </button>
              <button className="level-up-modal-confirm-btn" onClick={handleFinalConfirm}>
                Confirm Level Up
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
