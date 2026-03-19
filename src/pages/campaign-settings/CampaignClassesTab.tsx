import { useState } from "react";
import classOptionsData, { MAGIC_TYPE_IDS } from "../../data/classOptionsData";
import { DEFAULT_SPELL_SLOT_TABLES } from "../../data/levelProgressionData";
import { SPELL_LIST_REGISTRY } from "../../data/spells";
import type {
    Campaign,
    CampaignClassOverride,
    CampaignNewClass,
    ClassAbility,
} from "../../types";
import { toggleAllowed } from "../../utilities/campaignFilterUtils";

// ── Module-level constants ────────────────────────────────────────────────────

const ALL_CLASS_NAMES = classOptionsData.map((c) => c.name);
const CATEGORIES = ["basic", "advanced", "carcass"] as const;
const CLASSES_BY_CATEGORY = CATEGORIES.reduce(
  (acc, cat) => {
    acc[cat] = classOptionsData.filter((c) => c.category === cat);
    return acc;
  },
  {} as Record<string, typeof classOptionsData>,
);

const ALL_SPELL_LIST_IDS = Object.keys(SPELL_LIST_REGISTRY);
const ALL_SPELL_SLOT_TABLE_IDS = DEFAULT_SPELL_SLOT_TABLES.map((t) => t.id);

// ── Override form state ───────────────────────────────────────────────────────

interface AbilityRowState {
  name: string;
  description: string;
  id: string;
  minLevel: string;    // number as string, or '' for unset
  shownInList: string; // '' = shown (default), 'false' = hidden
}

interface OverrideFormState {
  baseName: string;
  name: string;
  category: string;
  description: string;
  armour: string;
  weapons: string;
  languages: string;
  requirements: string;
  hd: string;
  maxLevel: string;
  primeReqsStr: string;
  xpBonusRule: string;
  spellListId: string;
  magicTypeId: string;
  spellSlotTableId: string;
  canUseThiefTools: string;
  limitedSpellSelection: string;
  abilitiesOverrideEnabled: boolean;
  abilitiesRows: AbilityRowState[];
}

const EMPTY_ABILITY_ROW: AbilityRowState = {
  name: '',
  description: '',
  id: '',
  minLevel: '',
  shownInList: '',
};

const EMPTY_OVERRIDE_FORM: OverrideFormState = {
  baseName: ALL_CLASS_NAMES[0] ?? "",
  name: "",
  category: "",
  description: "",
  armour: "",
  weapons: "",
  languages: "",
  requirements: "",
  hd: "",
  maxLevel: "",
  primeReqsStr: "",
  xpBonusRule: "",
  spellListId: "",
  magicTypeId: "",
  spellSlotTableId: "",
  canUseThiefTools: "",
  limitedSpellSelection: "",
  abilitiesOverrideEnabled: false,
  abilitiesRows: [],
};

function overrideToFormState(cls: CampaignClassOverride): OverrideFormState {
  return {
    baseName: cls.baseName,
    name: cls.name ?? "",
    category: cls.category ?? "",
    description: cls.description ?? "",
    armour: cls.armour ?? "",
    weapons: cls.weapons ?? "",
    languages: cls.languages ?? "",
    requirements: cls.requirements ?? "",
    hd: cls.hd?.toString() ?? "",
    maxLevel: cls.maxLevel?.toString() ?? "",
    primeReqsStr: cls.primeReqs?.join(", ") ?? "",
    xpBonusRule: cls.xpBonusRule ?? "",
    spellListId: cls.spellListId ?? "",
    magicTypeId: cls.magicTypeId ?? "",
    spellSlotTableId: cls.spellSlotTableId ?? "",
    canUseThiefTools:
      cls.canUseThiefTools === undefined
        ? ""
        : cls.canUseThiefTools
          ? "true"
          : "false",
    limitedSpellSelection:
      cls.limitedSpellSelection === undefined
        ? ""
        : cls.limitedSpellSelection
          ? "true"
          : "false",
    abilitiesOverrideEnabled: cls.abilities !== undefined,
    abilitiesRows: cls.abilities !== undefined ? cls.abilities.map(abilityToRow) : [],
  };
}

function abilityToRow(a: ClassAbility): AbilityRowState {
  return {
    name: a.name,
    description: a.description ?? '',
    id: a.id ?? '',
    minLevel: a.minLevel !== undefined ? String(a.minLevel) : '',
    shownInList: a.shownInList === false ? 'false' : '',
  };
}

function rowToAbility(row: AbilityRowState): ClassAbility {
  const ability: ClassAbility = { name: row.name };
  if (row.description) ability.description = row.description;
  if (row.id) ability.id = row.id;
  if (row.minLevel) ability.minLevel = parseInt(row.minLevel, 10);
  if (row.shownInList === 'false') ability.shownInList = false;
  return ability;
}

function formStateToOverride(form: OverrideFormState): CampaignClassOverride {
  const override: CampaignClassOverride = { type: "override", baseName: form.baseName };
  if (form.name) override.name = form.name;
  if (form.category) override.category = form.category as CampaignClassOverride["category"];
  if (form.description) override.description = form.description;
  if (form.armour) override.armour = form.armour;
  if (form.weapons) override.weapons = form.weapons;
  if (form.languages) override.languages = form.languages;
  if (form.requirements) override.requirements = form.requirements;
  if (form.hd) override.hd = parseInt(form.hd, 10);
  if (form.maxLevel) override.maxLevel = parseInt(form.maxLevel, 10);
  if (form.primeReqsStr)
    override.primeReqs = form.primeReqsStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  if (form.xpBonusRule) override.xpBonusRule = form.xpBonusRule;
  if (form.spellListId) override.spellListId = form.spellListId;
  if (form.magicTypeId) override.magicTypeId = form.magicTypeId;
  if (form.spellSlotTableId) override.spellSlotTableId = form.spellSlotTableId;
  if (form.canUseThiefTools)
    override.canUseThiefTools = form.canUseThiefTools === "true";
  if (form.limitedSpellSelection)
    override.limitedSpellSelection = form.limitedSpellSelection === "true";
  if (form.abilitiesOverrideEnabled)
    override.abilities = form.abilitiesRows
      .filter((r) => r.name.trim() !== '')
      .map(rowToAbility);
  return override;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  draft: Campaign;
  patch: (partial: Partial<Campaign>) => void;
}

export default function CampaignClassesTab({ draft, patch }: Props) {
  // null = not editing; <index> = editing customClasses[index]; length = adding new
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [overrideForm, setOverrideForm] = useState<OverrideFormState>(EMPTY_OVERRIDE_FORM);

  const allAllowed = draft.allowedClassNames === null;

  const handleAllowedClassToggle = (name: string, checked: boolean) => {
    patch({
      allowedClassNames: toggleAllowed(
        draft.allowedClassNames,
        ALL_CLASS_NAMES,
        name,
        checked,
      ),
    });
  };

  const patchForm = (p: Partial<OverrideFormState>) =>
    setOverrideForm((prev) => ({ ...prev, ...p }));

  const patchAbilityRow = (i: number, p: Partial<AbilityRowState>) =>
    setOverrideForm((prev) => {
      const rows = prev.abilitiesRows.map((r, idx) => idx === i ? { ...r, ...p } : r);
      return { ...prev, abilitiesRows: rows };
    });

  const addAbilityRow = () =>
    setOverrideForm((prev) => ({
      ...prev,
      abilitiesRows: [...prev.abilitiesRows, { ...EMPTY_ABILITY_ROW }],
    }));

  const removeAbilityRow = (i: number) =>
    setOverrideForm((prev) => ({
      ...prev,
      abilitiesRows: prev.abilitiesRows.filter((_, idx) => idx !== i),
    }));

  const handleAddOverride = () => {
    setOverrideForm({ ...EMPTY_OVERRIDE_FORM, baseName: ALL_CLASS_NAMES[0] ?? "" });
    setEditingIndex(draft.customClasses.length);
  };

  const handleEditOverride = (index: number) => {
    const cls = draft.customClasses[index];
    if (cls.type !== "override") return;
    setOverrideForm(overrideToFormState(cls));
    setEditingIndex(index);
  };

  const handleSaveOverride = () => {
    if (editingIndex === null) return;
    const override = formStateToOverride(overrideForm);
    const next = [...draft.customClasses];
    if (editingIndex >= next.length) {
      next.push(override);
    } else {
      next[editingIndex] = override;
    }
    patch({ customClasses: next });
    setEditingIndex(null);
  };

  const handleRemoveCustomClass = (index: number) => {
    const next = draft.customClasses.filter((_, i) => i !== index);
    if (editingIndex === index) setEditingIndex(null);
    patch({ customClasses: next });
  };

  const overrides = draft.customClasses.filter(
    (c): c is CampaignClassOverride => c.type === "override",
  );
  const newClasses = draft.customClasses.filter(
    (c): c is CampaignNewClass => c.type === "new",
  );

  return (
    <div className="campaign-settings-classes">
      {/* ── Class Filter ──────────────────────────────────────────────────── */}
      <section className="campaign-checklist">
        <div className="campaign-checklist-heading">
          Allowed Classes
          <label className="campaign-checklist-all">
            <input
              type="checkbox"
              aria-label="All classes"
              checked={allAllowed}
              onChange={(e) =>
                patch({
                  allowedClassNames: e.target.checked ? null : [],
                })
              }
            />
            All classes
          </label>
        </div>

        {CATEGORIES.map((cat) => (
          <div key={cat} className="campaign-checklist-category">
            <div className="campaign-checklist-category-name">{cat}</div>
            <div className="campaign-checklist-items">
              {CLASSES_BY_CATEGORY[cat].map((cls) => {
                const checked =
                  allAllowed ||
                  (draft.allowedClassNames?.includes(cls.name) ?? false);
                const id = `class-checkbox-${cls.name.replace(/\s+/g, "-")}`;
                return (
                  <label key={cls.name} className="campaign-checklist-item" htmlFor={id}>
                    <input
                      id={id}
                      type="checkbox"
                      aria-label={cls.name}
                      checked={checked}
                      onChange={(e) =>
                        handleAllowedClassToggle(cls.name, e.target.checked)
                      }
                    />
                    {cls.name}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* ── Class Overrides ───────────────────────────────────────────────── */}
      <h4 className="campaign-section-heading">Class Overrides</h4>

      {overrides.length === 0 && editingIndex === null ? (
        <p className="campaign-empty-note">No custom classes defined yet.</p>
      ) : (
        <ul className="campaign-override-list">
          {draft.customClasses.map((cls, i) => {
            if (cls.type !== "override") return null;
            const renamed =
              cls.name && cls.name !== cls.baseName ? ` → "${cls.name}"` : "";
            return (
              <li key={i} className="campaign-override-item">
                <span className="campaign-override-item-label">
                  {`Override: ${cls.baseName}${renamed}`}
                </span>
                <button
                  className="button button--sm"
                  onClick={() => handleEditOverride(i)}
                >
                  Edit
                </button>
                <button
                  className="button button--sm button--danger"
                  onClick={() => handleRemoveCustomClass(i)}
                >
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {editingIndex !== null && (
        <div className="campaign-override-form">
          <h5 className="campaign-override-form-title">
            {editingIndex >= draft.customClasses.length
              ? "Add Class Override"
              : "Edit Class Override"}
          </h5>

          <div className="campaign-override-form-grid">
            {/* Base class */}
            <div className="campaign-override-form-field">
              <label className="campaign-override-form-label" htmlFor="override-baseName">
                Base Class
              </label>
              <select
                id="override-baseName"
                className="campaign-override-form-input"
                value={overrideForm.baseName}
                onChange={(e) => patchForm({ baseName: e.target.value })}
              >
                {classOptionsData.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Name override */}
            <div className="campaign-override-form-field">
              <label className="campaign-override-form-label" htmlFor="override-name">
                Name (override)
              </label>
              <input
                id="override-name"
                type="text"
                className="campaign-override-form-input"
                placeholder="Leave empty to keep original"
                value={overrideForm.name}
                onChange={(e) => patchForm({ name: e.target.value })}
              />
            </div>

            {/* HD */}
            <div className="campaign-override-form-field">
              <label className="campaign-override-form-label" htmlFor="override-hd">
                Hit Die (d__)
              </label>
              <input
                id="override-hd"
                type="number"
                className="campaign-override-form-input"
                min={4}
                max={12}
                placeholder="e.g. 8"
                value={overrideForm.hd}
                onChange={(e) => patchForm({ hd: e.target.value })}
              />
            </div>

            {/* Max level */}
            <div className="campaign-override-form-field">
              <label className="campaign-override-form-label" htmlFor="override-maxLevel">
                Max Level
              </label>
              <input
                id="override-maxLevel"
                type="number"
                className="campaign-override-form-input"
                min={1}
                max={36}
                placeholder="e.g. 14"
                value={overrideForm.maxLevel}
                onChange={(e) => patchForm({ maxLevel: e.target.value })}
              />
            </div>

            {/* Category */}
            <div className="campaign-override-form-field">
              <label className="campaign-override-form-label" htmlFor="override-category">
                Category
              </label>
              <select
                id="override-category"
                className="campaign-override-form-input"
                value={overrideForm.category}
                onChange={(e) => patchForm({ category: e.target.value })}
              >
                <option value="">— keep original —</option>
                <option value="basic">Basic</option>
                <option value="advanced">Advanced</option>
                <option value="carcass">Carcass</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {/* Spell list */}
            <div className="campaign-override-form-field">
              <label className="campaign-override-form-label" htmlFor="override-spellListId">
                Spell List
              </label>
              <select
                id="override-spellListId"
                className="campaign-override-form-input"
                value={overrideForm.spellListId}
                onChange={(e) => patchForm({ spellListId: e.target.value })}
              >
                <option value="">— none —</option>
                {ALL_SPELL_LIST_IDS.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </div>

            {/* Magic type */}
            <div className="campaign-override-form-field">
              <label className="campaign-override-form-label" htmlFor="override-magicTypeId">
                Magic Type
              </label>
              <select
                id="override-magicTypeId"
                className="campaign-override-form-input"
                value={overrideForm.magicTypeId}
                onChange={(e) => patchForm({ magicTypeId: e.target.value })}
              >
                <option value="">— none —</option>
                {MAGIC_TYPE_IDS.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </div>

            {/* Spell slot table */}
            <div className="campaign-override-form-field">
              <label className="campaign-override-form-label" htmlFor="override-spellSlotTableId">
                Spell Slot Table
              </label>
              <select
                id="override-spellSlotTableId"
                className="campaign-override-form-input"
                value={overrideForm.spellSlotTableId}
                onChange={(e) => patchForm({ spellSlotTableId: e.target.value })}
              >
                <option value="">— none —</option>
                {ALL_SPELL_SLOT_TABLE_IDS.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </div>

            {/* Armour */}
            <div className="campaign-override-form-field campaign-override-form-field--full">
              <label className="campaign-override-form-label" htmlFor="override-armour">
                Armour
              </label>
              <input
                id="override-armour"
                type="text"
                className="campaign-override-form-input"
                placeholder="e.g. Any armour + shield"
                value={overrideForm.armour}
                onChange={(e) => patchForm({ armour: e.target.value })}
              />
            </div>

            {/* Weapons */}
            <div className="campaign-override-form-field campaign-override-form-field--full">
              <label className="campaign-override-form-label" htmlFor="override-weapons">
                Weapons
              </label>
              <input
                id="override-weapons"
                type="text"
                className="campaign-override-form-input"
                placeholder="e.g. Any"
                value={overrideForm.weapons}
                onChange={(e) => patchForm({ weapons: e.target.value })}
              />
            </div>

            {/* Requirements */}
            <div className="campaign-override-form-field campaign-override-form-field--full">
              <label className="campaign-override-form-label" htmlFor="override-requirements">
                Requirements
              </label>
              <input
                id="override-requirements"
                type="text"
                className="campaign-override-form-input"
                placeholder="e.g. STR 9+"
                value={overrideForm.requirements}
                onChange={(e) => patchForm({ requirements: e.target.value })}
              />
            </div>

            {/* Prime requisites */}
            <div className="campaign-override-form-field campaign-override-form-field--full">
              <label className="campaign-override-form-label" htmlFor="override-primeReqs">
                Prime Requisites (comma-separated ability names)
              </label>
              <input
                id="override-primeReqs"
                type="text"
                className="campaign-override-form-input"
                placeholder="e.g. strength, dexterity"
                value={overrideForm.primeReqsStr}
                onChange={(e) => patchForm({ primeReqsStr: e.target.value })}
              />
            </div>

            {/* XP bonus rule */}
            <div className="campaign-override-form-field campaign-override-form-field--full">
              <label className="campaign-override-form-label" htmlFor="override-xpBonusRule">
                XP Bonus Rule
              </label>
              <input
                id="override-xpBonusRule"
                type="text"
                className="campaign-override-form-input"
                placeholder="e.g. str>=13: +5%, str>=16: +10%"
                value={overrideForm.xpBonusRule}
                onChange={(e) => patchForm({ xpBonusRule: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="campaign-override-form-field campaign-override-form-field--full">
              <label className="campaign-override-form-label" htmlFor="override-description">
                Description
              </label>
              <textarea
                id="override-description"
                className="campaign-override-form-input"
                rows={3}
                value={overrideForm.description}
                onChange={(e) => patchForm({ description: e.target.value })}
              />
            </div>

            {/* Abilities override */}
            <div className="campaign-override-form-field campaign-override-form-field--full">
              <label className="campaign-override-form-label">
                <input
                  type="checkbox"
                  aria-label="Override abilities"
                  checked={overrideForm.abilitiesOverrideEnabled}
                  onChange={(e) =>
                    patchForm({ abilitiesOverrideEnabled: e.target.checked })
                  }
                />
                {" "}Override class abilities
              </label>
              {overrideForm.abilitiesOverrideEnabled && (
                <>
                  {overrideForm.abilitiesRows.length === 0 ? (
                    <p className="campaign-empty-note">No abilities. Class will have none.</p>
                  ) : (
                    <ul className="campaign-ability-list">
                      {overrideForm.abilitiesRows.map((row, i) => (
                        <li key={i} className="campaign-ability-row">
                          <div className="campaign-ability-row-fields">
                            <input
                              type="text"
                              className="campaign-ability-row-name"
                              placeholder="Ability name (required)"
                              aria-label={`Ability ${i + 1} name`}
                              value={row.name}
                              onChange={(e) => patchAbilityRow(i, { name: e.target.value })}
                            />
                            <input
                              type="text"
                              className="campaign-ability-row-desc"
                              placeholder="Description"
                              aria-label={`Ability ${i + 1} description`}
                              value={row.description}
                              onChange={(e) => patchAbilityRow(i, { description: e.target.value })}
                            />
                            <div className="campaign-ability-row-advanced">
                              <input
                                type="text"
                                className="campaign-ability-row-id"
                                placeholder="ID (optional)"
                                aria-label={`Ability ${i + 1} id`}
                                value={row.id}
                                onChange={(e) => patchAbilityRow(i, { id: e.target.value })}
                              />
                              <input
                                type="number"
                                className="campaign-ability-row-minlevel"
                                placeholder="Min level"
                                aria-label={`Ability ${i + 1} min level`}
                                min={1}
                                value={row.minLevel}
                                onChange={(e) => patchAbilityRow(i, { minLevel: e.target.value })}
                              />
                              <select
                                className="campaign-ability-row-shown"
                                aria-label={`Ability ${i + 1} shown in list`}
                                value={row.shownInList}
                                onChange={(e) => patchAbilityRow(i, { shownInList: e.target.value })}
                              >
                                <option value="">Shown in list</option>
                                <option value="false">Hidden</option>
                              </select>
                            </div>
                          </div>
                          <button
                            className="button button--sm button--danger"
                            onClick={() => removeAbilityRow(i)}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <button
                    className="button button-primary button--sm"
                    onClick={addAbilityRow}
                  >
                    Add Ability
                  </button>
                </>
              )}
            </div>

            {/* Boolean flags */}
            <div className="campaign-override-form-field">
              <label className="campaign-override-form-label" htmlFor="override-canUseThiefTools">
                Can Use Thief Tools
              </label>
              <select
                id="override-canUseThiefTools"
                className="campaign-override-form-input"
                value={overrideForm.canUseThiefTools}
                onChange={(e) => patchForm({ canUseThiefTools: e.target.value })}
              >
                <option value="">— keep original —</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            <div className="campaign-override-form-field">
              <label className="campaign-override-form-label" htmlFor="override-limitedSpellSelection">
                Limited Spell Selection
              </label>
              <select
                id="override-limitedSpellSelection"
                className="campaign-override-form-input"
                value={overrideForm.limitedSpellSelection}
                onChange={(e) =>
                  patchForm({ limitedSpellSelection: e.target.value })
                }
              >
                <option value="">— keep original —</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>

          <div className="campaign-override-form-actions">
            <button
              className="button button-primary button--sm"
              onClick={handleSaveOverride}
            >
              Save Override
            </button>
            <button
              className="button button--sm"
              onClick={() => setEditingIndex(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {editingIndex === null && (
        <button
          className="button button-primary button--sm"
          onClick={handleAddOverride}
        >
          Add Override
        </button>
      )}

      {/* ── New Classes (listed, creation deferred) ───────────────────────── */}
      {newClasses.length > 0 && (
        <>
          <h4 className="campaign-section-heading">Custom Classes</h4>
          <ul className="campaign-override-list">
            {newClasses.map((cls) => {
              const realIndex = draft.customClasses.indexOf(cls);
              return (
                <li key={realIndex} className="campaign-override-item">
                  <span className="campaign-override-item-label">
                    New Class: {cls.name}
                  </span>
                  <button
                    className="button button--sm button--danger"
                    onClick={() => handleRemoveCustomClass(realIndex)}
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
