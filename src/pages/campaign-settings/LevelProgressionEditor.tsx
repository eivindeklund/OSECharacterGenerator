import { useState } from "react";
import type { LevelEntry } from "../../data/levelProgressionData";
import type { CampaignLevelEntry } from "../../types";

// ── Types ─────────────────────────────────────────────────────────────────────

/** All columns of a level-progression row stored as editable strings. */
export interface LevelRowState {
  level: string;
  xp: string;
  hdDice: string;
  hdBonus: string;
  thac0: string;
  /** Death / Poison */
  save0: string;
  /** Wands */
  save1: string;
  /** Paralysis / Petrify */
  save2: string;
  /** Breath */
  save3: string;
  /** Spells */
  save4: string;
}

// ── Pure helpers (exported for testing) ──────────────────────────────────────

/** Convert a saved (numeric) level entry to an editable string row. */
export function levelEntryToRow(e: CampaignLevelEntry | LevelEntry): LevelRowState {
  return {
    level: String(e.level),
    xp: String(e.xp),
    hdDice: String(e.hdDice),
    hdBonus: String(e.hdBonus),
    thac0: String(e.thac0),
    save0: String(e.saves[0]),
    save1: String(e.saves[1]),
    save2: String(e.saves[2]),
    save3: String(e.saves[3]),
    save4: String(e.saves[4]),
  };
}

/** Parse a string row back to a CampaignLevelEntry; blank strings become 0. */
export function rowToLevelEntry(row: LevelRowState): CampaignLevelEntry {
  const n = (s: string) => (s === "" ? 0 : parseInt(s, 10));
  return {
    level: n(row.level),
    xp: n(row.xp),
    hdDice: n(row.hdDice),
    hdBonus: n(row.hdBonus),
    thac0: n(row.thac0),
    saves: [n(row.save0), n(row.save1), n(row.save2), n(row.save3), n(row.save4)],
  };
}

/** Create a blank row that auto-increments the level number after the last row. */
export function emptyRowAfter(last: LevelRowState | undefined): LevelRowState {
  const nextLevel = last ? (parseInt(last.level, 10) || 0) + 1 : 1;
  return {
    level: String(nextLevel),
    xp: "",
    hdDice: "",
    hdBonus: "0",
    thac0: "",
    save0: "",
    save1: "",
    save2: "",
    save3: "",
    save4: "",
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  rows: LevelRowState[];
  onRowsChange: (rows: LevelRowState[]) => void;
  /** When provided, show a "Copy from base class" button. */
  baseLevels?: readonly LevelEntry[];
}

type ViewMode = "table" | "cards";

export default function LevelProgressionEditor({ rows, onRowsChange, baseLevels }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const patchRow = (i: number, patch: Partial<LevelRowState>) => {
    onRowsChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  };

  const addRow = () => {
    onRowsChange([...rows, emptyRowAfter(rows[rows.length - 1])]);
  };

  const removeRow = (i: number) => {
    onRowsChange(rows.filter((_, idx) => idx !== i));
  };

  const copyFromBase = () => {
    if (baseLevels) onRowsChange(baseLevels.map(levelEntryToRow));
  };

  return (
    <div className="campaign-level-editor">
      {/* Toolbar */}
      <div className="campaign-level-editor-toolbar">
        {baseLevels && (
          <button
            type="button"
            className="button button--sm"
            onClick={copyFromBase}
          >
            Copy from base class
          </button>
        )}
        <button
          type="button"
          className="button button-primary button--sm"
          onClick={addRow}
        >
          Add Level
        </button>
        <div className="campaign-level-view-toggle">
          <button
            type="button"
            className={`button button--sm${viewMode === "table" ? " campaign-level-view-toggle--active" : ""}`}
            onClick={() => setViewMode("table")}
          >
            Table
          </button>
          <button
            type="button"
            className={`button button--sm${viewMode === "cards" ? " campaign-level-view-toggle--active" : ""}`}
            onClick={() => setViewMode("cards")}
          >
            Cards
          </button>
        </div>
      </div>

      {/* Table view */}
      {viewMode === "table" && (
        <div className="campaign-level-table-wrapper">
          <table className="campaign-level-table">
            <thead>
              <tr>
                <th scope="col">Lvl</th>
                <th scope="col">XP</th>
                <th scope="col">HD</th>
                <th scope="col">HD+</th>
                <th scope="col">THAC0</th>
                <th scope="col" title="Death / Poison">D/P</th>
                <th scope="col" title="Wands">Wands</th>
                <th scope="col" title="Paralysis / Petrify">Par</th>
                <th scope="col" title="Breath">Br</th>
                <th scope="col" title="Spells">Sp</th>
                <th scope="col"><span className="sr-only">Remove</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td>
                    <input
                      type="number"
                      className="campaign-level-table-input"
                      aria-label={`Level ${i + 1} number`}
                      value={row.level}
                      min={1}
                      onChange={(e) => patchRow(i, { level: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="campaign-level-table-input campaign-level-table-input--wide"
                      aria-label={`Level ${i + 1} XP`}
                      value={row.xp}
                      min={0}
                      onChange={(e) => patchRow(i, { xp: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="campaign-level-table-input"
                      aria-label={`Level ${i + 1} HD dice`}
                      value={row.hdDice}
                      min={0}
                      onChange={(e) => patchRow(i, { hdDice: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="campaign-level-table-input"
                      aria-label={`Level ${i + 1} HD bonus`}
                      value={row.hdBonus}
                      min={0}
                      onChange={(e) => patchRow(i, { hdBonus: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="campaign-level-table-input"
                      aria-label={`Level ${i + 1} THAC0`}
                      value={row.thac0}
                      min={0}
                      max={25}
                      onChange={(e) => patchRow(i, { thac0: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="campaign-level-table-input"
                      aria-label={`Level ${i + 1} save Death/Poison`}
                      value={row.save0}
                      min={2}
                      max={20}
                      onChange={(e) => patchRow(i, { save0: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="campaign-level-table-input"
                      aria-label={`Level ${i + 1} save Wands`}
                      value={row.save1}
                      min={2}
                      max={20}
                      onChange={(e) => patchRow(i, { save1: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="campaign-level-table-input"
                      aria-label={`Level ${i + 1} save Paralysis`}
                      value={row.save2}
                      min={2}
                      max={20}
                      onChange={(e) => patchRow(i, { save2: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="campaign-level-table-input"
                      aria-label={`Level ${i + 1} save Breath`}
                      value={row.save3}
                      min={2}
                      max={20}
                      onChange={(e) => patchRow(i, { save3: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="campaign-level-table-input"
                      aria-label={`Level ${i + 1} save Spells`}
                      value={row.save4}
                      min={2}
                      max={20}
                      onChange={(e) => patchRow(i, { save4: e.target.value })}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="button button--sm button--danger campaign-level-table-remove"
                      onClick={() => removeRow(i)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <p className="campaign-empty-note">No levels defined. Click "Add Level" or "Copy from base class".</p>
          )}
        </div>
      )}

      {/* Card view */}
      {viewMode === "cards" && (
        <div className="campaign-level-cards-list">
          {rows.length === 0 && (
            <p className="campaign-empty-note">No levels defined. Click "Add Level" or "Copy from base class".</p>
          )}
          {rows.map((row, i) => (
            <div key={i} className="campaign-level-card">
              <div className="campaign-level-card-header">
                <span className="campaign-level-card-title">Level {row.level || "?"}</span>
                <button
                  type="button"
                  className="button button--sm button--danger"
                  onClick={() => removeRow(i)}
                >
                  Remove
                </button>
              </div>
              <div className="campaign-level-card-grid">
                <div className="campaign-level-card-field">
                  <label className="campaign-level-card-label" htmlFor={`card-${i}-level`}>Level #</label>
                  <input
                    id={`card-${i}-level`}
                    type="number"
                    className="campaign-level-card-input"
                    value={row.level}
                    min={1}
                    onChange={(e) => patchRow(i, { level: e.target.value })}
                  />
                </div>
                <div className="campaign-level-card-field">
                  <label className="campaign-level-card-label" htmlFor={`card-${i}-xp`}>XP Required</label>
                  <input
                    id={`card-${i}-xp`}
                    type="number"
                    className="campaign-level-card-input"
                    value={row.xp}
                    min={0}
                    onChange={(e) => patchRow(i, { xp: e.target.value })}
                  />
                </div>
                <div className="campaign-level-card-field">
                  <label className="campaign-level-card-label" htmlFor={`card-${i}-hd`}>Hit Dice</label>
                  <input
                    id={`card-${i}-hd`}
                    type="number"
                    className="campaign-level-card-input"
                    value={row.hdDice}
                    min={0}
                    onChange={(e) => patchRow(i, { hdDice: e.target.value })}
                  />
                </div>
                <div className="campaign-level-card-field">
                  <label className="campaign-level-card-label" htmlFor={`card-${i}-hdbonus`}>HD Bonus (hp)</label>
                  <input
                    id={`card-${i}-hdbonus`}
                    type="number"
                    className="campaign-level-card-input"
                    value={row.hdBonus}
                    min={0}
                    onChange={(e) => patchRow(i, { hdBonus: e.target.value })}
                  />
                </div>
                <div className="campaign-level-card-field">
                  <label className="campaign-level-card-label" htmlFor={`card-${i}-thac0`}>THAC0</label>
                  <input
                    id={`card-${i}-thac0`}
                    type="number"
                    className="campaign-level-card-input"
                    value={row.thac0}
                    min={0}
                    max={25}
                    onChange={(e) => patchRow(i, { thac0: e.target.value })}
                  />
                </div>
                <div className="campaign-level-card-field">
                  <label className="campaign-level-card-label" htmlFor={`card-${i}-save0`}>Save: Death/Poison</label>
                  <input
                    id={`card-${i}-save0`}
                    type="number"
                    className="campaign-level-card-input"
                    value={row.save0}
                    min={2}
                    max={20}
                    onChange={(e) => patchRow(i, { save0: e.target.value })}
                  />
                </div>
                <div className="campaign-level-card-field">
                  <label className="campaign-level-card-label" htmlFor={`card-${i}-save1`}>Save: Wands</label>
                  <input
                    id={`card-${i}-save1`}
                    type="number"
                    className="campaign-level-card-input"
                    value={row.save1}
                    min={2}
                    max={20}
                    onChange={(e) => patchRow(i, { save1: e.target.value })}
                  />
                </div>
                <div className="campaign-level-card-field">
                  <label className="campaign-level-card-label" htmlFor={`card-${i}-save2`}>Save: Paralysis/Petrify</label>
                  <input
                    id={`card-${i}-save2`}
                    type="number"
                    className="campaign-level-card-input"
                    value={row.save2}
                    min={2}
                    max={20}
                    onChange={(e) => patchRow(i, { save2: e.target.value })}
                  />
                </div>
                <div className="campaign-level-card-field">
                  <label className="campaign-level-card-label" htmlFor={`card-${i}-save3`}>Save: Breath</label>
                  <input
                    id={`card-${i}-save3`}
                    type="number"
                    className="campaign-level-card-input"
                    value={row.save3}
                    min={2}
                    max={20}
                    onChange={(e) => patchRow(i, { save3: e.target.value })}
                  />
                </div>
                <div className="campaign-level-card-field">
                  <label className="campaign-level-card-label" htmlFor={`card-${i}-save4`}>Save: Spells</label>
                  <input
                    id={`card-${i}-save4`}
                    type="number"
                    className="campaign-level-card-input"
                    value={row.save4}
                    min={2}
                    max={20}
                    onChange={(e) => patchRow(i, { save4: e.target.value })}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
