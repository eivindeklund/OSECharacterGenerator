import { useState } from "react";
import { SPELL_LIST_REGISTRY } from "../../data/spells";
import type { Campaign, SpellDefinition } from "../../types";
import { toggleSpellAllowed } from "../../utilities/campaignFilterUtils";

// ── Module-level constants ────────────────────────────────────────────────────

const SPELL_LISTS = Object.values(SPELL_LIST_REGISTRY);

/** All spell IDs per list, in level order. */
const SPELL_IDS_BY_LIST: Record<string, string[]> = {};
for (const list of SPELL_LISTS) {
  SPELL_IDS_BY_LIST[list.id] = list.byLevel.flat().map((s) => s.id);
}

// ── Custom spell form ─────────────────────────────────────────────────────────

interface SpellFormState {
  listId: string;
  level: string;
  name: string;
  shortDesc: string;
  duration: string;
  range: string;
}

const EMPTY_SPELL_FORM: SpellFormState = {
  listId: SPELL_LISTS[0]?.id ?? "magic-user",
  level: "1",
  name: "",
  shortDesc: "",
  duration: "",
  range: "",
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  draft: Campaign;
  patch: (partial: Partial<Campaign>) => void;
}

export default function CampaignSpellsTab({ draft, patch }: Props) {
  const [expandedLists, setExpandedLists] = useState<Record<string, boolean>>(
    {},
  );
  const [showSpellForm, setShowSpellForm] = useState(false);
  const [spellForm, setSpellForm] = useState<SpellFormState>(EMPTY_SPELL_FORM);

  const toggleExpanded = (listId: string) => {
    setExpandedLists((prev) => ({ ...prev, [listId]: !prev[listId] }));
  };

  // ── Spell filter helpers ──────────────────────────────────────────────────

  const handleSpellToggle = (
    listId: string,
    spellId: string,
    checked: boolean,
  ) => {
    patch({
      allowedSpellIds: toggleSpellAllowed(
        draft.allowedSpellIds,
        SPELL_IDS_BY_LIST[listId],
        listId,
        spellId,
        checked,
      ),
    });
  };

  const handleAllSpellsToggle = (listId: string, checked: boolean) => {
    if (checked) {
      patch({
        allowedSpellIds: { ...draft.allowedSpellIds, [listId]: null },
      });
    } else {
      patch({
        allowedSpellIds: {
          ...draft.allowedSpellIds,
          [listId]: [...SPELL_IDS_BY_LIST[listId]],
        },
      });
    }
  };

  // ── Custom spell helpers ──────────────────────────────────────────────────

  const handleSaveSpell = () => {
    const level = parseInt(spellForm.level, 10) || 1;
    const spell: SpellDefinition = {
      id: `custom-${slugify(spellForm.name)}-${Date.now()}`,
      name: spellForm.name,
      shortDesc: spellForm.shortDesc || undefined,
      duration: spellForm.duration || undefined,
      range: spellForm.range || undefined,
    };

    const perList = draft.customSpells[spellForm.listId] ?? {};
    const perLevel = perList[level] ?? [];
    patch({
      customSpells: {
        ...draft.customSpells,
        [spellForm.listId]: {
          ...perList,
          [level]: [...perLevel, spell],
        },
      },
    });
    setSpellForm(EMPTY_SPELL_FORM);
    setShowSpellForm(false);
  };

  const handleRemoveCustomSpell = (
    listId: string,
    level: number,
    spellId: string,
  ) => {
    const perList = draft.customSpells[listId] ?? {};
    const perLevel = (perList[level] ?? []).filter((s) => s.id !== spellId);
    const updatedList = { ...perList, [level]: perLevel };
    patch({
      customSpells: { ...draft.customSpells, [listId]: updatedList },
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="campaign-settings-spells">
      {/* ── Spell filter per built-in list ─────────────────────────────────── */}
      {SPELL_LISTS.map((list) => {
        const allowedForList = draft.allowedSpellIds[list.id];
        const allAllowed = allowedForList == null;
        const isExpanded = !!expandedLists[list.id];

        return (
          <div
            key={list.id}
            className="campaign-spell-section"
            data-list-id={list.id}
          >
            <div className="campaign-spell-section-header">
              <button
                className="button button--sm campaign-spell-section-toggle"
                onClick={() => toggleExpanded(list.id)}
                aria-expanded={isExpanded}
              >
                {isExpanded ? "▼" : "▶"}
              </button>
              <span className="campaign-spell-section-header-label">
                {list.name}
              </span>
              <label>
                <input
                  type="checkbox"
                  checked={allAllowed}
                  onChange={(e) =>
                    handleAllSpellsToggle(list.id, e.target.checked)
                  }
                />
                Allow all
              </label>
            </div>

            {isExpanded && (
              <div className="campaign-spell-section-body">
                {list.byLevel.map((spells, levelIndex) => {
                  if (spells.length === 0) return null;
                  const level = levelIndex + 1;
                  return (
                    <div key={level} className="campaign-spell-level">
                      <div className="campaign-spell-level-heading">
                        Level {level}
                      </div>
                      <div className="campaign-spell-items">
                        {spells.map((spell) => {
                          const isAllowed =
                            allAllowed ||
                            !!(allowedForList as string[])?.includes(spell.id);
                          const inputId = `spell-${list.id}-${spell.id}`;
                          return (
                            <label
                              key={spell.id}
                              className="campaign-spell-item"
                              htmlFor={inputId}
                            >
                              <input
                                id={inputId}
                                type="checkbox"
                                checked={isAllowed}
                                onChange={(e) =>
                                  handleSpellToggle(
                                    list.id,
                                    spell.id,
                                    e.target.checked,
                                  )
                                }
                              />
                              {spell.name}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* ── Custom spells ─────────────────────────────────────────────────── */}
      <section className="campaign-custom-spells-section">
        <h4 className="campaign-section-heading">Custom Spells</h4>
        <p className="campaign-stub-note">
          Add spells to an existing spell list.
        </p>

        {Object.entries(draft.customSpells).map(([listId, perLevel]) => {
          if (!perLevel) return null;
          const listName =
            SPELL_LIST_REGISTRY[listId as keyof typeof SPELL_LIST_REGISTRY]
              ?.name ?? listId;
          return (
            <div key={listId} className="campaign-custom-spell-list">
              <h5 className="campaign-checklist-category-name">{listName}</h5>
              {Object.entries(perLevel).map(([levelStr, spells]) => {
                const level = Number(levelStr);
                return spells.map((spell) => (
                  <div
                    key={spell.id}
                    className="campaign-custom-spell-row"
                  >
                    <span className="campaign-custom-spell-row-label">
                      L{level}: {spell.name}
                      {spell.shortDesc ? ` — ${spell.shortDesc}` : ""}
                    </span>
                    <button
                      className="button button--sm button--danger"
                      onClick={() =>
                        handleRemoveCustomSpell(listId, level, spell.id)
                      }
                    >
                      Remove
                    </button>
                  </div>
                ));
              })}
            </div>
          );
        })}

        {showSpellForm ? (
          <div className="campaign-custom-spell-form">
            <div className="campaign-custom-spell-form-grid">
              <div className="campaign-custom-spell-form-field">
                <label
                  className="campaign-custom-spell-form-label"
                  htmlFor="custom-spell-list"
                >
                  Spell List
                </label>
                <select
                  id="custom-spell-list"
                  className="campaign-custom-spell-form-input"
                  value={spellForm.listId}
                  onChange={(e) =>
                    setSpellForm((f) => ({ ...f, listId: e.target.value }))
                  }
                >
                  {SPELL_LISTS.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="campaign-custom-spell-form-field">
                <label
                  className="campaign-custom-spell-form-label"
                  htmlFor="custom-spell-level"
                >
                  Spell Level
                </label>
                <input
                  id="custom-spell-level"
                  type="number"
                  className="campaign-custom-spell-form-input"
                  min={1}
                  max={9}
                  value={spellForm.level}
                  onChange={(e) =>
                    setSpellForm((f) => ({ ...f, level: e.target.value }))
                  }
                />
              </div>
              <div className="campaign-custom-spell-form-field">
                <label
                  className="campaign-custom-spell-form-label"
                  htmlFor="custom-spell-name"
                >
                  Spell Name
                </label>
                <input
                  id="custom-spell-name"
                  type="text"
                  className="campaign-custom-spell-form-input"
                  value={spellForm.name}
                  onChange={(e) =>
                    setSpellForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              <div className="campaign-custom-spell-form-field">
                <label
                  className="campaign-custom-spell-form-label"
                  htmlFor="custom-spell-shortdesc"
                >
                  Short Description
                </label>
                <input
                  id="custom-spell-shortdesc"
                  type="text"
                  className="campaign-custom-spell-form-input"
                  value={spellForm.shortDesc}
                  onChange={(e) =>
                    setSpellForm((f) => ({ ...f, shortDesc: e.target.value }))
                  }
                />
              </div>
              <div className="campaign-custom-spell-form-field">
                <label
                  className="campaign-custom-spell-form-label"
                  htmlFor="custom-spell-duration"
                >
                  Duration
                </label>
                <input
                  id="custom-spell-duration"
                  type="text"
                  className="campaign-custom-spell-form-input"
                  placeholder="e.g. 2 turns"
                  value={spellForm.duration}
                  onChange={(e) =>
                    setSpellForm((f) => ({ ...f, duration: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="campaign-override-form-actions">
              <button
                className="button button-primary button--sm"
                onClick={handleSaveSpell}
                disabled={!spellForm.name}
              >
                Save Spell
              </button>
              <button
                className="button button--sm"
                onClick={() => {
                  setShowSpellForm(false);
                  setSpellForm(EMPTY_SPELL_FORM);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            className="button button-primary button--sm"
            onClick={() => setShowSpellForm(true)}
          >
            Add Custom Spell
          </button>
        )}
      </section>

      {/* ── Custom Spell Lists (stub) ─────────────────────────────────────── */}
      <section>
        <h4 className="campaign-section-heading">Custom Spell Lists</h4>
        {draft.customSpellLists.length === 0 ? (
          <p className="campaign-empty-note">No custom spell lists defined.</p>
        ) : (
          <ul>
            {draft.customSpellLists.map((list) => (
              <li key={list.id}>{list.name}</li>
            ))}
          </ul>
        )}
        <p className="campaign-stub-note">
          Custom spell list creation coming soon.
        </p>
      </section>
    </div>
  );
}
